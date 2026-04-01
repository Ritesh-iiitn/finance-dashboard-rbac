export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleGuard } from "@/lib/rbac";

export const GET = withRoleGuard("ANALYST", async (req: NextRequest) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);

    const records = await prisma.financialRecord.findMany({
      where: {
        isDeleted: false,
        date: { gte: twelveMonthsAgo },
      },
      orderBy: { date: "asc" },
    });

    const trendsMap: Record<string, { totalIncome: number; totalExpenses: number }> = {};
    
    // Initialize 12 months array
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const current = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      trendsMap[label] = { totalIncome: 0, totalExpenses: 0 };
    }

    records.forEach((record) => {
      const d = new Date(record.date);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (trendsMap[label]) {
        if (record.type === "INCOME") trendsMap[label].totalIncome += record.amount;
        if (record.type === "EXPENSE") trendsMap[label].totalExpenses += record.amount;
      }
    });

    const data = Object.keys(trendsMap).map((month) => ({
      month,
      totalIncome: trendsMap[month].totalIncome,
      totalExpenses: trendsMap[month].totalExpenses,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});
