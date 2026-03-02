import { z } from "zod";
import { TRPCError } from "@trpc/server";
import cloudinary from "@/lib/cloudinary";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const cloudinaryRouter = createTRPCRouter({
  deleteAsset: protectedProcedure
    .input(
      z.object({
        assetId: z.string().min(1, "Asset ID is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const { assetId } = input;

      try {
        // Fetch asset by assetId
        const asset = await cloudinary.api.resources_by_asset_ids([assetId]);

        if (!asset.resources) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Asset not found",
          });
        }

        // Delete the asset
        await cloudinary.api.delete_resources([asset.resources[0].public_id]);

        return {
          message: "Asset deleted successfully",
        };
      } catch (error: any) {
        console.error("Error deleting Cloudinary resource:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to delete resource",
        });
      }
    }),
});
