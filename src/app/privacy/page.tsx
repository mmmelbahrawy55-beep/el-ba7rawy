import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'سياسة الخصوصية لشركة ELBA7RAWY - كيف نحمي بياناتك ومعلوماتك.',
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-24 prose prose-slate max-w-4xl text-right" dir="rtl">
      <h1 className="text-4xl font-black text-slate-900 mb-8">سياسة الخصوصية</h1>
      <p className="text-lg text-slate-600 mb-6">
        نحن في ELBA7RAWY نولي أهمية قصوى لخصوصية بياناتكم. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتكم الشخصية.
      </p>
      
      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">1. المعلومات التي نجمعها</h2>
      <p>نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند استخدام نموذج الاتصال أو طلب عرض سعر، وتشمل: الاسم، رقم الهاتف، والبريد الإلكتروني.</p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">2. كيف نستخدم معلوماتك</h2>
      <p>نستخدم هذه المعلومات فقط للتواصل معك بشأن طلباتك، تحسين خدماتنا، وإرسال التحديثات المتعلقة بمشاريعك لدينا.</p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">3. حماية البيانات</h2>
      <p>نحن نطبق إجراءات أمنية صارمة لضمان عدم وصول أي طرف ثالث غير مصرح له إلى بياناتك الشخصية.</p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">4. ملفات تعريف الارتباط (Cookies)</h2>
      <p>يستخدم الموقع ملفات تعريف الارتباط لتحسين تجربة المستخدم وتحليل حركة الزوار عبر الموقع.</p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">5. التعديلات على السياسة</h2>
      <p>نحتفظ بالحق في تحديث سياسة الخصوصية هذه في أي وقت، وسيتم نشر التعديلات هنا مباشرة.</p>
    </div>
  )
}
