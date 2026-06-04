import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { withErrorHandling } from "../../../lib/api-utils";
import { rateLimit } from "../../../lib/rate-limit";

export const GET = withErrorHandling(async (request: Request) => {
  const limitError = rateLimit(request, 50, 60000); // 50 requests per minute
  if (limitError) return limitError;

  try {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      platformStats,
      recentOrders,
      recentTransactions,
      publishedMarketingPosts,
      marketingConfig,
      totalProjects,
      totalClients,
      admins,
    ] = await Promise.all([
      db.product.count().catch(() => 0),
      db.category.count().catch(() => 0),
      db.order.count().catch(() => 0),
      db.order.count({ where: { status: "pending" } }).catch(() => 0),
      db.order.count({ where: { status: "in-progress" } }).catch(() => 0),
      db.order.count({ where: { status: "completed" } }).catch(() => 0),
      db.client.aggregate({
        _sum: {
          totalPaid: true,
          totalDebt: true,
        },
      }).catch(() => ({ _sum: { totalPaid: 0, totalDebt: 0 } })),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerName: true,
          productName: true,
          status: true,
          createdAt: true,
          estimatedPrice: true
        }
      }).catch(() => []),
      db.transaction.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          client: {
            select: { name: true }
          }
        }
      }).catch(() => []),
      db.marketingPost.count({ where: { status: 'published' } }).catch(() => 0),
      db.marketingAIConfig.findUnique({ where: { id: 'marketing-ai-config' } }).catch(() => null),
      db.project.count().catch(() => 0),
      db.client.count().catch(() => 0),
      db.user.findMany({ 
        where: { role: 'admin' },
        select: { id: true, name: true, avatar: true, email: true }
      }).catch(() => []),
    ]);

    const revenue = platformStats?._sum?.totalPaid ?? 0;
    const totalDebts = platformStats?._sum?.totalDebt ?? 0;
    
    // Calculate years of experience (company founded in 2011)
    const yearsOfExperience = new Date().getFullYear() - 2011;

    // Per-category order breakdown
    const categoryStats = [];
    try {
      const categoryBreakdown = await db.order.groupBy({
        by: ["categoryName"],
        _count: { id: true },
        _sum: { estimatedPrice: true },
        orderBy: { _count: { id: "desc" } },
      });

      categoryStats.push(...categoryBreakdown.map((c: any) => ({
        categoryName: c.categoryName,
        count: c._count.id,
        revenue: c._sum.estimatedPrice ?? 0,
      })));
    } catch (e) {
      console.error("Error fetching category stats:", e);
    }

    // Daily sales for the last 30 days
    const chartData = [];
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyOrders = await db.order.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
          status: "completed",
        },
        select: {
          createdAt: true,
          estimatedPrice: true,
        },
        orderBy: { createdAt: "asc" },
      });

      const salesData: Record<string, number> = {};
      dailyOrders.forEach((order: any) => {
        const date = order.createdAt.toISOString().split("T")[0];
        salesData[date] = (salesData[date] || 0) + (order.estimatedPrice || 0);
      });

      chartData.push(...Object.entries(salesData).map(([date, amount]) => ({
        date,
        amount,
      })));
    } catch (e) {
      console.error("Error fetching daily sales:", e);
    }

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      totalProducts,
      totalCategories,
      totalProjects,
      totalClients,
      totalExperts: admins?.length ?? 0,
      admins: admins ?? [],
      yearsOfExperience,
      revenue,
      totalDebts,
      categoryStats,
      chartData,
      recentOrders,
      recentTransactions,
      marketingStats: {
        publishedPosts: publishedMarketingPosts,
        aiEnabled: !!marketingConfig?.isEnabled,
        lastRun: marketingConfig?.updatedAt || null
      }
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    // Return empty stats instead of error
    return NextResponse.json({
      totalOrders: 0,
      pendingOrders: 0,
      inProgressOrders: 0,
      completedOrders: 0,
      totalProducts: 0,
      totalCategories: 0,
      totalProjects: 0,
      totalClients: 0,
      totalExperts: 0,
      admins: [],
      yearsOfExperience: new Date().getFullYear() - 2011,
      revenue: 0,
      totalDebts: 0,
      categoryStats: [],
      chartData: [],
      recentOrders: [],
      recentTransactions: [],
      marketingStats: {
        publishedPosts: 0,
        aiEnabled: false,
        lastRun: null
      }
    });
  }
});
