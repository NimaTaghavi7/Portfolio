import type { DefaultJWT } from "next-auth/jwt";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    sessionVersion?: number;
  }

  interface Session extends DefaultSession {
    user: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
      sessionVersion?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    sessionVersion?: number;
  }
}
