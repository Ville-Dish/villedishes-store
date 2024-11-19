"use server";

import fs from "fs";
import path from "path";

export async function imageToBase64(relativePath: string): Promise<string> {
  if (typeof window !== "undefined") {
    throw new Error("imageToBase64 can only be executed on the server side.");
  }
  const publicDir = path.join(process.cwd(), "public");
  const filePath = path.join(publicDir, relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    await fs.promises.access(filePath); // Check if the file exists
  } catch (error) {
    console.log("Error: ", error);
    throw new Error(`File not found: ${filePath}`);
  }

  const fileData = await fs.promises.readFile(filePath);
  const base64Data = fileData.toString("base64");
  const fileExtension = path.extname(filePath).slice(1).toLowerCase();

  let mimeType: string;
  switch (fileExtension) {
    case "svg":
      mimeType = "image/svg+xml";
      break;
    case "png":
      mimeType = "image/png";
      break;
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }

  return `data:${mimeType};base64,${base64Data}`;
}
