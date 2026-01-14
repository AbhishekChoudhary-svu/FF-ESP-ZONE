export function getPublicIdFromUrl(url) {
  const parts = url.split("/");
  const uploadIndex = parts.findIndex((p) => p === "upload");

  if (uploadIndex === -1) return null;

  // remove version (v123)
  const publicPath = parts
    .slice(uploadIndex + 2)
    .join("/")
    .replace(/\.[^/.]+$/, "");

  return publicPath;
}
