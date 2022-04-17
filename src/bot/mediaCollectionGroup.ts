import { Bot } from 'grammy';
import { InputMediaAudio, InputMediaDocument, InputMediaPhoto, InputMediaVideo } from 'grammy/out/platform.node';
import { Logger } from '../logger/logger';
import { Pr0grammItem } from '../services/logic/pr0grammService';
import { SystemService } from '../services/logic/systemService';
import { MediaCollection, SendMediaCollectionResult } from './mediaCollection';

export class MediaCollectionGroup {

    private readonly audios: MediaCollection<InputMediaAudio & Pr0grammItemId>;
    private readonly documents: MediaCollection<InputMediaDocument & Pr0grammItemId>;
    private readonly photosAndVideos: MediaCollection<InputMediaPhoto & Pr0grammItemId | InputMediaVideo & Pr0grammItemId>;

    private constructor() {
        this.audios = new MediaCollection();
        this.documents = new MediaCollection();
        this.photosAndVideos = new MediaCollection();
    }

    private addAudio(audio: InputMediaAudio & Pr0grammItemId) {
        this.audios.addItem(audio);
    }

    private addDocument(document: InputMediaDocument & Pr0grammItemId) {
        this.documents.addItem(document);
    }

    private addPhotoOrVideo(photoOrVideo: (InputMediaPhoto | InputMediaVideo) & Pr0grammItemId) {
        this.photosAndVideos.addItem(photoOrVideo);
    }

    async send(bot: Bot, chatId: number): Promise<SendMediaCollectionGroupResult> {
        return {
            audios: await this.audios.send(bot, chatId),
            documents: await this.documents.send(bot, chatId),
            photosAndVideos: await this.photosAndVideos.send(bot, chatId)
        }
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