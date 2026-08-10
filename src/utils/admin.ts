export const adminEmails = [
    "fabiomarcheriserrano@gmail.com",
    // "pedro.gbelarmino@gmail.com",
    "crispserranom@gmail.com",
    "",
];

export const isAdmin = (email: string | null | undefined) => {
    if (!email) return false;
    return adminEmails.includes(email.toLowerCase());
};
