/**
 * Generate a unique, user-friendly join code for projects.
 * Format: 8-character alphanumeric (uppercase)
 * Example: A7FX9KJ2
 */
export function generateJoinCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
