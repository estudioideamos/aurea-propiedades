const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function siteAsset(path: string) {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}