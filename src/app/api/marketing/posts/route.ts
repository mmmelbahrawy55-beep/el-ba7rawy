import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publishToFacebook, publishToInstagram } from '@/lib/social-apis'
import { withErrorHandling } from "@/lib/api-utils";

export async function GET() {
  try {
    const posts = await db.marketingPost.findMany({
      include: {
        account: true,
        performance: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { accountId, content, imageUrl, status } = body

    const account = await db.socialAccount.findUnique({
      where: { id: accountId }
    })

    if (!account) {
      return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 })
    }

    let result = null

    // Real API call if status is 'published'
    if (status === 'published' && account.accessToken) {
      try {
        if (account.platform === 'facebook') {
          result = await publishToFacebook(account.id, account.accessToken, content, imageUrl)
        } else if (account.platform === 'instagram') {
          if (!imageUrl) throw new Error('إنستجرام يتطلب صورة للنشر')
          result = await publishToInstagram(account.id, account.accessToken, imageUrl, content)
        }
      } catch (apiError: any) {
        return NextResponse.json({ 
          error: `فشل النشر الحقيقي على المنصة: ${apiError.message}` 
        }, { status: 500 })
      }
    }

    const post = await db.marketingPost.create({
      data: {
        ...body,
        publishedAt: status === 'published' ? new Date() : null
      }
    })

    // Log the activity
    await db.activityLog.create({
      data: {
        action: status === 'published' ? 'MARKETING_POST_PUBLISHED' : 'MARKETING_POST_CREATED',
        details: `تم ${status === 'published' ? 'نشر' : 'إنشاء'} منشور على ${account.platform}: ${content.substring(0, 50)}...`,
        userId: 'admin'
      }
    })

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: `فشل إنشاء المنشور: ${error.message}` }, { status: 500 })
  }
}
