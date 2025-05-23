export async function hashString(string: string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  return Array.from(new Uint8Array(hashBuffer))
    .map((bytes) => bytes.toString(16).padStart(2, "0"))
    .join("");
}
