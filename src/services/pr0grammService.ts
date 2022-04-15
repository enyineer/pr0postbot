import fetch from 'node-fetch';
import { Subject } from 'rxjs';
import { Pr0grammItemService } from './pr0grammItemService';

export class Pr0grammService {

    private readonly itemsEndpoint: string;
    private readonly flags: string;
    private readonly promoted: string;
    private readonly pr0grammCookies: string;

    private readonly pr0grammItemUpdateSubject: Subject<Pr0grammItem>;

    private isStarted: boolean;
    private coldStart: boolean;
    private timer: NodeJS.Timer | null;

    private pr0grammItemService: Pr0grammItemService;

    private static instance: Pr0grammService;
   
    public static getInstance(): Pr0grammService {
        if (Pr0grammService.instance === undefined) {
            Pr0grammService.instance = new Pr0grammService();
        }
        return Pr0grammService.instance;
    }

    public getItemObservable() {
        return this.pr0grammItemUpdateSubject.asObservable();
    }

    public start() {
        if (!this.isStarted) {
            this.processItems();
            this.timer = setInterval(this.processItems, 60000);
            this.isStarted = true;
        }
    }

    public stop() {
        if (this.isStarted && this.timer !== null) {
            clearInterval(this.timer);
            this.isStarted = false;
        }
    }

    private constructor() {
        this.pr0grammItemUpdateSubject = new Subject();

        this.isStarted = false;
        this.coldStart = true;
        this.timer = null;

        this.pr0grammItemService = new Pr0grammItemService();

        if (process.env.PR0GRAMM_ITEM_ENDPOINT === undefined) {
            throw new Error("PR0GRAMM_ITEM_ENDPOINT is not defined in .env");
        }
        this.itemsEndpoint = process.env.PR0GRAMM_ITEM_ENDPOINT;

        if (process.env.PR0GRAMM_ITEM_FLAGS === undefined) {
            throw new Error("PR0GRAMM_ITEM_FLAGS is not defined in .env");
        }
        this.flags = process.env.PR0GRAMM_ITEM_FLAGS;

        if (process.env.PR0GRAMM_ITEM_PROMOTED === undefined) {
            throw new Error("PR0GRAMM_ITEM_PROMOTED is not defined in .env");
        }
        this.promoted = process.env.PR0GRAMM_ITEM_PROMOTED;

        if (process.env.PR0GRAMM_COOKIES === undefined) {
            throw new Error("PR0GRAMM_COOKIES is not defined in .env");
        }
        this.pr0grammCookies = process.env.PR0GRAMM_COOKIES;
    }

    private async fetchItems(): Promise<Pr0grammItemResponse> {
        const headers = {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
            "Cache-Control": "no-cache",
            "Cookie": this.pr0grammCookies,
            "Host": "pr0gramm.com",
            "Referer": "https://pr0gramm.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0",
            "X-Requested-With": "XMLHttpRequest"
        }

        const response = await fetch(`${this.itemsEndpoint}?flags=${this.flags}&promoted=${this.promoted}`, {
            headers
        });

        if (response.status !== 200) {
            throw new Error(`Got invalid status code ${response.status} while trying to get new pr0gramm items.`);
        }
        
        return await response.json() as Pr0grammItemResponse;
    }

    private processItems = async () => {
        console.log("Fetching pr0gramm updates...");
        try {
            const fetchedItems = await this.fetchItems();
            let foundItems = 0;

            for (const item of fetchedItems.items) {
                const itemId = item.id;
                const existingItem = await this.pr0grammItemService.findUnique({ id: itemId });

                if (existingItem !== null) {
                    continue;
                }

                foundItems++;

                await this.pr0grammItemService.create(item);

                // After the bot is started, we don't want all new items to be pushed to chats to prevent
                // the bot from being rate limited. New items will only be added to the database as known items
                // so that we don't send them with the next update period.
                if (!this.coldStart) {
                    this.pr0grammItemUpdateSubject.next(item);
                }
            }

            console.log(`Found ${foundItems} new items.`);

            if (this.coldStart) {
                console.log(`Not broadcasting new items because coldStart is true.`);
            }

            this.coldStart = false;
        } catch (err) {
            if (err instanceof Error) {
                console.error(`Could not fetch Pr0gramm update: ${err.message}`);
            }
        }
        console.log("Finished fetching updates.");
    }

}

export type Pr0grammItemResponse = {
    atEnd: boolean;
    atStart: boolean;
    error: string;
    items: Pr0grammItem[];
    ts: number;
    cache: string;
    rt: number;
    qc: number;
}

export type Pr0grammItem = {
    id: number;
    promoted: number;
    userId: number;
    up: number;
    down: number;
    created: number;
    image: string;
    thumb: string;
    fullsize: string;
    width: number;
    height: number;
    audio: boolean;
    source: string;
    flags: number;
    user: string;
    mark: number;
    gift: number;
}