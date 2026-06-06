import { Metadata, ResolvingMetadata } from 'next'
import { db } from '@/lib/db'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const id = (await params).id

    const project = await db.project.findUnique({
      where: { id }
    })

    if (!project) {
      return {
        title: 'مشروع غير موجود | ELBA7RAWY',
      }
    }

    const previousImages = (await parent).openGraph?.images || []

    return {
      title: project.title,
      description: `مشاهدة تفاصيل مشروع ${project.title} المنفذ بواسطة ELBA7RAWY.`,
      openGraph: {
        title: project.title,
        description: `مشاهدة تفاصيل مشروع ${project.title} المنفذ بواسطة ELBA7RAWY.`,
        images: [project.imageUrl, ...previousImages],
      },
      twitter: {
        card: 'summary_large_image',
        title: project.title,
        description: `مشاهدة تفاصيل مشروع ${project.title} المنفذ بواسطة ELBA7RAWY.`,
        images: [project.imageUrl],
      },
    }
  } catch (error) {
    return {
      title: 'معرض الأعمال | ELBA7RAWY',
    }
  }
}

export { default } from './page-client'
