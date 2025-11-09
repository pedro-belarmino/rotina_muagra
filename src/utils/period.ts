
export const daysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
};

export const daysInYear = (year: number): number => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
};

export const daysInMonthFor = (date: Date): number => {
    return daysInMonth(date.getFullYear(), date.getMonth() + 1);
}

export const daysInYearFor = (date: Date): number => {
    return daysInYear(date.getFullYear());
}
