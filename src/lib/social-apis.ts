import axios from 'axios';

const FACEBOOK_API_VERSION = 'v18.0';

export async function publishToFacebook(pageId: string, accessToken: string, message: string, imageUrl?: string) {
  try {
    const endpoint = imageUrl 
      ? `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${pageId}/photos`
      : `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${pageId}/feed`;

    const params: any = {
      access_token: accessToken,
      [imageUrl ? 'caption' : 'message']: message,
    };

    if (imageUrl) {
      params.url = imageUrl;
    }

    const response = await axios.post(endpoint, params);
    return response.data;
  } catch (error: any) {
    console.error('Facebook API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'فشل النشر على فيسبوك');
  }
}

export async function publishToInstagram(businessId: string, accessToken: string, imageUrl: string, caption: string) {
  try {
    // 1. Create Media Container
    const containerRes = await axios.post(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${businessId}/media`,
      {
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
      }
    );

    const creationId = containerRes.data.id;

    // 2. Publish Container
    const publishRes = await axios.post(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${businessId}/media_publish`,
      {
        creation_id: creationId,
        access_token: accessToken,
      }
    );

    return publishRes.data;
  } catch (error: any) {
    console.error('Instagram API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'فشل النشر على إنستجرام');
  }
}

export async function getFacebookComments(pageId: string, accessToken: string, postId: string) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${postId}/comments`,
      { params: { access_token: accessToken } }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Facebook Get Comments Error:', error.response?.data || error.message);
    return []; // Return empty if failed to avoid breaking AI flow
  }
}

export async function replyToFacebookComment(commentId: string, accessToken: string, message: string) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${commentId}/comments`,
      {
        message: message,
        access_token: accessToken,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Facebook Reply Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'فشل الرد على التعليق');
  }
}
