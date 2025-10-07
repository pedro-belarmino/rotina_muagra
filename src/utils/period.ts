// /src/utils/periodUtils.ts
export function formatISODate(d: Date): string {
    const year = d.getUTCFullYear();
    const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = d.getUTCDate().toString().padStart(2, '0');
    return `${year}-${m}-${day}`;
}

/** Retorna string YYYY-MM-DD representando o início do período para `type` dado `date`.
 *  - 'monthly' => primeiro dia do mês
 *  - 'weekly' => domingo mais próximo (começo da semana = domingo), conforme seu requisito: "todo domingo a contagem volta para 0"
 *  - outras => null
 */
export function getPeriodStartForType(date: Date, type?: 'monthly' | 'weekly' | 'general' | ''): string | null {
    if (!type) return null;
    if (type === 'monthly') {
        const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
        return formatISODate(start);
    }
    if (type === 'weekly') {
        // start = most recent Sunday
        const d = new Date(date);
        const day = d.getUTCDay(); // 0 = Sunday
        const diff = d.getUTCDate() - day;
        const sunday = new Date(d.setUTCDate(diff));
        sunday.setUTCHours(0, 0, 0, 0);
        return formatISODate(sunday);
    }
    return null;
}

export function daysInMonthFor(date: Date): number {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth();
    return new Date(y, m + 1, 0).getUTCDate();
}
export function daysInYearFor(date: Date): number {
    const y = date.getUTCFullYear();
    // Ano bissexto tem 366 dias, caso contrário 365
    return ((y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0)) ? 366 : 365;
}

/**
 * Retorna um objeto Date representando o horário atual em Brasília (UTC-3).
 * Isso é crucial para garantir que operações baseadas no "dia atual" (como criar um log)
 * usem a perspectiva do usuário no Brasil, não a do servidor (que pode estar em UTC).
 */
export function getNowInBrasilia(): Date {
    const now = new Date();
    // getTime() retorna UTC. getTimezoneOffset() retorna a diferença em MINUTOS entre UTC e o local.
    // Queremos UTC-3, então precisamos ajustar o offset local para o offset de Brasília.
    const localOffsetInMs = now.getTimezoneOffset() * 60 * 1000;
    const brasiliaOffsetInMs = -3 * 60 * 60 * 1000; // UTC-3
    const utcTime = now.getTime() + localOffsetInMs;
    return new Date(utcTime + brasiliaOffsetInMs);
}