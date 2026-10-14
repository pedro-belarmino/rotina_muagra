// Fonte de verdade do enforcement de admin. A lista equivalente em
// src/utils/admin.ts serve apenas para a UI e não protege nada: ela é
// enviada no bundle e pode ser contornada pelo cliente.
export const adminEmails = [
  "fabiomarcheriserrano@gmail.com",
  "pedro.gbelarmino@gmail.com",
  "crispserranom@gmail.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails.includes(email.toLowerCase());
}
