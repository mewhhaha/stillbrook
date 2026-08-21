import reactRouterRscWorker, {
  fetchServer,
  unstable_reactRouterServeConfig,
} from "@react-router/dev/config/default-rsc-entries/entry.rsc";

export { fetchServer, unstable_reactRouterServeConfig };

const articleImagePath = "/images/articles/";
const cacheControl = "public, max-age=3600";
const articleImageCache = "article-images";

const contentTypes = new Map([
  ["avif", "image/avif"],
  ["gif", "image/gif"],
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["webm", "video/webm"],
]);

function articleImageKey(request: Request): string | null {
  const encodedKey = new URL(request.url).pathname.slice(articleImagePath.length);

  let key: string;
  try {
    key = decodeURIComponent(encodedKey);
  } catch {
    return null;
  }

  if (!key || key.includes("/") || key.includes("\\") || key.includes("..")) {
    return null;
  }

  return contentTypes.has(key.split(".").at(-1)?.toLowerCase() ?? "") ? key : null;
}

function cacheRequest(request: Request, key: string): Request {
  const url = new URL(request.url);
  url.pathname = `${articleImagePath}${key}`;
  url.search = "";
  return new Request(url.toString());
}

function responseHeaders(object: R2Object): Headers {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", cacheControl);
  headers.set("content-length", String(object.size));
  headers.set("etag", object.httpEtag);
  return headers;
}

async function hasValidUploadSecret(request: Request, secret: string): Promise<boolean> {
  const authorization = request.headers.get("authorization") ?? "";
  const providedSecret = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(providedSecret)),
    crypto.subtle.digest("SHA-256", encoder.encode(secret)),
  ]);

  return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
}

async function uploadArticleImage(request: Request, env: Env, key: string): Promise<Response> {
  if (!(await hasValidUploadSecret(request, env.IMAGES_SECRET))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const contentType = contentTypes.get(key.split(".").at(-1)?.toLowerCase() ?? "");
  if (!contentType || request.headers.get("content-type") !== contentType || !request.body) {
    return new Response("Invalid article image upload", { status: 400 });
  }

  await env.ARTICLE_IMAGES.put(key, request.body, {
    httpMetadata: { cacheControl, contentType },
  });

  const cache = await caches.open(articleImageCache);
  await cache.delete(cacheRequest(request, key));

  return new Response(null, { status: 204 });
}

async function serveArticleImage(request: Request, env: Env, ctx: ExecutionContext, key: string): Promise<Response> {
  if (request.method === "HEAD") {
    const object = await env.ARTICLE_IMAGES.head(key);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(null, { headers: responseHeaders(object) });
  }

  const cache = await caches.open(articleImageCache);
  const cached = await cache.match(cacheRequest(request, key));
  if (cached) return cached;

  const object = await env.ARTICLE_IMAGES.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const response = new Response(object.body, { headers: responseHeaders(object) });
  ctx.waitUntil(cache.put(cacheRequest(request, key), response.clone()));
  return response;
}

async function handleArticleImageRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const key = articleImageKey(request);
  if (!key) return new Response("Not found", { status: 404 });

  if (request.method === "PUT") return uploadArticleImage(request, env, key);
  if (request.method === "GET" || request.method === "HEAD") {
    return serveArticleImage(request, env, ctx, key);
  }

  return new Response("Method not allowed", {
    headers: { allow: "GET, HEAD, PUT" },
    status: 405,
  });
}

export default {
  async fetch(request, env, ctx) {
    if (new URL(request.url).pathname.startsWith("/images/articles/")) {
      return handleArticleImageRequest(request, env, ctx);
    }

    return reactRouterRscWorker.fetch(request, env);
  },
} satisfies ExportedHandler<Env>;
