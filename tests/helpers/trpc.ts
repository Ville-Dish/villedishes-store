import type { createTRPCContext } from "@/trpc/init";

export type TrpcContext = Awaited<ReturnType<typeof createTRPCContext>>;

const defaultMockSession = {
  user: { id: "mock-user-id", name: "Mock User", email: "mock@example.com" },
  session: {
    id: "mock-session-id",
    userId: "mock-user-id",
    expiresAt: new Date(),
  },
} as unknown as TrpcContext["session"];

export function mockTrpcContext(
  session: TrpcContext["session"] = defaultMockSession,
): TrpcContext {
  return { req: undefined, session };
}
