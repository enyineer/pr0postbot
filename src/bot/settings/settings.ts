import { TelegramChatService } from '../../services/database/telegramChatService';
import { SystemService } from '../../services/logic/systemService';
import { SettingsItem } from './settingsItem';
import { TimeContainer, TimeUnitsInSeconds } from './timeContainer';

export class Settings {

    private readonly telegramChatService: TelegramChatService;
    private _maxAmountsSettings: SettingsItem<number>;
    private _minBenisSettings: SettingsItem<number>;
    private _sendIntervalSettings: SettingsItem<TimeContainer>;

    constructor() {
        this.telegramChatService = new TelegramChatService();
        this._maxAmountsSettings = new SettingsItem([1, ...Array.from({ length: SystemService.getInstance().MAX_ITEM_AMOUNT / 4 }, (_, i) => (i + 1) * 4)]);
        this._minBenisSettings = new SettingsItem([0, 100, 200, 500, 1000, 2500, 5000]);
        // In minutes
        this._sendIntervalSettings = new SettingsItem([
            5 * TimeUnitsInSeconds.MINUTE,
            15 * TimeUnitsInSeconds.MINUTE,
            30 * TimeUnitsInSeconds.MINUTE,
            1 * TimeUnitsInSeconds.HOUR,
            3 * TimeUnitsInSeconds.HOUR,
            6 * TimeUnitsInSeconds.HOUR,
            12 * TimeUnitsInSeconds.HOUR,
            1 * TimeUnitsInSeconds.DAY,
            7 * TimeUnitsInSeconds.DAY
        ].map(el => TimeContainer.fromSeconds(el)));
    }

    async setMaxAmount(chatId: number, maxAmount: number): Promise<number> {
        const chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            throw new Error(`Trying to set maxAmount for non existent chat ${chatId}`);
        }

        if (!this._maxAmountsSettings.isValidValue(maxAmount)) {
            throw new Error(`${maxAmount} is an invalid amount.`);
        }
        
        await this.telegramChatService.update({
            data: {
                maxAmount
            },
            where: {
                id: chat.id
            }
        });

        return maxAmount;
    }

    async setMinBenis(chatId: number, minBenis: number): Promise<number> {
        const chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            throw new Error(`Trying to set minBenis for non existent chat ${chatId}`);
        }

        if (!this._minBenisSettings.isValidValue(minBenis)) {
            throw new Error(`${minBenis} is an invalid amount.`);
        }

        await this.telegramChatService.update({
            data: {
                minBenis
            },
            where: {
                id: chat.id
            }
        });

        return minBenis;
    }

    async setSendInterval(chatId: number, sendInterval: TimeContainer): Promise<TimeContainer> {
        const chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            throw new Error(`Trying to update sendInterval for non existent chat ${chatId}`);
        }

        if (!this._sendIntervalSettings.isValidValue(sendInterval)) {
            throw new Error(`${sendInterval} is an invalid amount.`);
        }

        await this.telegramChatService.update({
            data: {
                sendInterval: sendInterval.seconds
            },
            where: {
                id: chat.id
            }
        });

        return sendInterval;
    }

    async toggleShowText(chatId: number): Promise<boolean> {
        const chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            throw new Error(`Trying to toggle textFlag for non existent chat ${chatId}`);
        }

        await this.telegramChatService.update({
            data: {
                ...chat,
                showText: !chat.showText,
            },
            where: {
                id: chat.id,
            }
        });

        return !chat.showText;
    }

    async toggleFilterFlag(chatId: number, filter: FilterFlags): Promise<boolean> {
        const chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            throw new Error(`Trying to toggle filterFlags for non existent chat ${chatId}`);
        }

        let updatedFlag = false;

        switch(filter) {
            case FilterFlags.SFW:
                chat.sfw = !chat.sfw;
                updatedFlag = chat.sfw;
                break;
            case FilterFlags.NSFW:
                chat.nsfw = !chat.nsfw;
                updatedFlag = chat.nsfw;
                break;
            case FilterFlags.NSFL:
                chat.nsfl = !chat.nsfl;
                updatedFlag = chat.nsfl;
                break;
        }

        if (!chat.sfw && !chat.nsfw && !chat.nsfl) {
            throw new Error("Es muss mindestens ein Filter aktiv sein.");
        }

        await this.telegramChatService.update({
            data: {
                sfw: chat.sfw,
                nsfw: chat.nsfw,
                nsfl: chat.nsfl
            },
            where: {
                id: chat.id
            }
        });

        return updatedFlag;
    }

    async getSettings(chatId: number): Promise<ChatSettings> {
        const chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            throw Error(`Could not find chat ${chatId} while trying to search settings.`);
        }

        return {
            maxAmount: chat.maxAmount,
            minBenis: chat.minBenis,
            sendInterval: TimeContainer.fromSeconds(chat.sendInterval),
            showText: chat.showText,
        }
    }

    get maxAmountSettings(): SettingsItem<number> {
        return this._maxAmountsSettings;
    }

    get minBenisSettings(): SettingsItem<number> {
        return this._minBenisSettings;
    }

    get sendIntervalSettings(): SettingsItem<TimeContainer> {
        return this._sendIntervalSettings;
    }

    async isNewEnabled(chatId: number): Promise<boolean> {
        let chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            chat = await this.telegramChatService.create({ id: chatId });
        }

        return chat.showNew;
    }

    async toggleNewPosts(chatId: number): Promise<boolean> {
        const chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            throw new Error(`Trying to toggle new posts for non existent chat ${chatId}`);
        }

        await this.telegramChatService.update({
            data: {
                ...chat,
                showNew: !chat.showNew
            },
            where: {
                id: chat.id
            }
        });

        return !chat.showNew;
    }

    async isFilterFlagEnabled(chatId: number, filter: FilterFlags): Promise<boolean> {
        let chat = await this.telegramChatService.findUnique({ id: chatId });

        if (chat === null) {
            chat = await this.telegramChatService.create({ id: chatId });
        }

        switch(filter) {
            case FilterFlags.SFW:
            case FilterFlags.NSFP:
                return chat.sfw;
            case FilterFlags.NSFW:
                return chat.nsfw;
            case FilterFlags.NSFL:
                return chat.nsfl;
        }
    }

    static filterFlagMatches(flag: number, filters: FilterFlagOpts) {
        switch (flag) {
            case FilterFlags.SFW:
            case FilterFlags.NSFP:
                return filters.sfw;
            case FilterFlags.NSFW:
                return filters.nsfw;
            case FilterFlags.NSFL:
                return filters.nsfl;
        }
    }
}

export type ChatSettings = {
    maxAmount: number;
    minBenis: number;
    sendInterval: TimeContainer;
    showText: boolean;
}

export enum FilterFlags {
    SFW = 1,
    NSFW = 2,
    NSFL = 4,
    NSFP = 8
}

export type FilterFlagOpts = {
    sfw: boolean;
    nsfw: boolean;
    nsfl: boolean;
}