/** Prepend the Next.js basePath so fetch() works in both dev and production. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function api(path: string): string {
  return `${basePath}${path}`;
}
