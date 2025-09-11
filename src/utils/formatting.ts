export function formatMeasure(measure: string) {
    switch (measure) {
        case 'repetition':
            return 'repetições';
        case 'minute':
            return 'minutos';

        default:
            return measure

    }
}