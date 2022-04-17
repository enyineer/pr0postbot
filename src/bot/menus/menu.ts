import { Menu, MenuFlavor } from '@grammyjs/menu';
import { Context, Filter } from 'grammy';
import { TelegramChatService } from '../../services/database/telegramChatService';
import { Settings } from '../settings/settings';
import { Utils } from '../utils';

export abstract class CustomMenu {
    private readonly _menuIdentifier: string;
    private readonly _menuText: string;
    protected readonly settings: Settings;

    private readonly telegramChatService: TelegramChatService;

    protected constructor(menuIdentifier: string, menuText: string) {
        this._menuIdentifier = menuIdentifier;
        this._menuText = menuText;
        this.settings = new Settings();
        this.telegramChatService = new TelegramChatService();
    }

    abstract getMenu(): Menu;

    getMenuIdentifier(): string {
        return this._menuIdentifier;
    }

    getMenuText(): string {
        return this._menuText;
    }

    protected canClickMenu = async(ctx: Filter<Context, "callback_query"> & MenuFlavor): Promise<boolean> => {
        if (await this.isMenuOutdated(ctx)) {
            await ctx.answerCallbackQuery({
                text: "Dieses Menü ist veraltet.",
            });
            return false;
        }
        if (!(await Utils.isAdmin(ctx))) {
            await ctx.answerCallbackQuery({
                text: "Du bist kein Admin dieser Gruppe.",
            });
            return false;
        }
        return true;
    }

    private async isMenuOutdated(
        ctx: Filter<Context, "callback_query">
    ): Promise<boolean> {
        if (ctx.chat === undefined) {
            return true;
        }

        if (ctx.callbackQuery.message === undefined) {
            return true;
        }

        const chat = await this.telegramChatService.findUnique({ id: ctx.chat.id });

        if (chat === null) {
            return true;
        }

        const originatingMessageId = ctx.callbackQuery.message.message_id;

        if (
            originatingMessageId === undefined ||
            originatingMessageId !== parseInt(chat.latestSettingsMenuId.toString())
        ) {
            return true;
        }

        return false;
    }
}