
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const teamInfo = JSON.stringify([
    { id: '1', name: 'البحراوي 1', role: 'مدير التسويق', email: 'admin1@elbahrawy.com', performance: 95 },
    { id: '2', name: 'البحراوي 2', role: 'متخصص تسويق رقمي', email: 'admin2@elbahrawy.com', performance: 92 },
    { id: '3', name: 'البحراوي 3', role: 'منسق محتوى', email: 'admin3@elbahrawy.com', performance: 88 },
    { id: '4', name: 'البحراوي 4', role: 'محلل بيانات', email: 'admin4@elbahrawy.com', performance: 90 },
    { id: '5', name: 'البحراوي 5', role: 'مسؤول علاقات عامة', email: 'admin5@elbahrawy.com', performance: 85 },
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
