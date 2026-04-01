export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleGuard } from "@/lib/rbac";

export const GET = withRoleGuard("VIEWER", async (req: NextRequest) => {
  try {
    const records = await prisma.financialRecord.findMany({
      where: { isDeleted: false },
      orderBy: { date: "desc" },
      take: 10,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});
