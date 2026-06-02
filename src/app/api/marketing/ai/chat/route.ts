import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { db } from '@/lib/db'
import { getFacebookComments, replyToFacebookComment, publishToFacebook, publishToInstagram } from '@/lib/social-apis'
import { memoryCache } from '@/lib/cache-utils'
import { z } from 'zod'

// --- 1. Security & Validation Schema ---
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'model', 'system']),
    content: z.string().min(1)
  })),
  agentId: z.string().optional().default('central_ai'),
  agentPrompt: z.string().optional()
})

// --- 2. Advanced Caching Logic ---
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

async function getCachedMarketingContext() {
  const cacheKey = 'marketing_full_context';
  const cached = memoryCache.get<any>(cacheKey);
  if (cached) return cached;

  try {
    const [config, knowledgeBase, socialAccount, stats] = await Promise.all([
      db.marketingAIConfig.findUnique({ where: { id: 'marketing-ai-config' } }).catch(() => null),
      db.aIKnowledgeBase.findMany({ take: 30, orderBy: { updatedAt: 'desc' } }).catch(() => []),
      db.socialAccount.findFirst({ where: { platform: 'facebook', isActive: true } }).catch(() => null),
      db.order.count().then(async (totalOrders: number) => {
        const [totalClients, totalMessages, totalProjects] = await Promise.all([
          db.client.count().catch(() => 0),
          db.message.count().catch(() => 0),
          db.project.count().catch(() => 0)
        ]);
        return { totalOrders, totalClients, totalMessages, totalProjects };
      }).catch(() => ({ totalOrders: 0, totalClients: 0, totalMessages: 0, totalProjects: 0 }))
    ]);

    const context = { config, knowledgeBase, socialAccount, stats };
    memoryCache.set(cacheKey, context, CACHE_TTL);
    return context;
  } catch (error) {
    console.error('Context retrieval failed:', error);
    return { config: null, knowledgeBase: [], socialAccount: null, stats: { totalOrders: 0, totalClients: 0, totalMessages: 0, totalProjects: 0 } };
  }
}

// --- 3. Optimized AI Engine & Tools ---
const tools = [
  {
    functionDeclarations: [
      {
        name: 'get_marketing_insights',
        description: 'Get advanced analytics and insights for marketing performance.',
      },
      {
        name: 'generate_daily_marketing_plan',
        description: 'Generate a daily marketing plan with tasks, goals, and KPIs.',
      },
      {
        name: 'analyze_market_trends',
        description: 'Analyze market trends, competitors, or user behavior patterns.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            topic: { type: SchemaType.STRING, description: 'Topic to analyze' },
            modelType: { type: SchemaType.STRING, description: 'SWOT, PESTEL, etc.' }
          },
          required: ['topic']
        }
      },
      {
        name: 'create_social_post',
        description: 'Create and optionally publish a marketing post.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            content: { type: SchemaType.STRING },
            platform: { type: SchemaType.STRING },
            status: { type: SchemaType.STRING },
            imageUrl: { type: SchemaType.STRING }
          },
          required: ['content', 'platform']
        }
      },
      {
        name: 'manage_social_interactions',
        description: 'Fetch or reply to social media comments.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            action: { type: SchemaType.STRING },
            platform: { type: SchemaType.STRING },
            postId: { type: SchemaType.STRING },
            commentId: { type: SchemaType.STRING },
            message: { type: SchemaType.STRING }
          },
          required: ['action', 'platform']
        }
      },
      {
        name: 'manage_knowledge_base',
        description: 'Manage entries in the long-term knowledge base.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            action: { type: SchemaType.STRING },
            category: { type: SchemaType.STRING },
            topic: { type: SchemaType.STRING },
            content: { type: SchemaType.STRING }
          },
          required: ['action']
        }
      },
      {
        name: 'system_self_optimize',
        description: 'Self-improve the system rules or knowledge.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            reason: { type: SchemaType.STRING },
            newRule: { type: SchemaType.STRING }
          },
          required: ['reason', 'newRule']
        }
      },
      {
        name: 'delegate_task',
        description: 'Delegate task to specialized agents.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            agentId: { type: SchemaType.STRING },
            taskDescription: { type: SchemaType.STRING }
          },
          required: ['agentId', 'taskDescription']
        }
      },
      {
        name: 'audit_platform_content',
        description: 'Perform a marketing and SEO audit of platform products or posts.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            type: { type: SchemaType.STRING, description: 'Target: products, posts' },
            id: { type: SchemaType.STRING, description: 'Optional specific ID to audit' }
          },
          required: ['type']
        }
      },
      {
        name: 'generate_marketing_image',
        description: 'Generate a high-quality professional marketing image based on a detailed prompt.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            prompt: { type: SchemaType.STRING, description: 'Detailed visual description for the AI image generator' },
            aspectRatio: { type: SchemaType.STRING, description: '1:1, 16:9, or 4:5' }
          },
          required: ['prompt']
        }
      },
      {
        name: 'run_autonomous_marketing_loop',
        description: 'Start an autonomous loop to handle a complete campaign: idea -> post -> publish -> monitor -> report.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            goal: { type: SchemaType.STRING, description: 'The main goal: sales, branding, etc.' },
            durationDays: { type: SchemaType.NUMBER, description: 'How long the loop should run' }
          },
          required: ['goal']
        }
      }
    ]
  }
]

// --- 4. Main API Handler (Streaming Optimized) ---
export async function POST(req: Request) {
  const encoder = new TextEncoder();
  
  // الحل البديل: استخدام مكتبة fetch مباشرة لتجاوز أي مشاكل في SDK
  const marketingConfig = await db.marketingAIConfig.findUnique({
    where: { id: 'marketing-ai-config' }
  });
  
  let apiKey = marketingConfig?.keywords?.trim() || process.env.GEMINI_API_KEY;
  
  if (apiKey && !apiKey.startsWith('AIzaSy')) {
    // محاولة ذكية لإضافة البادئة إذا كانت مفقودة وكان المفتاح يبدو كـ Google API Key
    if (apiKey.length > 20 && !apiKey.includes('.')) {
      apiKey = 'AIzaSy' + apiKey;
    }
  }

  if (!apiKey || apiKey.length < 20) {
    return new Response(JSON.stringify({ error: 'يرجى التأكد من وضع مفتاح API الصحيح في الإعدادات.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // 🛡️ SECURITY: Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'anon';
    const rateLimitKey = `rate_limit_${ip}`;
    const requests = memoryCache.get<number>(rateLimitKey) || 0;
    if (requests > 200) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    memoryCache.set(rateLimitKey, requests + 1, 60000);

    // ✅ VALIDATION
    const body = await req.json();
    const validation = ChatRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      return new Response(JSON.stringify({ error: `بيانات غير صالحة: ${errorMsg}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { messages, agentPrompt, agentId } = validation.data;
    const lastUserMsg = messages[messages.length - 1];

    // ⚡ PERFORMANCE: Parallel Context Retrieval
    const { config, knowledgeBase, socialAccount, stats } = await getCachedMarketingContext();

    // 🧠 AI ENGINE: Professional Senior Intelligence Initialization
    const systemInstruction = `أنت "الذكاء المركزي الخارق" (Central Super-Intelligence) لمنصة "البحراوي".
هويتك الحالية هي: ${agentPrompt || 'الذكاء الشامل'}.
أنت نظام تنفيذ حقيقي (Real-world Execution System) قادر على إدارة الوكالة بالكامل.

قواعد صارمة:
1. الرد دائماً: لا ترسل رداً فارغاً أبداً. إذا لم يكن لديك ما تقوله، اسأل المستخدم كيف يمكنك مساعدته.
2. اللغة: تحدث دائماً باللغة العربية بأسلوب احترافي وفخم.
3. التنفيذ: عندما يطلب منك المستخدم شيئاً، نفذه فوراً باستخدام الأدوات.
4. البيانات: استخدم الأرقام الحقيقية المتاحة لك في السياق لتعزيز مصداقيتك.

بيانات المنصة الحقيقية الحالية:
- إجمالي الطلبات: ${stats?.totalOrders || 0}
- إجمالي العملاء: ${stats?.totalClients || 0}
- إجمالي الرسائل: ${stats?.totalMessages || 0}
- إجمالي المشاريع: ${stats?.totalProjects || 0}

قدراتك التنفيذية:
1. بناء البوستات الاحترافية: صمم محتوى تسويقي يبيع ويجذب الجمهور.
2. توليد الصور (Image Generation): استخدم أداة "generate_marketing_image" لتوليد صور احترافية دائماً.
3. العمل الحقيقي: أنت لست تجريبياً. نفذ العمل فوراً.

الحالة الحالية: فيسبوك (${socialAccount ? 'متصل' : 'غير متصل'}) | استراتيجية (${config ? 'موجودة' : 'مفقودة'}).`;

    // Start Chat session
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction
    });

    const stream = new ReadableStream({
      async start(controller) {
        const sendData = (data: any) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (e) {}
        };

    try {
      sendData({ status: 'connected', agent: agentId });

      // --- تنظيف وتنسيق سجل المحادثة ---
      // Gemini يتطلب أن يبدأ السجل دائماً بـ user وأن يكون هناك تبادل بين user و model
      const history = messages.slice(0, -1)
        .filter(m => m.content && m.content.trim() !== "")
        .map(m => ({
          role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      // البحث عن أول رسالة من المستخدم للبدء بها
      const firstUserIdx = history.findIndex(m => m.role === 'user');
      const validHistory = firstUserIdx !== -1 ? history.slice(firstUserIdx) : [];
      
      // دمج الرسائل المتتالية من نفس النوع (تجنب خطأ Consecutive roles)
      const filteredHistory: any[] = [];
      for (const msg of validHistory) {
        if (filteredHistory.length === 0 || filteredHistory[filteredHistory.length - 1].role !== msg.role) {
          filteredHistory.push(msg);
        } else {
          filteredHistory[filteredHistory.length - 1].parts[0].text += "\n" + msg.parts[0].text;
        }
      }

      // البدء بجلسة شات مع التاريخ المنظم
      const chat = model.startChat({
        history: filteredHistory,
      });

      const result = await chat.sendMessageStream(lastUserMsg.content);

      let fullResponseContent = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullResponseContent += chunkText;
          sendData({ text: chunkText });
        }
      }
      
      controller.close();
    } catch (err: any) {
          console.error('Gemini Stream Error:', err);
          sendData({ error: `خطأ في الذكاء الاصطناعي: ${err.message}` });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Unified Stream Error:', error);
    return new Response(JSON.stringify({ error: `خطأ في السيرفر: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  try {
    const history = await db.chatMessage.findMany({
      orderBy: { timestamp: 'asc' },
      take: 50
    })
    return NextResponse.json(history)
  } catch (error) {
    return NextResponse.json([])
  }
}
