import { Bot } from 'grammy';
import { InputMediaAudio, InputMediaDocument, InputMediaPhoto, InputMediaVideo } from 'grammy/out/platform.node';
import { Logger } from '../logger/logger';
import { Pr0grammItem } from '../services/pr0grammService';
import { MediaCollection } from './mediaCollection';

export class MediaCollectionGroup {

    private readonly audios: MediaCollection<InputMediaAudio>;
    private readonly documents: MediaCollection<InputMediaDocument>;
    private readonly photosAndVideos: MediaCollection<InputMediaPhoto | InputMediaVideo>;

    private constructor() {
        this.audios = new MediaCollection();
        this.documents = new MediaCollection();
        this.photosAndVideos = new MediaCollection();
    }

    private addAudio(audio: InputMediaAudio) {
        this.audios.addItem(audio);
    }

    private addDocument(document: InputMediaDocument) {
        this.documents.addItem(document);
    }

    private addPhotoOrVideo(photoOrVideo: InputMediaPhoto | InputMediaVideo) {
        this.photosAndVideos.addItem(photoOrVideo);
    }

    async send(bot: Bot, chatId: number) {
        await this.audios.send(bot, chatId);
        await this.documents.send(bot, chatId);
        await this.photosAndVideos.send(bot, chatId);
    }

    public static fromItems(items: Pr0grammItem[]): MediaCollectionGroup {
        if (process.env.PR0GRAMM_IMAGE_CDN === undefined) {
            throw new Error("PR0GRAMM_IMAGE_CDN is not defined in .env");
        }
        const pr0grammImageCdn = process.env.PR0GRAMM_IMAGE_CDN;

        if (process.env.PR0GRAMM_VID_CDN === undefined) {
            throw new Error("PR0GRAMM_VID_CDN is not defined in .env");
        }
        const pr0grammVidCdn = process.env.PR0GRAMM_VID_CDN;

        if (process.env.PR0GRAMM_SITE === undefined) {
            throw new Error("PR0GRAMM_SITE is not defined in .env");
        }
        const pr0grammSite = process.env.PR0GRAMM_SITE;

        const newMediaCollectionGroup = new MediaCollectionGroup();

        for (const item of items) {
            const postMarkdown = `<a href="${pr0grammSite}/top/${item.id}">Post</a>`;
            const userMarkdown = `<a href="${pr0grammSite}/user/${item.user}">${item.user}</a>`;
            const caption = `${postMarkdown} von ${userMarkdown}`;
    
            if (item.image.endsWith(".mp4")) {
                const imageUrl = `${pr0grammVidCdn}/${item.image}`;
                newMediaCollectionGroup.addPhotoOrVideo({
                    type: "video",
                    media: imageUrl,
                    caption,
                    parse_mode: "HTML",
                });
            } else if (item.image.endsWith(".jpg") || item.image.endsWith(".png")) {
                const imageUrl = `${pr0grammImageCdn}/${item.image}`;
                if (this.shouldSendAsDocument(item.width, item.height)) {
                    newMediaCollectionGroup.addDocument({
                        type: "document",
                        media: imageUrl,
                        caption,
                        parse_mode: "HTML",
                    });
                } else {
                    newMediaCollectionGroup.addPhotoOrVideo({
                        type: "photo",
                        media: imageUrl,
                        caption,
                        parse_mode: "HTML",
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