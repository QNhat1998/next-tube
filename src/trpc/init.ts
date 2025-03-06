import { db } from "@/db";
import { user } from "@/db/schema";
import { ratelimit } from "@/lib/ratelimit";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import superjson from "superjson";
export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  return { clerkUserId: userId };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;


export const protectedProcedure = t.procedure.use(async function isAuthed(
  otps
) {
  const { ctx } = otps;
  if (!ctx.clerkUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const [users] = await db
    .select()
    .from(user)
    .where(eq(user.clerkId, ctx.clerkUserId))
    .limit(1);

  if (!users) {
    throw new TRPCError({code: "UNAUTHORIZED"})
  }

  const {success} = await ratelimit.limit(users.id)
  if(!success){
    throw new TRPCError({code: 'TOO_MANY_REQUESTS'})
  }
  return otps.next({
    ctx: {
      ...ctx,
      users,
    },
  });
});
