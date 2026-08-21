import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  assertImageBytesAreValid,
  contentTypes,
  imageUrl,
  verifyRemoteImage,
} from "./article-image-verification";

const articleImageDirectory = resolve(process.argv[2] ?? "public/images/articles");
const articleImageEndpoint = process.env.ARTICLE_IMAGE_ENDPOINT ?? "https://stillbrook.dev";
const imagesSecret = process.env.IMAGES_SECRET;

if (!imagesSecret) {
  throw new Error("IMAGES_SECRET must be set to upload article images");
}

const entries = await readdir(articleImageDirectory, { withFileTypes: true });
const imageNames = entries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => contentTypes.has(name.split(".").at(-1)?.toLowerCase() ?? ""))
  .sort();

for (const imageName of imageNames) {
  const contentType = contentTypes.get(imageName.split(".").at(-1)?.toLowerCase() ?? "");
  if (!contentType) continue;

  const imageBytes = await readFile(resolve(articleImageDirectory, imageName));
  await assertImageBytesAreValid(imageName, contentType, imageBytes);
  const url = imageUrl(articleImageEndpoint, imageName);

  const response = await fetch(url, {
    body: imageBytes,
    headers: {
      authorization: `Bearer ${imagesSecret}`,
      "content-type": contentType,
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(`failed to upload ${imageName}: ${response.status} ${await response.text()}`);
  }

  await verifyRemoteImage(url, imageName, contentType, imageBytes);
  console.log(`uploaded and verified ${imageName}`);
}
