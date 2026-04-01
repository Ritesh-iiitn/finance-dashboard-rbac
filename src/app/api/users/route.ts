import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRoleGuard } from "@/lib/rbac";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]),
});

export const GET = withRoleGuard("ADMIN", async (req: NextRequest) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});

export const POST = withRoleGuard("ADMIN", async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: "ACTIVE",
      },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
});
