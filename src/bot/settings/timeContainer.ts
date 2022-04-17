export class TimeContainer {

    private readonly _seconds;

    private constructor(seconds: number) {
        this._seconds = seconds;
    }

    static fromSeconds(seconds: number): TimeContainer {
        return new TimeContainer(seconds * TimeUnitsInSeconds.SECOND);
    }

    static fromMinutes(minutes: number): TimeContainer {
        return new TimeContainer(minutes * TimeUnitsInSeconds.MINUTE);
    }

    static fromHours(hours: number): TimeContainer {
        return new TimeContainer(hours * TimeUnitsInSeconds.HOUR);
    }

    static fromDays(days: number): TimeContainer {
        return new TimeContainer(days * TimeUnitsInSeconds.DAY);
    }

    get seconds(): number {
        return this._seconds;
    }

    toString(): string {
        if (this._seconds < TimeUnitsInSeconds.MINUTE) {
            return `${this._seconds} Sek.`;
        }

        if (this._seconds < TimeUnitsInSeconds.HOUR) {
            return `${this.round(this._seconds, TimeUnitsInSeconds.MINUTE)} Min.`;
        }

        if (this._seconds < TimeUnitsInSeconds.DAY) {
            return `${this.round(this._seconds, TimeUnitsInSeconds.HOUR)} Std.`;
        }

        return `${this.round(this._seconds, TimeUnitsInSeconds.DAY)} Tag/e`;
    }

    private round(seconds: number, target: TimeUnitsInSeconds): number {
        return Math.round(((seconds + Number.EPSILON) * 100) / target) / 100;
    }
}

export enum TimeUnitsInSeconds {
    SECOND = 1,
    MINUTE = 60,
    HOUR = 60 * 60,
    DAY = 24 * 60 * 60
}