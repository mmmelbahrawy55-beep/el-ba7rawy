'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Layers, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Project {
  id: string;
  title: string;
  titleAr: string;
  category: ProjectCategory;
  imageUrl: string;
  thumbnail: string | null;
  featured: boolean;
  createdAt: string;
}

type ProjectCategory = 'flex' | '3d-signage' | 'cladding' | 'paper';

interface CategoryOption {
  value: string;
  label: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_TABS: CategoryOption[] = [
  { value: 'all', label: 'الكل' },
  { value: 'flex', label: 'طباعة' },
  { value: '3d-signage', label: 'لافتات' },
  { value: 'cladding', label: 'كلادينج' },
  { value: 'paper', label: 'مطبوعات' },
];

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  flex: 'طباعة فليكس',
  '3d-signage': 'لافتات 3D',
  cladding: 'كلادينج',
  paper: 'مطبوعات ورقية',
};

const FALLBACK_PROJECTS: Project[] = [];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

/* ------------------------------------------------------------------ */
/*  Skeleton Loader                                                    */
/* ------------------------------------------------------------------ */

function PortfolioSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => {
        const heights = ['h-56', 'h-64', 'h-72', 'h-60', 'h-48', 'h-68', 'h-52', 'h-58'];
        return (
          <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border">
            <Skeleton className={`w-full ${heights[i % heights.length]} bg-muted`} />
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lightbox Dialog                                                    */
/* ------------------------------------------------------------------ */

interface LightboxProps {
  project: Project | null;
  projects: Project[];
  open: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

function Lightbox({ project, projects, open, onClose, onNavigate }: LightboxProps) {
  const currentIndex = projects.findIndex((p) => p.id === project?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < projects.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (hasPrev) onNavigate('prev');
      } else if (e.key === 'ArrowLeft') {
        if (hasNext) onNavigate('next');
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [hasPrev, hasNext, onNavigate, onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-5xl w-[95vw] sm:w-[90vw] p-0 overflow-hidden bg-black/95 border-white/10 backdrop-blur-sm"
        showCloseButton={false}
      >
        {/* Accessibility: hidden but present for screen readers */}
        <DialogTitle className="sr-only">
          {project?.titleAr ?? 'معرض الصور'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          عرض تفصيلي للمشروع
        </DialogDescription>

        {project && (
          <div className="relative flex flex-col">
            {/* Image area */}
            <div className="relative w-full aspect-video overflow-hidden bg-black flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={project.imageUrl}
                    alt={project.titleAr}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1280px) 95vw, 1200px"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 left-3 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev arrow */}
              {hasPrev && (
                <button
                  onClick={() => onNavigate('prev')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
                  aria-label="السابق"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Next arrow */}
              {hasNext && (
                <button
                  onClick={() => onNavigate('next')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
                  aria-label="التالي"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Info bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-white font-bold text-lg font-arabic">
                  {project.titleAr}
                </h3>
                <Badge
                  variant="outline"
                  className="border-gold/40 text-gold-light text-xs font-arabic"
                >
                  {CATEGORY_LABELS[project.category as ProjectCategory]}
                </Badge>
              </div>
              <span className="text-white/40 text-sm tabular-nums">
                {currentIndex + 1} / {projects.length}
              </span>
            </motion.div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function PortfolioGallery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxProject, setLightboxProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setProjects(data.length > 0 ? data : FALLBACK_PROJECTS);
      } catch (err) {
        setProjects(FALLBACK_PROJECTS);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesTab = activeTab === 'all' || p.category === activeTab;
    const matchesSearch = p.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleNavigate = (direction: 'prev' | 'next') => {
    const currentIndex = filteredProjects.findIndex((p) => p.id === lightboxProject?.id);
    if (direction === 'prev' && currentIndex > 0) {
      setLightboxProject(filteredProjects[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < filteredProjects.length - 1) {
      setLightboxProject(filteredProjects[currentIndex + 1]);
    }
  };

  return (
    <section id="portfolio" className="py-32 sm:py-48 bg-[#050505] relative overflow-hidden transition-colors duration-500">
      {/* Noise Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-[180px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24 sm:mb-32">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.4em] mb-8 backdrop-blur-md">
            <Search className="size-4" />
            <span>معرض أعمالنا</span>
          </div>
          <h2 className="text-6xl sm:text-8xl font-black text-white tracking-tight mb-12 leading-[1.3] max-w-5xl mx-auto">
            تاريخنا يكتبه <span className="text-primary drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">الإبداع</span> والتنفيذ
          </h2>
          <p className="text-slate-400 max-w-4xl mx-auto text-xl sm:text-3xl font-bold leading-[1.8] px-4">
            نفخر بكوننا الشريك الإعلاني لمئات العلامات التجارية الكبرى، حيث نحول الرؤى إلى واقع ملموس يبهر الأنظار.
          </p>
        </div>

        <div className="flex flex-col items-center gap-16">
          {/* Search & Tabs Row */}
          <div className="w-full max-w-6xl flex flex-col lg:row gap-8 items-center bg-white/5 p-10 rounded-[3.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
            {/* Tabs UI */}
            <Tabs
              defaultValue="all"
              className="w-full lg:flex-1"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-5 w-full bg-[#0c0c0c] p-2 border border-white/5 rounded-3xl h-20 sm:h-24">
                {CATEGORY_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl text-xs sm:text-base font-black transition-all duration-500 text-slate-500 hover:text-slate-300"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 size-6 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المشاريع..."
                className="pr-16 h-20 sm:h-24 rounded-3xl border-white/5 bg-[#0c0c0c] font-black text-lg focus:ring-primary/30 transition-all text-white border-2"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="w-full">
            {isLoading ? (
              <PortfolioSkeleton />
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeTab}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
                >
                  {filteredProjects.map((project, idx) => (
                    <motion.div
                      key={project.id}
                      variants={cardVariants}
                      layout
                    >
                      <div 
                        className={`group relative overflow-hidden rounded-[3rem] bg-white/5 border border-white/5 hover:border-primary/50 transition-all duration-700 cursor-pointer shadow-2xl shadow-black/40 border-2 ${
                          idx % 4 === 0 ? 'aspect-[4/5]' : idx % 3 === 0 ? 'aspect-square' : 'aspect-[4/3]'
                        }`}
                        onClick={() => setLightboxProject(project)}
                      >
                        <Image
                          src={project.imageUrl}
                          alt={project.titleAr}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        
                        {/* Glass Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-10 backdrop-blur-[4px] group-hover:backdrop-blur-none">
                          <Badge className="w-fit bg-primary text-primary-foreground border-none mb-4 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/40">
                            {CATEGORY_LABELS[project.category as ProjectCategory] || project.category}
                          </Badge>
                          <h3 className="text-2xl font-black text-white leading-tight mb-6 tracking-tighter">
                            {project.titleAr}
                          </h3>
                          <div className="flex gap-4 translate-y-6 group-hover:translate-y-0 transition-transform duration-700">
                            <Button 
                              size="lg" 
                              variant="secondary" 
                              className="rounded-2xl font-black text-sm h-14 bg-white/10 text-white hover:bg-white/20 border-white/10 border backdrop-blur-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxProject(project);
                              }}
                            >
                              تكبير الصورة
                            </Button>
                            <Button 
                              size="lg" 
                              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-sm h-14 shadow-2xl shadow-primary/30"
                              asChild
                            >
                              <Link href={`/portfolio/${project.id}`}>
                                التفاصيل
                              </Link>
                            </Button>
                          </div>
                        </div>

                        <div className="absolute top-8 right-8 size-14 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-6 group-hover:translate-x-0">
                          <Layers className="size-6 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {!isLoading && filteredProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center"
              >
                <div className="size-32 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shadow-2xl mx-auto mb-8">
                  <Search className="size-16" />
                </div>
                <p className="text-slate-500 font-black text-2xl tracking-tighter">لا توجد أعمال تطابق بحثك حالياً</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Lightbox
        project={lightboxProject}
        projects={filteredProjects}
        open={!!lightboxProject}
        onClose={() => setLightboxProject(null)}
        onNavigate={handleNavigate}
      />
    </section>
  );
}
