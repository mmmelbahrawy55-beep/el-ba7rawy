'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import FloatingActions from '@/components/floating-actions'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Tag, Layers, Share2 } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects`)
        const data = await res.json()
        const found = data.find((p: any) => p.id === params.id)
        if (found) {
          setProject(found)
        } else {
          router.push('/portfolio')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProject()
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 pt-40 pb-24">
          <Skeleton className="h-12 w-1/3 mb-8 bg-white/5" />
          <Skeleton className="w-full aspect-video rounded-[3rem] bg-white/5" />
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-8 hover:bg-white/5 font-bold text-muted-foreground hover:text-white"
          >
            <ArrowRight className="ml-2 size-4" />
            العودة للمعرض
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Project Image */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl"
              >
                <Image
                  src={project.imageUrl}
                  alt={project.titleAr}
                  fill
                  className="object-cover"
                />
              </motion.div>
              
              <div className="prose prose-invert max-w-none">
                <h2 className="text-3xl font-black text-white mb-6">تفاصيل المشروع</h2>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                  تم تنفيذ هذا المشروع وفقاً لأعلى معايير الجودة العالمية، حيث تم استخدام أحدث التقنيات لضمان مظهر احترافي وعمر افتراضي طويل. يمثل هذا العمل التزامنا بالتميز والابتكار في كل تفصيلة نلمسها.
                </p>
              </div>
            </div>

            {/* Project Info Card */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-xl backdrop-blur-md"
              >
                <Badge className="bg-primary text-primary-foreground mb-6 px-4 py-1.5 rounded-full text-xs font-black uppercase border-none">
                  {project.category}
                </Badge>
                <h1 className="text-3xl font-black text-white mb-8 leading-tight">
                  {project.titleAr}
                </h1>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Tag className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">التصنيف</p>
                      <p className="font-bold">{project.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Calendar className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">تاريخ التنفيذ</p>
                      <p className="font-bold">{new Date(project.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Layers className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">الحالة</p>
                      <p className="font-bold">مكتمل بنجاح</p>
                    </div>
                  </div>
                </div>

                <div className="pt-10 mt-10 border-t border-white/10 flex gap-4">
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 rounded-2xl shadow-xl shadow-primary/20">
                    اطلب مشروعاً مماثلاً
                  </Button>
                  <Button variant="outline" size="icon" className="size-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10">
                    <Share2 className="size-5" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <FloatingActions />
    </div>
  )
}

