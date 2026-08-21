import { readFile } from "node:fs/promises";
import {
  contentTypes,
  imageNameFromPath,
  imageUrl,
  verifyRemoteImage,
} from "./article-image-verification";

const articleImageEndpoint = process.env.ARTICLE_IMAGE_ENDPOINT ?? "https://stillbrook.dev";
const routePaths = process.argv.slice(2).filter((routePath) => routePath !== "--");
const imageNames = new Set<string>();

for (const routePath of routePaths) {
  const source = await readFile(routePath, "utf8");
  for (const match of source.matchAll(/src:\s*["'](\/images\/articles\/[^"']+)["']/g)) {
    const imageName = imageNameFromPath(match[1]);
    if (!imageName) {
      throw new Error(`invalid article image path in ${routePath}: ${match[1]}`);
    }
    imageNames.add(imageName);
  }
}

for (const imageName of [...imageNames].sort()) {
  const contentType = contentTypes.get(imageName.split(".").at(-1)?.toLowerCase() ?? "");
  if (!contentType) continue;
  await verifyRemoteImage(imageUrl(articleImageEndpoint, imageName), imageName, contentType);
  console.log(`verified ${imageName}`);
}
