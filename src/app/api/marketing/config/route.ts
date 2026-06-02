import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let config = await db.marketingAIConfig.findUnique({
      where: { id: 'marketing-ai-config' }
    })

    if (!config) {
      config = await db.marketingAIConfig.create({
        data: {
          id: 'marketing-ai-config',
          isEnabled: false,
          postingFrequency: 'daily',
          brandVoice: 'professional',
          autoReply: true
        }
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching marketing config:', error)
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    const config = await db.marketingAIConfig.upsert({
      where: { id: 'marketing-ai-config' },
      update: {
        ...body,
        updatedAt: new Date()
      },
      create: {
        id: 'marketing-ai-config',
        ...body
      }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating marketing config:', error)
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
