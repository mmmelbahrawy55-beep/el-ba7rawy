
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const teamInfo = JSON.stringify([
    { id: '1', name: 'أحمد علي', role: 'مدير التسويق', email: 'ahmed@elbahrawy.com', performance: 95, tasks: 12, avatar: 'A' },
    { id: '2', name: 'سارة حسن', role: 'متخصص تسويق رقمي', email: 'sara@elbahrawy.com', performance: 88, tasks: 8, avatar: 'S' },
    { id: '3', name: 'محمد خالد', role: 'منسق محتوى', email: 'm.khaled@elbahrawy.com', performance: 92, tasks: 15, avatar: 'M' },
    { id: '4', name: 'ليلى محمود', role: 'محلل بيانات', email: 'laila@elbahrawy.com', performance: 97, tasks: 5, avatar: 'L' },
    { id: '5', name: 'ياسين عمر', role: 'مسؤول علاقات عامة', email: 'yassin@elbahrawy.com', performance: 85, tasks: 10, avatar: 'Y' },
  ])

  const strategy = JSON.stringify({
    objectives: 'زيادة الوعي بالعلامة التجارية بنسبة 40% خلال الربع القادم',
    targetAudience: 'الشركات الناشئة، أصحاب الأعمال، المهتمين بالدعاية والإعلان',
    messaging: 'الاحترافية، السرعة، والإبداع في كل تصميم',
    channels: ['فيسبوك', 'إنستجرام', 'تيك توك', 'إعلانات جوجل']
  })

  const sops = JSON.stringify([
    { id: '1', title: 'تخطيط الحملات', steps: 8, status: 'نشط' },
    { id: '2', title: 'إنشاء المحتوى', steps: 5, status: 'نشط' },
    { id: '3', title: 'إدارة الأزمات', steps: 12, status: 'مراجعة' },
    { id: '4', title: 'تحليل الأداء', steps: 6, status: 'نشط' },
  ])

  const executionPlan = JSON.stringify([
    { stage: 'التأسيس والتوظيف', deadline: '2026-07-15', status: 'completed' },
    { stage: 'وضع الاستراتيجية الموحدة', deadline: '2026-08-01', status: 'in_progress' },
    { stage: 'تكامل الأدوات والتقنيات', deadline: '2026-08-15', status: 'pending' },
    { stage: 'إطلاق الحملة الكبرى', deadline: '2026-09-01', status: 'pending' },
  ])

  await prisma.marketingAIConfig.upsert({
    where: { id: 'marketing-ai-config' },
    update: {
      teamInfo,
      strategy,
      sops,
      executionPlan,
      isEnabled: true
    },
    create: {
      id: 'marketing-ai-config',
      teamInfo,
      strategy,
      sops,
      executionPlan,
      isEnabled: true
    }
  })

  console.log('Marketing context seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
