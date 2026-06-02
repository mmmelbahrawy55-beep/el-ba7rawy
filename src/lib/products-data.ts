// ─── Embedded Product Data ───────────────────────────────────────────────────────
// This file contains all product data embedded directly in the codebase.
// No database needed for the public-facing site to work on Vercel.

export interface ProductData {
  id: string
  name: string
  nameEn: string
  description: string
  imageUrl: string
  pricePerMeter: number | null
  pricePerThousand: number | null
  pricePerLetter: number | null
  priceFlat: number | null
  priceUnit: string
  deliveryDays: number
  isActive: boolean
  sortOrder: number
  salesCount?: number // For sorting by popularity
  createdAt?: string // For sorting by date
  isHot?: boolean
  discount?: string
}

export interface CategoryData {
  id: string
  name: string
  nameEn: string
  icon: string
  color: string
  sortOrder: number
  isActive: boolean
  parentCategoryId?: string | null // For hierarchical structure
  products: ProductData[]
}

// Logical Grouping:
// 1. Outdoor & Signage (Main)
// 2. Printing & Stationery (Main)
// 3. Branding & Design (Main)

export const categories: CategoryData[] = [
  // ─── Main Categories ───────────────────
  {
    id: "main-outdoor",
    name: "لوحات خارجية وإنشاءات",
    nameEn: "Outdoor & Signage",
    icon: "Building2",
    color: "blue",
    sortOrder: 1,
    isActive: true,
    products: []
  },
  {
    id: "main-printing",
    name: "مطبوعات ورقية ورقمية",
    nameEn: "Printing & Stationery",
    icon: "FileText",
    color: "amber",
    sortOrder: 2,
    isActive: true,
    products: []
  },
  {
    id: "main-creative",
    name: "تصميم وهوية بصرية",
    nameEn: "Design & Branding",
    icon: "Palette",
    color: "purple",
    sortOrder: 3,
    isActive: true,
    products: []
  },

  // ─── Sub-Categories ───────────────────
  
  // Under Outdoor & Signage
  {
    id: "cat-3d-letters",
    name: "حروف بارزة 3D",
    nameEn: "3D Letters",
    icon: "Box",
    color: "amber",
    sortOrder: 1,
    isActive: true,
    parentCategoryId: "main-outdoor",
    products: [
      { id: "prod-acrylic-letters", name: "حروف أكريليك مضيئة", nameEn: "Acrylic LED Letters", description: "حروف أكريليك عالية الجودة مع إضاءة LED موفرة للطاقة وشكل عصري", imageUrl: "https://images.unsplash.com/photo-1563245332-692146e10db1?auto=format&fit=crop&q=80&w=800", pricePerMeter: null, pricePerThousand: null, pricePerLetter: 45, priceFlat: null, priceUnit: "letter", deliveryDays: 5, isActive: true, sortOrder: 0, salesCount: 150, createdAt: "2024-01-10", isHot: true, discount: "15%" },
      { id: "prod-stainless-letters", name: "حروف ستانلس ستيل", nameEn: "Stainless Steel Letters", description: "حروف معدنية فاخرة مقاومة للصدأ تعطي مظهراً احترافياً للشركات", imageUrl: "https://images.unsplash.com/photo-1542744095-2ad480002121?auto=format&fit=crop&q=80&w=800", pricePerMeter: null, pricePerThousand: null, pricePerLetter: 120, priceFlat: null, priceUnit: "letter", deliveryDays: 7, isActive: true, sortOrder: 1, salesCount: 85, createdAt: "2024-01-15" },
      { id: "prod-neon-led", name: "حروف نيون LED", nameEn: "Neon LED Signs", description: "أنابيب نيون مرنة بألوان جذابة لإعطاء طابع حيوي للمكان", imageUrl: "https://images.unsplash.com/photo-1565120130276-dfbd9a7a3ad7?auto=format&fit=crop&q=80&w=800", pricePerMeter: null, pricePerThousand: null, pricePerLetter: 85, priceFlat: null, priceUnit: "letter", deliveryDays: 5, isActive: true, sortOrder: 2, salesCount: 120, createdAt: "2024-02-01", isHot: true },
    ],
  },
  {
    id: "cat-cladding",
    name: "واجهات كلادينج",
    nameEn: "Cladding Facades",
    icon: "Building2",
    color: "emerald",
    sortOrder: 2,
    isActive: true,
    parentCategoryId: "main-outdoor",
    products: [
      { id: "prod-composite-clad", name: "كلادينج كومبوزيت", nameEn: "Composite Cladding", description: "ألواح ألومنيوم معالجة لتغطية واجهات المباني والمحلات التجارية", imageUrl: "https://images.unsplash.com/photo-1518005020251-58296d87e39d?auto=format&fit=crop&q=80&w=800", pricePerMeter: 450, pricePerThousand: null, pricePerLetter: null, priceFlat: null, priceUnit: "meter", deliveryDays: 14, isActive: true, sortOrder: 0, salesCount: 45, createdAt: "2024-01-05", discount: "10%" },
    ],
  },
  {
    id: "cat-flex-banner",
    name: "طباعة فليكس وبانر",
    nameEn: "Flex & Banner",
    icon: "Printer",
    color: "blue",
    sortOrder: 3,
    isActive: true,
    parentCategoryId: "main-outdoor",
    products: [
      { id: "prod-heavy-banner", name: "بانر PVC ثقيل", nameEn: "Heavy Duty Banner", description: "طباعة عالية الدقة على خامات تتحمل العوامل الجوية الخارجية", imageUrl: "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?auto=format&fit=crop&q=80&w=800", pricePerMeter: 120, pricePerThousand: null, pricePerLetter: null, priceFlat: null, priceUnit: "meter", deliveryDays: 2, isActive: true, sortOrder: 0, salesCount: 300, createdAt: "2024-01-01", isHot: true },
      { id: "prod-glossy-vinyl", name: "فينيل لاصق لامع", nameEn: "Glossy Vinyl Sticker", description: "ملصقات فينيل بجودة طباعة فوتوغرافية للديكور والإعلان", imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800", pricePerMeter: 150, pricePerThousand: null, pricePerLetter: null, priceFlat: null, priceUnit: "meter", deliveryDays: 3, isActive: true, sortOrder: 1, salesCount: 210, createdAt: "2024-01-20" },
    ],
  },

  // Under Printing & Stationery
  {
    id: "cat-paper-prints",
    name: "مطبوعات تجارية",
    nameEn: "Business Printing",
    icon: "FileText",
    color: "amber",
    sortOrder: 1,
    isActive: true,
    parentCategoryId: "main-printing",
    products: [
      { id: "prod-business-cards", name: "كروت شخصية فاخرة", nameEn: "Premium Business Cards", description: "تصميم وطباعة كروت شخصية بخامات متنوعة ولمسات فنية", imageUrl: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6?auto=format&fit=crop&q=80&w=800", pricePerMeter: null, pricePerThousand: 800, pricePerLetter: null, priceFlat: null, priceUnit: "thousand", deliveryDays: 3, isActive: true, sortOrder: 0, salesCount: 500, createdAt: "2023-12-15" },
      { id: "prod-brochures", name: "بروشورات وفلاير", nameEn: "Brochures & Flyers", description: "كتيبات تسويقية بألوان زاهية وورق عالي الجودة", imageUrl: "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&q=80&w=800", pricePerMeter: null, pricePerThousand: 3000, pricePerLetter: null, priceFlat: null, priceUnit: "thousand", deliveryDays: 5, isActive: true, sortOrder: 1, salesCount: 280, createdAt: "2023-12-20" },
    ],
  },

  // Under Creative Services & Branding
  {
    id: "cat-design",
    name: "تصميم الجرافيك",
    nameEn: "Graphic Design",
    icon: "Palette",
    color: "purple",
    sortOrder: 1,
    isActive: true,
    parentCategoryId: "main-creative",
    products: [
      { id: "prod-logo-design", name: "تصميم شعار (لوغو)", nameEn: "Logo Design", description: "ابتكار هوية بصرية فريدة تعبر عن قيم مشروعك", imageUrl: "https://images.unsplash.com/photo-1626785774625-ddc7c8241314?auto=format&fit=crop&q=80&w=800", pricePerMeter: null, pricePerThousand: null, pricePerLetter: null, priceFlat: 1500, priceUnit: "project", deliveryDays: 3, isActive: true, sortOrder: 0, salesCount: 140, createdAt: "2024-02-10" },
    ],
  },
  {
    id: "cat-vehicle-wraps",
    name: "تغليف سيارات",
    nameEn: "Vehicle Branding",
    icon: "Car",
    color: "rose",
    sortOrder: 2,
    isActive: true,
    parentCategoryId: "main-creative",
    products: [
      { id: "prod-full-wrap", name: "تغليف سيارة كامل", nameEn: "Full Car Wrap", description: "تحويل السيارات إلى لوحات إعلانية متحركة تجذب الأنظار", imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800", pricePerMeter: null, pricePerThousand: null, pricePerLetter: null, priceFlat: 8000, priceUnit: "car", deliveryDays: 5, isActive: true, sortOrder: 0, salesCount: 30, createdAt: "2024-03-01" },
    ],
  },
]

// Portfolio projects data with real images
export const portfolioProjects: PortfolioProject[] = [
  { id: "pf-1", title: "Commercial Banner Installation", titleAr: "تركيب بانر تجاري كبير", category: "flex", imageUrl: "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?auto=format&fit=crop&q=80&w=800", featured: true },
  { id: "pf-2", title: "3D LED Storefront Sign", titleAr: "لافتة محل بإضاءة LED", category: "3d-signage", imageUrl: "https://images.unsplash.com/photo-1563245332-692146e10db1?auto=format&fit=crop&q=80&w=800", featured: true },
  { id: "pf-3", title: "Highway Billboard Campaign", titleAr: "حملة إعلانية على لوحة طريق", category: "flex", imageUrl: "https://images.unsplash.com/photo-1518005020251-58296d87e39d?auto=format&fit=crop&q=80&w=800", featured: false },
  { id: "pf-4", title: "Vehicle Branding Wrap", titleAr: "تصميم ولف سيارة بالفينيل", category: "3d-signage", imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800", featured: true },
]

export interface PortfolioProject {
  id: string
  title: string
  titleAr: string
  category: 'flex' | '3d-signage' | 'cladding' | 'paper'
  imageUrl: string
  featured: boolean
}

// Helper to get all products flat
export function getAllProducts(): ProductData[] {
  return categories.flatMap(c => c.products.filter(p => p.isActive))
}

// Helper to get products by category
export function getProductsByCategory(categoryId: string): ProductData[] {
  const cat = categories.find(c => c.id === categoryId)
  return cat ? cat.products.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder) : []
}

// Helper to get category by ID
export function getCategoryById(categoryId: string): CategoryData | undefined {
  return categories.find(c => c.id === categoryId)
}
