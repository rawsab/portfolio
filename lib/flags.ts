/** Blog routes and the homepage Writing section are visible only when ENABLE_BLOGS=true. */
export function isBlogEnabled() {
  return process.env.ENABLE_BLOGS === "true";
}
