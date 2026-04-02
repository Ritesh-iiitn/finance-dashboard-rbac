import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "default_secret";

export type Role = "VIEWER" | "ANALYST" | "ADMIN";

export function withRoleGuard(
  allowedRoles: Role | Role[],
  handler: (req: NextRequest, session: any, params?: any) => Promise<Response> | Response
) {
  return async (req: NextRequest, { params }: { params?: any } = {}) => {
    let session = await auth();

    if (!session || !session.user) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          session = { user: decoded } as any;
        } catch (err) {
          // invalid or expired token
        }
      }
    }
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = session.user.role as Role;
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!allowed.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Role not permitted for this resource" },
        { status: 403 }
      );
    }

    return handler(req, session, params);
  };
}
