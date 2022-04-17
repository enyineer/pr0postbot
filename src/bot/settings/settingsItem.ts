export class SettingsItem<T extends Stringable> {
    private _validValues: T[];

    constructor(validValues: T[]) {
        this._validValues = validValues;
    }

    isValidValue(value: T) {
        return this.findIndex(value) > -1;
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
            throw new Error(`Could not find currentValue ${JSON.stringify(currentValue, null, 2)} in validValues ${JSON.stringify(this._validValues, null, 2)}`);
        }

        return currentIndex;
    }
}

export type Stringable = {
    toString(): string;
}