// /src/utils/periodUtils.ts
export function formatISODate(d: Date): string {
    const year = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
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
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        return formatISODate(start);
    }
    if (type === 'weekly') {
        // start = most recent Sunday
        const d = new Date(date);
        const day = d.getDay(); // 0 = Sunday
        const diff = d.getDate() - day;
        const sunday = new Date(d.setDate(diff));
        sunday.setHours(0, 0, 0, 0);
        return formatISODate(sunday);
    }
    return null;
}

export function daysInMonthFor(date: Date): number {
    const y = date.getFullYear();
    const m = date.getMonth();
    return new Date(y, m + 1, 0).getDate();
}
