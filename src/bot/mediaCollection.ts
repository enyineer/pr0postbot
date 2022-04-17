import { Bot } from 'grammy';
import { InputMediaAudio, InputMediaDocument, InputMediaPhoto, InputMediaVideo } from 'grammy/out/platform.node';
import { Logger } from '../logger/logger';
import { Pr0grammItemId } from './mediaCollectionGroup';

export class MediaCollection<T extends MediaType & Pr0grammItemId> {

    private readonly _collection: T[];

    constructor() {
        this._collection = [];
    }

    addItem(item: T) {
        this._collection.push(item);
    }

    get collection() {
        return this._collection;
    }

    private asChunks(chunkSize: number) {
        const chunks: T[][] = [];

        for (let i = 0; i < this._collection.length; i += chunkSize) {
            chunks.push(this._collection.slice(i, i + chunkSize));
        }

        return chunks;
    }

    async sendAll(bot: Bot, chatId: number): Promise<SendMediaCollectionResult<T>> {
        const successfullySentItems: T[] = [];
        const failedSentItems: T[] = [];
        // Chunks cannot be bigger than 10 items
        for (const chunk of this.asChunks(4)) {
            // If chunks only include one item, we cannot send them as mediaGroup
            if (chunk.length === 1) {
                const item = chunk[0];
                if (await this.sendSingle(bot, chatId, item)) {
                    successfullySentItems.push(item);
                } else {
                    failedSentItems.push(item);
                }
            } else {
                try {
                    await bot.api.sendMediaGroup(chatId, chunk);
                    successfullySentItems.push(...chunk);
                } catch (err) {
                    Logger.i.error(`Could not send media group, trying to send as single items`, chunk, err);
                    for (const item of chunk) {
                        if (await this.sendSingle(bot, chatId, item)) {
                            successfullySentItems.push(item);
                        } else {
                            failedSentItems.push(item);
                        }
                    }
                }
            }
        }
        return {
            failedSentItems,
            successfullySentItems
        }
    }

    private async sendSingle(bot: Bot, chatId: number, item: MediaType & Pr0grammItemId): Promise<boolean> {
        switch (item.type) {
            case 'audio':
                try {
                    await bot.api.sendAudio(chatId, item.media, {
                        caption: item.caption,
                        parse_mode: 'HTML'
                    });
                    return true;
                } catch (err) {
                    Logger.i.error(`Could not send item`, item, err);
                    return false;
                }
            case 'document':
                try {
                    await bot.api.sendDocument(chatId, item.media, {
                        caption: item.caption,
                        parse_mode: 'HTML'
                    });
                    return true;
                } catch (err) {
                    Logger.i.error(`Could not send item`, item, err);
                    return false;
                }
            case 'photo':
                try {
                    await bot.api.sendPhoto(chatId, item.media, {
                        caption: item.caption,
                        parse_mode: 'HTML'
                    });
                    return true;
                } catch (err) {
                    Logger.i.error(`Could not send item`, item, err);
                    return false;
                }
            case 'video':
                try {
                    await bot.api.sendVideo(chatId, item.media, {
                        caption: item.caption,
                        parse_mode: 'HTML'
                    });
                    return true;
                } catch (err) {
                    Logger.i.error(`Could not send item`, item, err);
                    return false;
                }
        }
    }
}

export type MediaType = InputMediaAudio | InputMediaDocument | InputMediaPhoto | InputMediaVideo;

export type SendMediaCollectionResult<T extends MediaType> = {
    successfullySentItems: T[];
    failedSentItems: T[];
}