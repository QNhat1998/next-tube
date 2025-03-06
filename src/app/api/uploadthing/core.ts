import { db } from "@/db";
import { user, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();
export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        videoId: z.string().uuid(),
      })
    )
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [users] = await db
      .select()
      .from(user)
      .where(eq(user.clerkId,clerkUserId))

      if (!users) throw new UploadThingError("Unauthorized");


      return { users, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(videos)
        .set({
          thumbnailUrl: file.url,
        })
        .where(
          and(
            eq(videos.userId, metadata.users.id),
            eq(videos.id, metadata.videoId)
          )
        );

      return { uploadedBy: metadata.users.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
