import { Bot, GrammyError } from 'grammy';
import { InputMediaAudio, InputMediaDocument, InputMediaPhoto, InputMediaVideo } from 'grammy/out/platform.node';

export class MediaCollection<T extends MediaType> {

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

    async send(bot: Bot, chatId: number) {
        // Chunks cannot be bigger than 10 items
        for (const chunk of this.asChunks(10)) {
            try {
                // If chunks only include one item, we cannot send them as mediaGroup
                if (chunk.length === 1) {
                    const item = chunk[0];
                    switch (item.type) {
                        case 'audio':
                            await bot.api.sendAudio(chatId, item.media, {
                                caption: item.caption,
                                parse_mode: 'HTML'
                            });
                            break;
                        case 'document':
                            await bot.api.sendDocument(chatId, item.media, {
                                caption: item.caption,
                                parse_mode: 'HTML'
                            });
                            break;
                        case 'photo':
                            await bot.api.sendPhoto(chatId, item.media, {
                                caption: item.caption,
                                parse_mode: 'HTML'
                            });
                            break;
                        case 'video':
                            await bot.api.sendVideo(chatId, item.media, {
                                caption: item.caption,
                                parse_mode: 'HTML'
                            });
                            break;
                    }
                } else {
                    await bot.api.sendMediaGroup(chatId, chunk);
                }
            } catch (err) {
                if (err instanceof GrammyError) {
                    console.error(`Could not send chunk<${chunk[0].type}> to chat ${chatId} (${err.message}): ${JSON.stringify(chunk, null, 2)}`)
                }
            } finally {
                await this.sleep(1000);
            }
        }
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export type MediaType = InputMediaAudio | InputMediaDocument | InputMediaPhoto | InputMediaVideo;