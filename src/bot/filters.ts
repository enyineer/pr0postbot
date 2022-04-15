import { TelegramChatService } from '../services/telegramChatService';

export class Filters {

    private readonly telegramChatService: TelegramChatService;

    constructor() {
        this.telegramChatService = new TelegramChatService();
    }

    async toggleFilter(chatId: number, filter: FilterTypes): Promise<boolean> {
        let chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            chat = await this.telegramChatService.create({ id: chatId });
        }

        let updatedFlag = false;

        switch(filter) {
            case FilterTypes.SFW:
                chat.sfw = !chat.sfw;
                updatedFlag = chat.sfw;
                break;
            case FilterTypes.NSFW:
                chat.nsfw = !chat.nsfw;
                updatedFlag = chat.nsfw;
                break;
            case FilterTypes.NSFL:
                chat.nsfl = !chat.nsfl;
                updatedFlag = chat.nsfl;
                break;
        }

        if (!chat.sfw && !chat.nsfw && !chat.nsfl) {
            throw new Error("Es muss mindestens ein Filter aktiv sein.");
        }

        await this.telegramChatService.update({
            data: chat,
            where: {
                id: chat.id
            }
        });

        return updatedFlag;
    }

    async isFilterEnabled(chatId: number, filter: FilterTypes): Promise<boolean> {
        let chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            chat = await this.telegramChatService.create({ id: chatId });
        }

        switch(filter) {
            case FilterTypes.SFW:
                return chat.sfw;
            case FilterTypes.NSFW:
                return chat.nsfw;
            case FilterTypes.NSFL:
                return chat.nsfl;
        }
    }

    static filterMatches(flag: number, filters: FilterOpts) {
        switch (flag) {
            case 1:
            case 8: // NSFP
                return filters.sfw;
            case 2:
                return filters.nsfw;
            case 4:
                return filters.nsfl;
        }
    }
}

export enum FilterTypes {
    SFW,
    NSFW,
    NSFL
}

export type FilterOpts = {
    sfw: boolean;
    nsfw: boolean;
    nsfl: boolean;
}