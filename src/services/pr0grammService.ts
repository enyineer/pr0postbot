import fetch from 'node-fetch';
import { Subject } from 'rxjs';
import { Update } from '../bot/update';
import { Logger } from '../logger/logger';
import { Pr0grammItemService } from './pr0grammItemService';
export class Pr0grammService {

    private readonly itemsEndpoint: string;
    private readonly flags: string;
    private readonly promoted: string;
    private readonly pr0grammCookies: string;

    private readonly updateSubject: Subject<Update>;

    private isStarted: boolean;
    private coldStart: boolean;
    private timer: NodeJS.Timer | null;

    private pr0grammItemService: Pr0grammItemService;

    private updateIntervalInMinutes: number;

    private static instance: Pr0grammService;
   
    public static getInstance(): Pr0grammService {
        if (Pr0grammService.instance === undefined) {
            Pr0grammService.instance = new Pr0grammService();
        }
        return Pr0grammService.instance;
    }

    public getUpdateObservable() {
        return this.updateSubject.asObservable();
    }

    public start() {
        if (!this.isStarted) {
            this.processItems();
            this.timer = setInterval(this.processItems, this.updateIntervalInMinutes * 60 * 1000);
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
        this.updateSubject = new Subject();

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

        if (process.env.PR0GRAMM_UPDATE_INTERVAL_IN_MINUTES === undefined) {
            throw new Error("PR0GRAMM_UPDATE_INTERVAL_IN_MINUTES is not defined in .env");
        }
        this.updateIntervalInMinutes = parseInt(process.env.PR0GRAMM_UPDATE_INTERVAL_IN_MINUTES);
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
        Logger.i.info("Fetching pr0gramm updates...");
        try {
            const fetchedItems = await this.fetchItems();
            let foundItems = 0;

            const fetchedItemIds = fetchedItems.items.map(item => item.id);

            // Find all items in database that do exist for the list of items we just got from the API
            const existingItems = await this.pr0grammItemService.findMany({
                id: {
                    in: fetchedItemIds
                }
            });

            const newItems: Pr0grammItem[] = [];

            for (const item of fetchedItems.items) {
                // If the current item is in the list of existing items from the db, just skip
                if (existingItems.findIndex(el => el.id === item.id) > -1) {
                    continue;
                }

                if (!this.validateItem(item)) {
                    continue;
                }

                foundItems++;
                
                await this.pr0grammItemService.create(item);

                newItems.push(item);
            }

            Logger.i.info(`Found ${foundItems} new items.`);

            if (this.coldStart) {
                Logger.i.info(`Not broadcasting new items because coldStart is true.`);
            }

            // After the bot is started, we don't want all new items to be pushed to chats to prevent
            // the bot from being rate limited. New items will only be added to the database as known items
            // so that we don't send them with the next update period.
            if (!this.coldStart) {
                this.updateSubject.next(new Update(newItems));
            }

            this.coldStart = false;
        } catch (err) {
            if (err instanceof Error) {
                Logger.i.error(`Could not fetch Pr0gramm update: ${err.message}`);
            }
        }
        Logger.i.info("Finished fetching updates.");
    }

    private validateItem(item: Pr0grammItem) {

        if (item.id === undefined || item.id < 1) {
            Logger.i.error(`Item has empty id`, item);
            return false;
        }

        if (item.user === undefined || item.user === "") {
            Logger.i.error(`Item has empty user`, item);
            return false;
        }

        if (item.image === undefined || item.image === "") {
            Logger.i.error(`Item has empty image`, item);
            return false;
        }

        if (item.height === undefined || item.height < 1) {
            Logger.i.error(`Item has invalid height`, item);
            return false;
        }

        if (item.width === undefined || item.width < 1) {
            Logger.i.error(`Item has invalid width`, item);
            return false;
        }

        return true;
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