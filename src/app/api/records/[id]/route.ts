export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleGuard } from "@/lib/rbac";
import { z } from "zod";

const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().min(1).optional(),
  date: z.string().transform((str) => new Date(str)).optional(),
  description: z.string().optional(),
});

export const PUT = withRoleGuard("ADMIN", async (req: NextRequest, session: any, params: { id: string }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateRecordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const recordExists = await prisma.financialRecord.findUnique({ where: { id } });
    if (!recordExists || recordExists.isDeleted) {
      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    const updated = await prisma.financialRecord.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});

export const DELETE = withRoleGuard("ADMIN", async (req: NextRequest, session: any, params: { id: string }) => {
  try {
    const { id } = await params;
    
    const recordExists = await prisma.financialRecord.findUnique({ where: { id } });
    if (!recordExists || recordExists.isDeleted) {
      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    await prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});
