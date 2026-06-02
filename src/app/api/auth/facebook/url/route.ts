import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`;
  
  // Scopes required for marketing and page management
  const scopes = [
    'public_profile',
    'email',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_manage_metadata',
    'instagram_basic',
    'instagram_content_publish',
    'ads_management'
  ].join(',');

  const facebookAuthUrl = `https://www.facebook.com/${process.env.FACEBOOK_API_VERSION || 'v18.0'}/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code`;

  return NextResponse.json({ url: facebookAuthUrl });
}
