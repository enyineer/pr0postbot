import EventEmitter from "events";
import { TimeUnitsInSeconds } from "../../bot/settings/timeContainer";
import { Logger } from "../../logger/logger";
import { Pr0grammItemService } from "../database/pr0grammItemService";
import { SystemService } from "./systemService";
export class Pr0grammService {
  private isStarted: boolean;
  private isColdStart: boolean;
  private timer: NodeJS.Timer | null;
  private eventEmitter = new EventEmitter();

  private pr0grammItemService: Pr0grammItemService;

  private static instance: Pr0grammService;

  public static getInstance(): Pr0grammService {
    if (Pr0grammService.instance === undefined) {
      Pr0grammService.instance = new Pr0grammService();
    }
    return Pr0grammService.instance;
  }

  public async start(): Promise<EventEmitter> {
    if (!this.isStarted) {
      await this.processItems();
      this.timer = setInterval(
        this.processItems,
        5 * TimeUnitsInSeconds.MINUTE * 1000
      );
      this.isStarted = true;
      Logger.i.info("Started Pr0gramm loop.");
    } else {
      Logger.i.info("Pr0gramm loop is already started.");
    }
    return this.eventEmitter;
  }

  public stop() {
    if (this.isStarted && this.timer !== null) {
      clearInterval(this.timer);
      this.isStarted = false;
      Logger.i.info("Stopped Pr0gramm loop.");
    }
  }

  private constructor() {
    this.isStarted = false;
    this.isColdStart = true;
    this.timer = null;

    this.pr0grammItemService = new Pr0grammItemService();
  }

  private async fetchItems(): Promise<Pr0grammItemResponse> {
    const cookie = SystemService.getInstance().PR0GRAMM_COOKIES;
    const itemsEndpoint = SystemService.getInstance().PR0GRAMM_ITEMS_ENDPOINT;
    const itemsFlags = SystemService.getInstance().PR0GRAMM_ITEMS_FLAGS;

    const response = await fetch(
      `${itemsEndpoint}?flags=${itemsFlags}&promoted=0`,
      {
        credentials: "include",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "en-US,en;q=0.5",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-GPC": "1",
          "Alt-Used": "pr0gramm.com",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          Cookie: cookie,
        },
        referrer: "https://pr0gramm.com/",
        method: "GET",
        mode: "cors",
      }
    );

    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(
        `Got invalid status code ${response.status} while trying to get new pr0gramm items: ${text}`
      );
    }

    return (await response.json()) as Pr0grammItemResponse;
  }

  private processItems = async () => {
    Logger.i.info("Fetching pr0gramm updates...");
    try {
      const fetchedItems = await this.fetchItems();

      Logger.i.info(`Processing ${fetchedItems.items.length} items...`);

      for (const item of fetchedItems.items) {
        if (!this.validateItem(item)) {
          continue;
        }

        const {
          audio,
          created,
          down,
          flags,
          fullsize,
          gift,
          height,
          id,
          image,
          mark,
          promoted,
          source,
          thumb,
          up,
          user,
          userId,
          width,
          preview,
        } = item;
        await this.pr0grammItemService.upsert({
          create: {
            audio,
            created,
            down,
            flags,
            fullsize,
            gift,
            height,
            id,
            image,
            mark,
            promoted,
            source,
            thumb,
            up,
            user,
            userId,
            width,
            preview: preview === null ? "" : preview,
            cold: this.isColdStart,
          },
          update: {
            down,
            flags,
            fullsize,
            gift,
            image,
            mark,
            promoted,
            up,
          },
          where: {
            id: item.id,
          },
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        Logger.i.error(`Could not fetch pr0gramm update: ${err.message}`);
      }
    }
    Logger.i.info("Finished fetching updates.");
    if (this.isColdStart) {
      Logger.i.info(
        "Setting isColdStart to false, next updates will be broadcasted."
      );
      this.isColdStart = false;
    } else {
      this.eventEmitter.emit("pr0grammItemsUpdated");
    }
  };

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
};

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
  preview: string;
};
