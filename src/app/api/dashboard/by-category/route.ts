export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleGuard } from "@/lib/rbac";

export const GET = withRoleGuard("ANALYST", async (req: NextRequest) => {
  try {
    const records = await prisma.financialRecord.findMany({
      where: { isDeleted: false },
    });

    const categoryMap: Record<string, { income: number; expense: number }> = {};

    records.forEach((record: any) => {
      const { category, type, amount } = record;
      if (!categoryMap[category]) {
        categoryMap[category] = { income: 0, expense: 0 };
      }
      if (type === "INCOME") categoryMap[category].income += amount;
      if (type === "EXPENSE") categoryMap[category].expense += amount;
    });

    const data = Object.keys(categoryMap).map((category) => ({
      category,
      income: categoryMap[category].income,
      expense: categoryMap[category].expense,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});
