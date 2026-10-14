import "server-only";

export function isAdministrator(email: string) {
  const administratorEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLocaleLowerCase())
    .filter(Boolean);

  return administratorEmails.includes(email.trim().toLocaleLowerCase());
}
