import EventEmitter from "events";
import { TimeUnitsInSeconds } from "../../bot/settings/timeContainer";
import { logger } from "../../logger/logger";
import { Pr0grammItemService } from "../database/pr0grammItemService";
import { SystemService } from "./systemService";
import { z } from "zod";
export class Pr0grammService {
  private isStarted: boolean;
  private isColdStart: boolean;
  private timer: ReturnType<typeof setInterval> | null;
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
      logger.info("Started Pr0gramm loop.");
    } else {
      logger.info("Pr0gramm loop is already started.");
    }
    return this.eventEmitter;
  }

  public stop() {
    if (this.isStarted && this.timer !== null) {
      clearInterval(this.timer);
      this.isStarted = false;
      logger.info("Stopped Pr0gramm loop.");
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

    const data = await response.json();

    const parsedData = await pr0grammItemResponseSchema.parseAsync(data);

    return parsedData;
  }

  private processItems = async () => {
    logger.info("Fetching pr0gramm updates...");
    try {
      const fetchedItems = await this.fetchItems();

      logger.info(`Processing ${fetchedItems.items.length} items...`);

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
        logger.error(`Could not fetch pr0gramm update: ${err.message}`);
      }
    }
    logger.info("Finished fetching updates.");
    if (this.isColdStart) {
      logger.info(
        "Setting isColdStart to false, next updates will be broadcasted."
      );
      this.isColdStart = false;
    } else {
      this.eventEmitter.emit("pr0grammItemsUpdated");
    }
  };

  private validateItem(item: Pr0grammItem) {
    if (item.id === undefined || item.id < 1) {
      logger.error(`Item has empty id`, item);
      return false;
    }

    if (item.user === undefined || item.user === "") {
      logger.error(`Item has empty user`, item);
      return false;
    }

    if (item.image === undefined || item.image === "") {
      logger.error(`Item has empty image`, item);
      return false;
    }

    if (item.height === undefined || item.height < 1) {
      logger.error(`Item has invalid height`, item);
      return false;
    }

    if (item.width === undefined || item.width < 1) {
      logger.error(`Item has invalid width`, item);
      return false;
    }

    return true;
  }
}

const pr0grammItemSchema = z.object({
  id: z.number(),
  promoted: z.number(),
  userId: z.number(),
  up: z.number(),
  down: z.number(),
  created: z.number(),
  image: z.string(),
  thumb: z.string(),
  fullsize: z.string(),
  width: z.number(),
  height: z.number(),
  audio: z.boolean(),
  source: z.string(),
  flags: z.number(),
  user: z.string(),
  mark: z.number(),
  gift: z.number().optional(),
  preview: z.string().nullable(),
});

const pr0grammItemResponseSchema = z.object({
  atEnd: z.boolean(),
  atStart: z.boolean(),
  error: z.string().nullable(),
  items: z.array(pr0grammItemSchema),
  ts: z.number(),
  cache: z.string().nullable(),
  rt: z.number(),
  qc: z.number(),
});

export type Pr0grammItemResponse = z.infer<typeof pr0grammItemResponseSchema>;

export type Pr0grammItem = z.infer<typeof pr0grammItemSchema>;
