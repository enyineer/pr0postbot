export class SettingsItem<T extends Stringable> {
    private _validValues: T[];

    constructor(validValues: T[]) {
        this._validValues = validValues;
    }

    isValidValue(value: T) {
        const foundIndex = this._validValues.map(el => el.toString()).indexOf(value.toString());
        return foundIndex > -1;
    }

    previousValue(currentValue: T): T | null {
        const currentIndex = this.findIndex(currentValue);

        if (currentIndex === 0) {
            return null;
        }

        return this._validValues[currentIndex - 1];
    }

    nextValue(currentValue: T): T | null {
        const currentIndex = this.findIndex(currentValue);

        if (currentIndex === this._validValues.length - 1) {
            return null;
        }

        return this._validValues[currentIndex + 1];
    }

    get validValues(): T[] {
        return this._validValues;
    }

    private findIndex(currentValue: T) {
        const currentIndex = this._validValues.map(el => el.toString()).indexOf(currentValue.toString());

        if (currentIndex === -1) {
            // Use first value of valid values of an old value is set
            return 0;
        }

        return currentIndex;
    }
}

export type Stringable = {
    toString(): string;
}