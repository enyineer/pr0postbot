import { DateTime } from 'luxon';

export class SystemService {

    private static instance: SystemService;

    private _lastStartup: DateTime | null;
    private readonly _BOT_TOKEN: string;
    private readonly _MAX_ITEM_AMOUNT: number;
    private readonly _PR0GRAMM_IMAGE_CDN: string;
    private readonly _PR0GRAMM_VID_CDN: string;
    private readonly _PR0GRAMM_SITE: string;
    private readonly _PR0GRAMM_ITEMS_ENDPOINT: string;
    private readonly _PR0GRAMM_ITEMS_FLAGS: number;
    private readonly _PR0GRAMM_ITEMS_PROMOTED: number;
    private readonly _PR0GRAMM_COOKIES: string;

    static getInstance(): SystemService {
        if (SystemService.instance === undefined) {
            SystemService.instance = new SystemService();
        }
        return SystemService.instance;
    }

    private constructor() {
        this._lastStartup = null;

        this._BOT_TOKEN = this.getEnv("BOT_TOKEN");
        this._MAX_ITEM_AMOUNT = parseInt(this.getEnv("MAX_ITEM_AMOUNT", true));
        this._PR0GRAMM_IMAGE_CDN = this.getEnv("PR0GRAMM_IMAGE_CDN");
        this._PR0GRAMM_VID_CDN = this.getEnv("PR0GRAMM_VID_CDN");
        this._PR0GRAMM_SITE = this.getEnv("PR0GRAMM_SITE");
        this._PR0GRAMM_ITEMS_ENDPOINT = this.getEnv("PR0GRAMM_ITEMS_ENDPOINT");
        this._PR0GRAMM_ITEMS_FLAGS = parseInt(this.getEnv("PR0GRAMM_ITEMS_FLAGS", true));
        this._PR0GRAMM_ITEMS_PROMOTED = parseInt(this.getEnv("PR0GRAMM_ITEMS_PROMOTED", true));
        this._PR0GRAMM_COOKIES = this.getEnv("PR0GRAMM_COOKIES");
    }

    private getEnv(name: string, shouldBeNumber = false): string {
        const val = process.env[name];
        if (val === undefined) {
            throw new Error(`${name} is not defined in .env`);
        }
        if (shouldBeNumber && isNaN(parseInt(val))) {
            throw new Error(`${name} in .env should be numeric but is not`)
        }
        return val;
    }

    get lastStartup(): DateTime {
        if (this._lastStartup === null) {
            throw new Error("lastStartup is not set in SystemService.");
        }
        return this._lastStartup;
    }

    set lastStartup(lastStartup: DateTime) {
        if (this._lastStartup !== null) {
            throw new Error("lastStartup has already been set in SystemService.");
        }
        this._lastStartup = lastStartup;
    }

    get BOT_TOKEN(): string {
        return this._BOT_TOKEN;
    }

    get MAX_ITEM_AMOUNT(): number {
        return this._MAX_ITEM_AMOUNT;
    }

    get PR0GRAMM_IMAGE_CDN(): string {
        return this._PR0GRAMM_IMAGE_CDN;
    }

    get PR0GRAMM_VID_CDN(): string {
        return this._PR0GRAMM_VID_CDN;
    }

    get PR0GRAMM_SITE(): string {
        return this._PR0GRAMM_SITE;
    }

    get PR0GRAMM_ITEMS_ENDPOINT(): string {
        return this._PR0GRAMM_ITEMS_ENDPOINT;
    }

    get PR0GRAMM_ITEMS_FLAGS(): number {
        return this._PR0GRAMM_ITEMS_FLAGS;
    }

    get PR0GRAMM_ITEMS_PROMOTED(): number {
        return this._PR0GRAMM_ITEMS_PROMOTED;
    }

    get PR0GRAMM_COOKIES(): string {
        return this._PR0GRAMM_COOKIES;
    }

}