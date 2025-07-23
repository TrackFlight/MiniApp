import {sessionStore} from "./api";

export function T(id: string, values: Record<string, string> = {}): string {
    const template = sessionStore.langPack[id];
    if (!template) return `%${id}%`;
    return template.replace(/\{\{\.(\w+)}}/g, (_, key) => {
        return values[key] != null ? values[key] : '';
    });
}

export function ReadableDateDifference(from: number, to: number): string {
    if (to < from) {
        return T('TIME_NOW');
    }
    const seconds = to - from;

    const units: { seconds: number; key: string }[] = [
        { seconds: 365 * 24 * 3600, key: 'TIME_YEARS' },
        { seconds: 30 * 24 * 3600, key: 'TIME_MONTHS' },
        { seconds: 7 * 24 * 3600, key: 'TIME_WEEKS' },
        { seconds: 24 * 3600, key: 'TIME_DAYS' },
        { seconds: 3600, key: 'TIME_HOURS' },
        { seconds: 60, key: 'TIME_MINUTES' },
        { seconds: 1, key: 'TIME_SECONDS' },
    ];

    for (const unit of units) {
        if (seconds >= unit.seconds) {
            const amount = Math.floor(seconds / unit.seconds);
            return T(unit.key, { Amount: amount.toString() });
        }
    }

    return T('TIME_NOW');
}