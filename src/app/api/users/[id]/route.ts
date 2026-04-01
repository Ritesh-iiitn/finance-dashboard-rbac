export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleGuard } from "@/lib/rbac";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const PUT = withRoleGuard("ADMIN", async (req: NextRequest, session: any, params: { id: string }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const userExists = await prisma.user.findUnique({ where: { id } });
    if (!userExists) {
      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    // Prevent removing your own admin access potentially, but for simplicity we allow standard update
    if (userExists.id === session.user.id && parsed.data.status === "INACTIVE") {
      return NextResponse.json({ success: false, error: "Cannot deactivate yourself" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});

export const DELETE = withRoleGuard("ADMIN", async (req: NextRequest, session: any, params: { id: string }) => {
  try {
    const { id } = await params;
    
    if (id === session.user.id) {
      return NextResponse.json({ success: false, error: "Cannot delete yourself" }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({ where: { id } });
    if (!userExists) {
      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});
