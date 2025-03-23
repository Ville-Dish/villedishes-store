"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

// Use the type provided by Cloudinary for the upload widget result
import { CloudinaryUploadWidgetResults } from "next-cloudinary";
import cloudinary from "@/lib/cloudinary";

interface ImageUploadProps {
  value: string;
  assetId?: string;
  onChange: (url: string, assetId: string) => void;
  onRemove: () => void;
  onRemoveError?: (error: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  assetId,
  onChange,
  onRemove,
  onRemoveError,
}) => {
  const onUpload = (result: CloudinaryUploadWidgetResults) => {
    // Delete the old asset it its exists
    if (assetId) {
      cloudinary.api.delete_resources([assetId], async (error, result) => {
        if (error) {
          console.error(error);
        }

        if (result.result === "ok") {
          // Update the product with the new asset ID
          console.log("Deleted old asset");
        }
      });
    }
    const info = result.info;
    // Check if 'info' is of type CloudinaryUploadWidgetInfo and has 'secure_url'
    if (info && typeof info !== "string" && "secure_url" in info) {
      onChange(info.secure_url, info.asset_id);
      if (onRemoveError) {
        onRemoveError("");
      }
    } else {
      console.error("Secure URL not found in upload result:", result);
      if (onRemoveError) {
        onRemoveError("Upload failed: Secure URL not found.");
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value && (
          <div className="relative w-[200px] h-[200px]">
            <div className="absolute top-0 right-0 z-10">
              <Button
                type="button"
                onClick={onRemove}
                size="sm"
                className="bg-red-500 text-white"
              >
                <Trash className="w-3 h-3" />
              </Button>
            </div>
            <Image
              src={value}
              alt="uploaded image"
              fill
              sizes="100%"
              className="object-cover rounded-lg"
            />
          </div>
        )}
      </div>
      <CldUploadWidget
        uploadPreset="vqowsaqk"
        onSuccess={onUpload}
        onError={(error) => console.log("Error uploading to cloudinary", error)}
      >
        {({ open }) => {
          return (
            <Button
              type="button"
              className="bg-[#e7a7a3] text-white"
              onClick={() => {
                try {
                  open();
                } catch (error) {
                  console.error("Error opening upload widget:", error);
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
