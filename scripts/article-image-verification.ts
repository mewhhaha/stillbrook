import sharp from "sharp";

export const contentTypes = new Map([
  ["avif", "image/avif"],
  ["gif", "image/gif"],
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["webm", "video/webm"],
]);

const decodableContentTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function imageNameFromPath(imagePath: string): string | null {
  const prefix = "/images/articles/";
  if (!imagePath.startsWith(prefix)) return null;

  let imageName: string;
  try {
    imageName = decodeURIComponent(imagePath.slice(prefix.length).split("?", 1)[0]);
  } catch {
    return null;
  }

  if (!imageName || imageName.includes("/") || imageName.includes("\\") || imageName.includes("..")) {
    return null;
  }

  return contentTypes.has(imageName.split(".").at(-1)?.toLowerCase() ?? "") ? imageName : null;
}

export function imageUrl(endpoint: string, imageName: string): URL {
  return new URL(`/images/articles/${encodeURIComponent(imageName)}`, endpoint);
}

export async function assertImageBytesAreValid(
  imageName: string,
  contentType: string,
  imageBytes: Uint8Array,
): Promise<void> {
  if (!decodableContentTypes.has(contentType)) return;

  try {
    const metadata = await sharp(imageBytes).metadata();
    if (!metadata.format || !metadata.width || !metadata.height) {
      throw new Error("missing image format or dimensions");
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid image ${imageName}: ${detail}`);
  }
}

export async function verifyRemoteImage(
  url: URL,
  imageName: string,
  contentType: string,
  expectedBytes?: Uint8Array,
): Promise<void> {
  const response = await fetch(url, {
    headers: { "cache-control": "no-cache" },
  });

  if (!response.ok) {
    throw new Error(`failed to verify ${imageName}: ${response.status} ${await response.text()}`);
  }

  const actualContentType = response.headers.get("content-type")?.split(";", 1)[0].toLowerCase();
  if (actualContentType !== contentType) {
    throw new Error(
      `failed to verify ${imageName}: expected content-type ${contentType}, got ${actualContentType ?? "missing"}`,
    );
  }

  const uploadedBytes = new Uint8Array(await response.arrayBuffer());
  await assertImageBytesAreValid(imageName, contentType, uploadedBytes);

  if (!expectedBytes) return;
  if (uploadedBytes.byteLength !== expectedBytes.byteLength) {
    throw new Error(
      `failed to verify ${imageName}: expected ${expectedBytes.byteLength} bytes, got ${uploadedBytes.byteLength}`,
    );
  }

  for (let index = 0; index < expectedBytes.byteLength; index += 1) {
    if (uploadedBytes[index] !== expectedBytes[index]) {
      throw new Error(`failed to verify ${imageName}: uploaded bytes differ at byte ${index}`);
    }
  }
}
