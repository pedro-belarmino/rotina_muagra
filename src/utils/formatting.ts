export function formatMeasure(measure: string) {
    switch (measure) {
        case 'repetition':
            return 'repetições';
        case 'minute':
            return 'minutos';
        case 'hour':
            return 'horas';

        default:
            return measure

    }
}
export function formatData(data: string): string {
    const partes = data.split('-');

    if (partes.length !== 3) {
        return '--';
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
}