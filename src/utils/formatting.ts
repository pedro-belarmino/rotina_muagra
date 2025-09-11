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