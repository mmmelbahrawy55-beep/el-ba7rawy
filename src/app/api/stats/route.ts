import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { withErrorHandling } from "../../../lib/api-utils";
import { rateLimit } from "../../../lib/rate-limit";

export const GET = withErrorHandling(async (request: Request) => {
  const limitError = rateLimit(request, 50, 60000); // 50 requests per minute
  if (limitError) return limitError;

  let statsResults: any[] = [];
  try {
    statsResults = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.order.count(),
      db.order.count({ where: { status: "pending" } }),
      db.order.count({ where: { status: "in-progress" } }),
      db.order.count({ where: { status: "completed" } }),
      db.client.aggregate({
        _sum: {
          totalPaid: true,
          totalDebt: true,
        },
      }),
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
      }),
      db.transaction.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          client: {
            select: { name: true }
          }
        }
      }),
      db.marketingPost.count({ where: { status: 'published' } }),
      db.marketingAIConfig.findUnique({ where: { id: 'marketing-ai-config' } }),
      db.project.count(),
      db.client.count(),
      db.user.findMany({ 
        where: { role: 'admin' },
        select: { id: true, name: true, avatar: true, email: true }
      }),
    ]);
  } catch (error) {
    console.error("Stats fetch error:", error);
    // Return empty stats if DB fails
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
  ] = statsResults;

  const revenue = platformStats?._sum?.totalPaid ?? 0;
  const totalDebts = platformStats?._sum?.totalDebt ?? 0;
  
  // Calculate years of experience (company founded in 2011)
  const yearsOfExperience = new Date().getFullYear() - 2011;

  // Per-category order breakdown
  const categoryBreakdown = await db.order.groupBy({
    by: ["categoryName"],
    _count: { id: true },
    _sum: { estimatedPrice: true },
    orderBy: { _count: { id: "desc" } },
  });

  const categoryStats = categoryBreakdown.map((c: any) => ({
    categoryName: c.categoryName,
    count: c._count.id,
    revenue: c._sum.estimatedPrice ?? 0,
  }));

  // Daily sales for the last 30 days
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

  const chartData = Object.entries(salesData).map(([date, amount]) => ({
    date,
    amount,
  }));

  return NextResponse.json({
    totalOrders,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    totalProducts,
    totalCategories,
    totalProjects,
    totalClients,
    totalExperts: admins.length,
    admins,
    yearsOfExperience,
    revenue,
    totalDebts,
    categoryStats,
    chartData,
    recentOrders,
    recentTransactions,
    marketingStats: {
      publishedPosts: publishedMarketingPosts,
      aiEnabled: marketingConfig?.isEnabled ?? false,
      lastRun: marketingConfig?.lastRun
    }
  });
});
