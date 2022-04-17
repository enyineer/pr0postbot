import { Bot } from 'grammy';
import { InputMediaAudio, InputMediaDocument, InputMediaPhoto, InputMediaVideo } from 'grammy/out/platform.node';
import { Logger } from '../logger/logger';
import { Pr0grammItem } from '../services/logic/pr0grammService';
import { SystemService } from '../services/logic/systemService';
import { MediaCollection, SendMediaCollectionResult } from './mediaCollection';

export class MediaCollectionGroup {

    private readonly _audios: MediaCollection<InputMediaAudio & Pr0grammItemId>;
    private readonly _documents: MediaCollection<InputMediaDocument & Pr0grammItemId>;
    private readonly _photosAndVideos: MediaCollection<InputMediaPhoto & Pr0grammItemId | InputMediaVideo & Pr0grammItemId>;

    private constructor() {
        this._audios = new MediaCollection();
        this._documents = new MediaCollection();
        this._photosAndVideos = new MediaCollection();
    }

    private addAudio(audio: InputMediaAudio & Pr0grammItemId) {
        this._audios.addItem(audio);
    }

    private addDocument(document: InputMediaDocument & Pr0grammItemId) {
        this._documents.addItem(document);
    }

    private addPhotoOrVideo(photoOrVideo: InputMediaPhoto & Pr0grammItemId | InputMediaVideo & Pr0grammItemId) {
        this._photosAndVideos.addItem(photoOrVideo);
    }

    async send(bot: Bot, chatId: number): Promise<SendMediaCollectionGroupResult> {
        return {
            audios: await this._audios.sendAll(bot, chatId),
            documents: await this._documents.sendAll(bot, chatId),
            photosAndVideos: await this._photosAndVideos.sendAll(bot, chatId)
        }
    }

    get audios() {
        return this._audios;
    }

    get documents() {
        return this._documents;
    }

    get photosAndVideos() {
        return this._photosAndVideos;
    }

    public static fromItems(items: Pr0grammItem[]): MediaCollectionGroup {
        const newMediaCollectionGroup = new MediaCollectionGroup();

        for (const item of items) {
            const postMarkdown = `<a href="${SystemService.getInstance().PR0GRAMM_SITE}/top/${item.id}">Post</a>`;
            const userMarkdown = `<a href="${SystemService.getInstance().PR0GRAMM_SITE}/user/${item.user}">${item.user}</a>`;
            const caption = `${postMarkdown} von ${userMarkdown}`;
    
            if (item.image.endsWith(".mp4")) {
                const imageUrl = `${SystemService.getInstance().PR0GRAMM_VID_CDN}/${item.image}`;
                newMediaCollectionGroup.addPhotoOrVideo({
                    type: "video",
                    media: imageUrl,
                    caption,
                    parse_mode: "HTML",
                    pr0grammId: item.id
                });
            } else if (item.image.endsWith(".jpg") || item.image.endsWith(".png")) {
                const imageUrl = `${SystemService.getInstance().PR0GRAMM_IMAGE_CDN}/${item.image}`;
                if (this.shouldSendAsDocument(item.width, item.height)) {
                    newMediaCollectionGroup.addDocument({
                        type: "document",
                        media: imageUrl,
                        caption,
                        parse_mode: "HTML",
                        pr0grammId: item.id
                    });
                } else {
                    newMediaCollectionGroup.addPhotoOrVideo({
                        type: "photo",
                        media: imageUrl,
                        caption,
                        parse_mode: "HTML",
                        pr0grammId: item.id
                    });
                }
            } else {
                Logger.i.error(`Unknown file type for image`, item);
            }
        }

        return newMediaCollectionGroup;
    }

    // Telegram compression is fine until images have one side that's a lot larger than the other
    // If images are "too high", you should send them as documents so that text is still readable
    private static shouldSendAsDocument(width: number, height: number) {
        const highestSize = Math.max(width, height);
        const lowestSize = Math.min(width, height);
        return Math.abs(highestSize / lowestSize) > 2.5;
    }
}

export type SendMediaCollectionGroupResult = {
    audios: SendMediaCollectionResult<InputMediaAudio & Pr0grammItemId>;
    documents: SendMediaCollectionResult<InputMediaDocument & Pr0grammItemId>;
    photosAndVideos: SendMediaCollectionResult<InputMediaPhoto & Pr0grammItemId | InputMediaVideo & Pr0grammItemId>;
}

export type Pr0grammItemId = {
    pr0grammId: number
}