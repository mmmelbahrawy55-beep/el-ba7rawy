import { NextResponse } from 'next/server'
import { db } from '@/lib/db';
import { encrypt } from '@/lib/encryption';
import axios from 'axios';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    console.error('Facebook OAuth Error:', error);
    // Redirect back to admin with error
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?fb_error=${error || 'no_code'}`);
  }

  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`;
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v18.0';

    // 1. Exchange code for short-lived access token
    const tokenResponse = await axios.get(`https://graph.facebook.com/${apiVersion}/oauth/access_token`, {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code: code,
      },
    });

    const shortLivedToken = tokenResponse.data.access_token;

    // 2. Exchange for long-lived access token (60 days)
    const longLivedTokenResponse = await axios.get(`https://graph.facebook.com/${apiVersion}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken,
      },
    });

    const longLivedToken = longLivedTokenResponse.data.access_token;

    // 3. Get User Profile and Permissions
    const profileResponse = await axios.get(`https://graph.facebook.com/${apiVersion}/me`, {
      params: {
        fields: 'id,name,email,picture,permissions',
        access_token: longLivedToken,
      },
    });

    const userData = profileResponse.data;
    const grantedScopes = userData.permissions?.data
      .filter((p: any) => p.status === 'granted')
      .map((p: any) => p.permission)
      .join(',');

    const requiredScopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish'
    ];

    const missingScopes = requiredScopes
      .filter(scope => !grantedScopes.includes(scope))
      .join(',');

    // 4. Save/Update in Database
    const encryptedToken = encrypt(longLivedToken);

    await db.socialAccount.upsert({
      where: { accountId: userData.id },
      update: {
        accountName: userData.name,
        accessToken: encryptedToken,
        grantedScopes,
        missingScopes,
        profilePicture: userData.picture?.data?.url,
        lastVerified: new Date(),
        isActive: true,
      },
      create: {
        platform: 'facebook',
        accountId: userData.id,
        accountName: userData.name,
        accessToken: encryptedToken,
        grantedScopes,
        missingScopes,
        profilePicture: userData.picture?.data?.url,
        isActive: true,
      },
    });

    // 5. Log the success
    await db.socialLinkingLog.create({
      data: {
        platform: 'facebook',
        action: 'link_success',
        status: 'success',
        details: JSON.stringify({ accountId: userData.id, scopes: grantedScopes }),
      },
    });

    // Redirect back to admin dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?fb_success=true&missing_scopes=${missingScopes}`);

  } catch (err: any) {
    console.error('Facebook Callback Error:', err.response?.data || err.message);
    
    // Log the failure
    await db.socialLinkingLog.create({
      data: {
        platform: 'facebook',
        action: 'link_failed',
        status: 'failure',
        errorMessage: err.message,
      },
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin?fb_error=server_error`);
  }
}
