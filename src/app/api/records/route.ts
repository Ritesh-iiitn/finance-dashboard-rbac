export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleGuard } from "@/lib/rbac";
import { z } from "zod";

const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  date: z.string().transform((str) => new Date(str)),
  description: z.string().optional(),
});

export const GET = withRoleGuard(["VIEWER", "ANALYST", "ADMIN"], async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };
    if (type) where.type = type;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { records, total, page, limit },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});

export const POST = withRoleGuard("ADMIN", async (req: NextRequest, session: any) => {
  try {
    const body = await req.json();
    const parsed = createRecordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const record = await prisma.financialRecord.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date,
        description: data.description,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});
