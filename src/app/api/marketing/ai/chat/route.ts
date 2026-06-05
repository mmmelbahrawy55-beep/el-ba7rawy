import { NextResponse } from 'next/server'
import ZAI from "z-ai-web-dev-sdk"
import { db } from '../../../../../lib/db'
import { memoryCache } from '../../../../../lib/cache-utils'
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

// --- 3. Optimized AI Engine & Tools (OpenAI Style for ZAI) ---
const zaiTools = [
  {
    type: 'function',
    function: {
      name: 'get_marketing_insights',
      description: 'Get advanced analytics and insights for marketing performance.',
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_daily_marketing_plan',
      description: 'Generate a daily marketing plan with tasks, goals, and KPIs.',
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyze_market_trends',
      description: 'Analyze market trends, competitors, or user behavior patterns.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topic to analyze' },
          modelType: { type: 'string', description: 'SWOT, PESTEL, etc.' }
        },
        required: ['topic']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_social_post',
      description: 'Create and optionally publish a marketing post.',
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          platform: { type: 'string' },
          status: { type: 'string' },
          imageUrl: { type: 'string' }
        },
        required: ['content', 'platform']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'manage_social_interactions',
      description: 'Fetch or reply to social media comments.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          platform: { type: 'string' },
          postId: { type: 'string' },
          commentId: { type: 'string' },
          message: { type: 'string' }
        },
        required: ['action', 'platform']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'manage_knowledge_base',
      description: 'Manage entries in the long-term knowledge base.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          category: { type: 'string' },
          topic: { type: 'string' },
          content: { type: 'string' }
        },
        required: ['action']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'system_self_optimize',
      description: 'Self-improve the system rules or knowledge.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
          newRule: { type: 'string' }
        },
        required: ['reason', 'newRule']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delegate_task',
      description: 'Delegate task to specialized agents.',
      parameters: {
        type: 'object',
        properties: {
          agentId: { type: 'string' },
          taskDescription: { type: 'string' }
        },
        required: ['agentId', 'taskDescription']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'audit_platform_content',
      description: 'Perform a marketing and SEO audit of platform products or posts.',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'Target: products, posts' },
          id: { type: 'string', description: 'Optional specific ID to audit' }
        },
        required: ['type']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_marketing_image',
      description: 'Generate a high-quality professional marketing image based on a detailed prompt.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Detailed visual description for the AI image generator' },
          aspectRatio: { type: 'string', description: '1:1, 16:9, or 4:5' }
        },
        required: ['prompt']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'run_autonomous_marketing_loop',
      description: 'Start an autonomous loop to handle a complete campaign: idea -> post -> publish -> monitor -> report.',
      parameters: {
        type: 'object',
        properties: {
          goal: { type: 'string', description: 'The main goal: sales, branding, etc.' },
          durationDays: { type: 'number', description: 'How long the loop should run' }
        },
        required: ['goal']
      }
    }
  }
]

// --- 4. Main API Handler (Streaming Optimized with ZAI) ---
export async function POST(req: Request) {
  const encoder = new TextEncoder();
  
  const marketingConfig = await db.marketingAIConfig.findUnique({
    where: { id: 'marketing-ai-config' }
  });
  
  let apiKey = marketingConfig?.keywords?.trim() || process.env.ZAI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'يرجى التأكد من وضع مفتاح Z.AI API الصحيح في الإعدادات.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

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

    // ⚡ PERFORMANCE: Parallel Context Retrieval
    const { config, knowledgeBase, socialAccount, stats } = await getCachedMarketingContext();

    // 🧠 AI ENGINE: Professional Senior Intelligence Initialization
    const knowledgeBaseContent = knowledgeBase.length > 0 
      ? `\nقاعدة المعرفة الخاصة بك:\n${knowledgeBase.map((k: any) => `- ${k.topic}: ${k.content}`).join('\n')}`
      : '';

    const systemInstruction = `أنت "الذكاء المركزي الخارق" (Central Super-Intelligence) لمنصة "البحراوي".
هويتك الحالية هي: ${agentPrompt || 'الذكاء الشامل'}.
أنت نظام تنفيذ حقيقي (Real-world Execution System) قادر على إدارة الوكالة بالكامل.

قواعد صارمة:
1. الرد دائماً: لا ترسل رداً فارغاً أبداً. إذا لم يكن لديك ما تقوله، اسأل المستخدم كيف يمكنك مساعدته.
2. اللغة: تحدث دائماً باللغة العربية بأسلوب احترافي وفخم.
3. التنفيذ: عندما يطلب منك المستخدم شيئاً، نفذه فوراً باستخدام الأدوات.
4. البيانات: استخدم الأرقام الحقيقية المتاحة لك في السياق لتعزيز مصداقيتك.
${knowledgeBaseContent}

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

    // Initialize ZAI
    if (apiKey) process.env.ZAI_API_KEY = apiKey;
    const zai = await ZAI.create();

    const stream = new ReadableStream({
      async start(controller) {
        const sendData = (data: any) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (e) {}
        };

        try {
          sendData({ status: 'connected', agent: agentId });

          const zaiMessages: any[] = [
            { role: 'system', content: systemInstruction },
            ...messages.map(m => ({
              role: m.role === 'model' ? 'assistant' : m.role,
              content: m.content
            }))
          ];

          const completion = await zai.chat.completions.create({
            messages: zaiMessages,
            model: "gpt-4o",
            stream: true,
            tools: zaiTools as any
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              sendData({ text: content });
            }
            
            // Handle tool calls if any
            const toolCalls = chunk.choices[0]?.delta?.tool_calls;
            if (toolCalls) {
              sendData({ tool_calls: toolCalls });
            }
          }
          
          controller.close();
        } catch (err: any) {
          console.error('ZAI Stream Error:', err);
          sendData({ error: `خطأ في Z.AI: ${err.message}` });
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
