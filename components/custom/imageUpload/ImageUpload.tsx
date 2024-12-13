"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  onRemoveError?: (error: string) => void;
}

type Result = {
  event: string;
  info: { secure_url: string };
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  onRemoveError,
}) => {
  const onUpload = (result: any) => {
    onChange(result.info.secure_url);

    if (onRemoveError) {
      onRemoveError("");
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
              className="bg-gray-500 text-white"
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
