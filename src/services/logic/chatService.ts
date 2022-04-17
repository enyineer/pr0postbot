import { Logger } from '../../logger/logger';
import { Pr0grammItemService } from '../database/pr0grammItemService';
import { TelegramChatService } from '../database/telegramChatService';
import { DateTime } from "luxon";
import { Pr0grammItemCollection } from '../../bot/pr0grammItemCollection';
import { ShownItemsOnChatsService } from '../database/shownItemsOnChatsService';
import { Bot } from 'grammy';
import { SystemService } from './systemService';
import { Pr0grammItemId, SendMediaCollectionGroupResult } from '../../bot/mediaCollectionGroup';
import { MediaType, SendMediaCollectionResult } from '../../bot/mediaCollection';
import { EventEmitter } from 'stream';

export class ChatService {
    private bot: Bot;

    private pr0grammItemService: Pr0grammItemService;
    private telegramChatService: TelegramChatService;
    private shownItemsOnChatsService: ShownItemsOnChatsService;

    private static instance: ChatService;

    public static getInstance(bot: Bot): ChatService {
        if (ChatService.instance === undefined) {
            ChatService.instance = new ChatService(bot);
        }
        return ChatService.instance;
    }

    private constructor(bot: Bot) {
        this.bot = bot;

        this.pr0grammItemService = new Pr0grammItemService();
        this.telegramChatService = new TelegramChatService();
        this.shownItemsOnChatsService = new ShownItemsOnChatsService();
    }

    start(updateEvents: EventEmitter) {
        updateEvents.on("pr0grammItemsUpdated", async () => {
            await this.processChats();
        });
    }

    private processChats = async () => {
        Logger.i.info("Processing chats...");

        const itemsLast24HoursAfterStart = await this.pr0grammItemService.findMany({
            where: {
                // Fetch all items that we indexed over the last 24 hours
                createdAt: {
                    gte: DateTime.now().minus({ day: 1 }).toJSDate(),
                },
                // Also only retrieve items that were discovered after the last startup to prevent spam
                // if the bot has been down for a longer period of time
                AND: {
                    createdAt: {
                        gte: SystemService.getInstance().lastStartup.toJSDate()
                    }
                }
            }
        });

        const itemsCollection = new Pr0grammItemCollection(itemsLast24HoursAfterStart);

        // Find all active chats
        const chats = await this.telegramChatService.findMany({
            where: {
                active: true
            }
        });

        Logger.i.info(`Processing ${chats.length} active chats.`);

        for (const chat of chats) {
            Logger.i.info(`Processing updates for chat ${chat.id}...`);
            const lastUpdate = DateTime.fromJSDate(chat.lastUpdate);
            const nextUpdate = lastUpdate.plus({ seconds: chat.sendInterval });

            // Skip this chat if the diff between the next update and now is greater than zero
            if (nextUpdate.diff(DateTime.now(), "seconds").seconds > 0) {
                Logger.i.info(`Chat ${chat.id} not due yet. Next update at ${nextUpdate.setLocale("de-DE").toLocaleString({
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`);
                continue;
            }

            const shownMessages = await this.shownItemsOnChatsService.findMany({
                telegramChatId: chat.id,
                createdAt: {
                    gte: DateTime.now().minus({ days: 2 }).toJSDate()
                }
            });
            const shownItemIds = shownMessages.map(el => el.pr0grammItemId);

            const filteredItemsCollection = itemsCollection
                // Filter out all items that don't match the chats minBenis
                .filterByBenis(chat.minBenis)
                // Filter out all items that have already been shown
                .removeIds(shownItemIds)
                // Filter out all items that are older than the chat
                .filterNewerThan(DateTime.fromJSDate(chat.createdAt))
                // Filter out all items that don't match the chats flags
                .filterByFlags({
                    sfw: chat.sfw,
                    nsfw: chat.nsfw,
                    nsfl: chat.nsfl
                })
                // Sort by highest benis, promoted-id and date and filter out excess items
                .filterHighestBenis(chat.maxAmount);

            const filteredMediaCollectionGroup = filteredItemsCollection.toMediaCollectionGroup();

            const sendMediaResult = await filteredMediaCollectionGroup.send(this.bot, parseInt(chat.id.toString()));

            await this.saveShownMessages(parseInt(chat.id.toString()), sendMediaResult);

            await this.telegramChatService.updateLastUpdate(parseInt(chat.id.toString()));

            Logger.i.info(`Finished processing updates for chat ${chat.id}.`);
        }

        Logger.i.info("Finished processing chats.");
    }

    private async saveShownMessages(chatId: number, mediaCollectionGroupResult: SendMediaCollectionGroupResult) {
        await this.saveSpecificShownMedia(chatId, mediaCollectionGroupResult.audios);
        await this.saveSpecificShownMedia(chatId, mediaCollectionGroupResult.documents);
        await this.saveSpecificShownMedia(chatId, mediaCollectionGroupResult.photosAndVideos);
    }

    private async saveSpecificShownMedia<T extends MediaType & Pr0grammItemId>(chatId: number, media: SendMediaCollectionResult<T>) {
        for (const successfullySentItem of media.successfullySentItems) {
            await this.shownItemsOnChatsService.create({
                pr0grammItem: {
                    connect: {
                        id: successfullySentItem.pr0grammId
                    }
                },
                telegramChat: {
                    connect: {
                        id: chatId
                    }
                },
                sendSuccess: true
            });
        }

        for (const failedSentItem of media.failedSentItems) {
            await this.shownItemsOnChatsService.create({
                pr0grammItem: {
                    connect: {
                        id: failedSentItem.pr0grammId
                    }
                },
                telegramChat: {
                    connect: {
                        id: chatId
                    }
                },
                sendSuccess: false
            });
        }
    }
}