
export function formatISODate(d: Date): string {
    const year = d.getUTCFullYear();
    const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = d.getUTCDate().toString().padStart(2, '0');
    return `${year}-${m}-${day}`;
}


export function getPeriodStartForType(date: Date, type?: 'monthly' | 'weekly' | 'general' | ''): string | null {
    if (!type) return null;
    if (type === 'monthly') {
        const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
        return formatISODate(start);
    }
    if (type === 'weekly') {

        const d = new Date(date);
        const day = d.getUTCDay();
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

    return ((y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0)) ? 366 : 365;
}


export function getNowInBrasilia(): Date {
    const now = new Date();


    const localOffsetInMs = now.getTimezoneOffset() * 60 * 1000;
    const brasiliaOffsetInMs = -3 * 60 * 60 * 1000;
    const utcTime = now.getTime() + localOffsetInMs;
    return new Date(utcTime + brasiliaOffsetInMs);
}