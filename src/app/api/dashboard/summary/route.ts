export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleGuard } from "@/lib/rbac";

export const GET = withRoleGuard(["ANALYST", "ADMIN"], async (req: NextRequest) => {
  try {
    const records = await prisma.financialRecord.findMany({
      where: { isDeleted: false },
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    records.forEach((record: any) => {
      if (record.type === "INCOME") totalIncome += record.amount;
      if (record.type === "EXPENSE") totalExpenses += record.amount;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        totalRecords: records.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});
