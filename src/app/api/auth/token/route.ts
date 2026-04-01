import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "default_secret";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedCredentials = z
      .object({ email: z.string().email(), password: z.string().min(6) })
      .safeParse(body);

    if (!parsedCredentials.success) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 400 });
    }

    const { email, password } = parsedCredentials.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
