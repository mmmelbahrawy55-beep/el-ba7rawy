import { Metadata } from 'next'
import { db } from '../../../lib/db'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  try {
    const id = (await params).id

    const category = await db.category.findUnique({
      where: { id }
    })

    if (!category) {
      return {
        title: 'قسم غير موجود | ELBA7RAWY',
      }
    }

    return {
      title: category.name,
      description: `استكشف خدمات قسم ${category.name} من ELBA7RAWY. حلول إعلانية وطباعية مبتكرة بأعلى جودة.`,
      openGraph: {
        title: category.name,
        description: `استكشف خدمات قسم ${category.name} من ELBA7RAWY.`,
      },
    }
  } catch (error) {
    return {
      title: 'خدماتنا | ELBA7RAWY',
    }
  }
}

export { default } from './page-client'
