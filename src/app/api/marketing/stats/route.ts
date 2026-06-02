import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { startOfDay, subDays, format } from 'date-fns'

export async function GET() {
  try {
    const today = startOfDay(new Date())
    
    const [
      totalClients,
      totalOrders,
      totalMessages,
      publishedPosts,
      scheduledPosts,
      recentAnalytics,
      socialAccounts
    ] = await Promise.all([
      db.client.count(),
      db.order.count(),
      db.message.count(),
      db.marketingPost.count({ where: { status: 'published' } }),
      db.marketingPost.count({ where: { status: 'scheduled' } }),
      db.marketingAnalytics.findMany({
        orderBy: { date: 'desc' },
        take: 7
      }),
      db.socialAccount.findMany({
        include: {
          analytics: {
            take: 1,
            orderBy: { date: 'desc' }
          }
        }
      })
    ])

    // Calculate weekly engagement for the chart
    const weeklyData: any[] = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      
      // Get real engagement for this day
      const dayAnalytics = recentAnalytics.filter(a => format(a.date, 'yyyy-MM-dd') === dateStr)
      const reach = dayAnalytics.reduce((sum, a) => sum + a.views, 0)
      const clicks = dayAnalytics.reduce((sum, a) => sum + a.likes + a.shares, 0)
      
      weeklyData.push({
        name: format(date, 'EEEE'),
        reach: reach || 0,
        clicks: clicks || 0
      } as any)
    }

    // Platform performance
    const platformPerformance = socialAccounts.map(acc => {
      const latest = acc.analytics[0]
      return {
        name: acc.platform === 'facebook' ? 'فيسبوك' : acc.platform === 'instagram' ? 'إنستجرام' : acc.platform,
        reach: latest?.views || 0,
        engagement: (latest?.likes || 0) + (latest?.shares || 0) + (latest?.comments || 0),
        growth: 0, // No simulated growth
        color: acc.platform === 'facebook' ? '#3b82f6' : acc.platform === 'instagram' ? '#ec4899' : '#fbbf24'
      }
    })

    // Conversion rate logic: (Orders / Messages)
    const conversionRate = totalMessages > 0 ? ((totalOrders / totalMessages) * 100).toFixed(1) : "0.0"
    const totalReach = platformPerformance.reduce((sum, p) => sum + p.reach, 0)

    return NextResponse.json({
      mainStats: [
        { label: 'إجمالي الوصول', value: totalReach > 1000 ? `${(totalReach/1000).toFixed(1)}K` : totalReach, trend: '0%', icon: 'Users', color: 'blue' },
        { label: 'معدل التحويل', value: `${conversionRate}%`, trend: '0%', icon: 'Zap', color: 'primary' },
        { label: 'الطلبات النشطة', value: totalOrders, trend: '0%', icon: 'PieChartIcon', color: 'emerald' },
        { label: 'الرسائل الواردة', value: totalMessages, trend: '0%', icon: 'TrendingUp', color: 'purple' },
      ],
      weeklyEngagement: weeklyData,
      platformPerformance,
      accountsCount: socialAccounts.length,
      postsCount: publishedPosts,
      scheduledCount: scheduledPosts
    })
  } catch (error) {
    console.error('Error fetching marketing stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
