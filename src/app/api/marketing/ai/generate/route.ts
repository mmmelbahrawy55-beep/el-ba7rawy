import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    const { prompt, accountId } = await req.json()
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here' || process.env.OPENAI_API_KEY === '') {
      // Mock AI Response for testing/demo
      const mockResponses = [
        `مرحباً! إليك منشور مقترح لشركة "ELBA7RAWY" بخصوص ${prompt}:
        
🚀 هل تبحث عن التميز في عالم الدعاية والإعلان؟ 

في ELBA7RAWY، نحول أفكارك إلى واقع ملموس بأحدث التقنيات وأفضل التصميمات. 
✨ خدماتنا تشمل:
✅ طباعة لاندسكيب وجودة عالية
✅ تصميمات سوشيال ميديا احترافية
✅ تجهيز معارض ومؤتمرات

تواصل معنا الآن وانطلق بمشروعك للقمة! 📈
#ELBA7RAWY #دعاية_وإعلان #تسويق_رقمي #نجاح`,
        `جديدنا في "ELBA7RAWY"! 🌟

بخصوص ${prompt}، نقدم لكم الحلول الأمثل والأكثر إبداعاً في السوق المصري. 
نحن لا نصنع مجرد إعلان، نحن نصنع علامة تجارية تترك بصمة. ✍️

📞 اتصل بنا اليوم للاستشارة المجانية.
#إبداع #تسويق #براندينج #البحراوي`
      ]
      
      const content = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      
      return NextResponse.json({ 
        content,
        aiGenerated: true,
        status: 'draft',
        accountId,
        isMock: true
      })
    }

    const config = await db.marketingAIConfig.findUnique({
      where: { id: 'marketing-ai-config' }
    })

    const brandVoice = config?.brandVoice || 'professional'
    const targetAudience = config?.targetAudience || 'العملاء المهتمين بالدعاية والإعلان'

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `أنت خبير تسويق رقمي لشركة "ELBA7RAWY". 
          نبرة الصوت: ${brandVoice}. 
          الجمهور المستهدف: ${targetAudience}.
          يجب أن يكون المنشور جذاباً، باللغة العربية، ويتضمن كلمات مفتاحية وهاشتاجات مناسبة.`
        },
        {
          role: "user",
          content: `قم بإنشاء منشور تسويقي عن: ${prompt}`
        }
      ],
      temperature: 0.7,
    })

    const content = response.choices[0].message.content

    // Log the AI activity
    await db.activityLog.create({
      data: {
        action: 'AI_CONTENT_GENERATION',
        details: `تم توليد محتوى ذكي بخصوص: ${prompt.substring(0, 30)}...`,
        userId: 'marketing-ai-bot'
      }
    })

    return NextResponse.json({ 
      content,
      aiGenerated: true,
      status: 'draft',
      accountId
    })
  } catch (error: any) {
    console.error('Error generating AI content:', error)
    return NextResponse.json({ 
      error: `فشل الاتصال بـ OpenAI: ${error.message}` 
    }, { status: 500 })
  }
}
