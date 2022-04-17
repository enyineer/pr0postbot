import { Bot } from 'grammy';
import { InputMediaAudio, InputMediaDocument, InputMediaPhoto, InputMediaVideo } from 'grammy/out/platform.node';
import { Logger } from '../logger/logger';
import { Pr0grammItemId } from './mediaCollectionGroup';

export class MediaCollection<T extends MediaType & Pr0grammItemId> {

    private readonly collection: T[];

    constructor() {
        this.collection = [];
    }

    addItem(item: T) {
        this.collection.push(item);
    }

    private asChunks(chunkSize: number) {
        const chunks: T[][] = [];

        for (let i = 0; i < this.collection.length; i += chunkSize) {
            chunks.push(this.collection.slice(i, i + chunkSize));
        }

        return chunks;
    }

    async send(bot: Bot, chatId: number): Promise<SendMediaCollectionResult<T>> {
        const successfullySentItems: T[] = [];
        const failedSentItems: T[] = [];
        // Chunks cannot be bigger than 10 items
        for (const chunk of this.asChunks(4)) {
            // If chunks only include one item, we cannot send them as mediaGroup
            if (chunk.length === 1) {
                const item = chunk[0];
                switch (item.type) {
                    case 'audio':
                        try {
                            await bot.api.sendAudio(chatId, item.media, {
                                caption: item.caption,
                                parse_mode: 'HTML'
                            });
                            successfullySentItems.push(item);
                        } catch (err) {
                            failedSentItems.push(item);
                            Logger.i.error(`Could not send item`, item, err);
                        }
                        break;
                    case 'document':
                        try {
                            await bot.api.sendDocument(chatId, item.media, {
                                caption: item.caption,
                                parse_mode: 'HTML'
                            });
                        } catch (err) {
                            failedSentItems.push(item);
                            Logger.i.error(`Could not send item`, item, err);
                        }
                        break;
                    case 'photo':
                        try {
                            await bot.api.sendPhoto(chatId, item.media, {
                                caption: item.caption,
                                parse_mode: 'HTML'
                            });
                        } catch (err) {
                            failedSentItems.push(item);
                            Logger.i.error(`Could not send item`, item, err);
                        }
                        break;
                    case 'video':
                        try {
                            await bot.api.sendVideo(chatId, item.media, {
                                caption: item.caption,
                                parse_mode: 'HTML'
                            });
                        } catch (err) {
                            failedSentItems.push(item);
                            Logger.i.error(`Could not send item`, item, err);
                        }
                        break;
                }
            } else {
                try {
                    await bot.api.sendMediaGroup(chatId, chunk);
                } catch (err) {
                    failedSentItems.push(...chunk);
                    Logger.i.error(`Could not send media group`, chunk, err);
                }
            }
            await this.sleep(1000);
        }
        return {
            failedSentItems,
            successfullySentItems
        }
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export type MediaType = InputMediaAudio | InputMediaDocument | InputMediaPhoto | InputMediaVideo;

export type SendMediaCollectionResult<T extends MediaType> = {
    successfullySentItems: T[];
    failedSentItems: T[];
}