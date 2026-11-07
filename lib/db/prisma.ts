import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let client: PrismaClient | undefined;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Configure the pooled Neon connection string in the deployment environment."
    );
  }

  const adapter = new PrismaPg({
    connectionString,
    // Serverless functions and the local Prisma dev server work best with a
    // single connection per process. Neon pools connections at the proxy.
    max: 1,
  });

  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  if (!client) {
    client = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
  }
  return client;
}

/**
 * Lazy Prisma proxy.
 *
 * Creating the client at module scope made `next build` fail whenever
 * DATABASE_URL was absent during page-data collection. Deferring the
 * connection until the first actual query keeps builds environment-safe
 * while still failing closed at request time.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const active = getClient();
    const value = Reflect.get(active, property, active);
    return typeof value === "function" ? value.bind(active) : value;
  },
});
