// Telefones são persistidos em E.164 (ex.: +5511999999999): "+", código do país
// (1–3 dígitos, sem zero à esquerda) e número nacional, com no máximo 15 dígitos.
// A mesma regra é aplicada em firestore.rules e na callable updatePhoneNumber.
export const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export const DEFAULT_COUNTRY_CODE = "+55";

const COUNTRY_CODE_REGEX = /^\+[1-9]\d{0,2}$/;

export function isValidE164(value: unknown): value is string {
    return typeof value === "string" && E164_REGEX.test(value);
}

export function normalizeCountryCode(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    return digits ? `+${digits}` : "";
}

// Remove máscara e o prefixo de tronco nacional ("0"), que não faz parte do E.164.
export function normalizeNationalNumber(raw: string): string {
    return raw.replace(/\D/g, "").replace(/^0+/, "");
}

export type PhoneValidationResult =
    | { ok: true; e164: string }
    | { ok: false; field: "countryCode" | "number"; message: string };

export function buildE164(countryCodeRaw: string, numberRaw: string): PhoneValidationResult {
    const countryCode = normalizeCountryCode(countryCodeRaw);
    if (!countryCode) {
        return { ok: false, field: "countryCode", message: "Informe o código do país." };
    }
    if (!COUNTRY_CODE_REGEX.test(countryCode)) {
        return { ok: false, field: "countryCode", message: "Código do país inválido." };
    }

    const national = normalizeNationalNumber(numberRaw);
    if (!national) {
        return { ok: false, field: "number", message: "Informe o número de celular." };
    }

    // Brasil: DDD (2 dígitos) + número de celular (9 dígitos, iniciando em 9).
    if (countryCode === "+55" && !/^[1-9]{2}9\d{8}$/.test(national)) {
        return { ok: false, field: "number", message: "Informe DDD + número de celular (ex.: 11 91234-5678)." };
    }

    const e164 = `${countryCode}${national}`;
    if (national.length < 4 || !E164_REGEX.test(e164)) {
        return { ok: false, field: "number", message: "Número de celular inválido para o código informado." };
    }

    return { ok: true, e164 };
}
