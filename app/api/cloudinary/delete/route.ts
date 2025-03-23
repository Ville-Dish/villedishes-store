import cloudinary from "@/lib/cloudinary";

export const POST = async (req: Request) => {
  const { assetId } = await req.json();

  if (!assetId) {
    return Response.json({ message: "Asset ID is required" }, { status: 400 });
  }

  try {
    const asset = await cloudinary.api.resources_by_asset_ids([assetId]);

    await cloudinary.api.delete_resources([asset.resources[0].public_id]);
    return Response.json(
      { message: "Asset deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting Cloudinary resource:", error);
    return Response.json(
      { message: "Failed to delete resource" },
      { status: 500 }
    );
  }
};
