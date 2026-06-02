import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الشروط والأحكام',
  description: 'الشروط والأحكام لاستخدام خدمات ELBA7RAWY.',
}

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-24 prose prose-slate max-w-4xl text-right" dir="rtl">
      <h1 className="text-4xl font-black text-slate-900 mb-8">الشروط والأحكام</h1>
      
      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">1. قبول الشروط</h2>
      <p>باستخدامك لموقع ELBA7RAWY، فإنك توافق على الالتزام بهذه الشروط والأحكام بالكامل.</p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">2. الخدمات والطلبات</h2>
      <p>يتم تنفيذ الطلبات بناءً على المواصفات المتفق عليها في عرض السعر. أي تعديلات إضافية بعد بدء التنفيذ قد تخضع لرسوم إضافية.</p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">3. الدفع والتحصيل</h2>
      <p>يتم دفع عربون متفق عليه قبل البدء في التنفيذ، ويتم سداد باقي المبلغ عند الاستلام أو التركيب وفقاً للاتفاق.</p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">4. الملكية الفكرية</h2>
      <p>كافة التصاميم والشعارات المنفذة تظل ملكية فكرية للشركة حتى يتم سداد كامل مستحقات المشروع.</p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">5. الضمان والتسليم</h2>
      <p>نضمن جودة التنفيذ والتركيب لمدة محددة تختلف حسب نوع الخدمة، ولا يشمل الضمان سوء الاستخدام أو العوامل الجوية الخارجة عن السيطرة (في بعض الحالات).</p>
    </div>
  )
}
