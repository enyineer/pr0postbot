import { Menu } from '@grammyjs/menu';
import { CustomMenu } from './menu';
import { SettingsMenu } from './settingsMenu';

export class SendIntervalMenu extends CustomMenu {
    private static instance: SendIntervalMenu;

    static getInstance(): SendIntervalMenu {
        if (SendIntervalMenu.instance === undefined) {
            SendIntervalMenu.instance = new SendIntervalMenu();
        }
        return SendIntervalMenu.instance;
    }

    private constructor() {
        super("send-interval-menu", "Setze den Intervall, in welchem du Nachrichten erhalten willst.");
    }

    getMenu = (): Menu => {
        return new Menu(this.getMenuIdentifier(), { autoAnswer: false })
        .text(
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "No Chat";
                }

                const currentSettings = await this.settings.getSettings(ctx.chat.id);
                const previousValue = this.settings.sendIntervalSettings.previousValue(currentSettings.sendInterval);

                if (previousValue === null) {
                    return "❌";
                }

                return previousValue.toString();
            },
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return ctx.answerCallbackQuery("No chat");
                }

                if (await this.canClickMenu(ctx)) {
                    const currentSettings = await this.settings.getSettings(ctx.chat.id);
                    const previousValue = this.settings.sendIntervalSettings.previousValue(currentSettings.sendInterval);

                    if (previousValue === null) {
                        return ctx.answerCallbackQuery("Dies ist bereits der Minimalwert.");
                    }

                    await this.settings.setSendInterval(ctx.chat.id, previousValue);

                    await ctx.menu.update();
                }
            }
        )
        .text(
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "No chat";
                }

                const currentSettings = await this.settings.getSettings(ctx.chat.id);

                return `⏲️ ${currentSettings.sendInterval.toString()}`
            },
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "No chat";
                }

                const currentSettings = await this.settings.getSettings(ctx.chat.id);

                await ctx.answerCallbackQuery(`Du erhältst alle ${currentSettings.sendInterval.toString()} neue Updates.`);
            }
        )
        .text(
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "No Chat";
                }

                const currentSettings = await this.settings.getSettings(ctx.chat.id);
                const nextValue = this.settings.sendIntervalSettings.nextValue(currentSettings.sendInterval);

                if (nextValue === null) {
                    return "❌";
                }

                return nextValue.toString();
            },
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return ctx.answerCallbackQuery("No chat");
                }

                if (await this.canClickMenu(ctx)) {
                    const currentSettings = await this.settings.getSettings(ctx.chat.id);
                    const nextValue = this.settings.sendIntervalSettings.nextValue(currentSettings.sendInterval);

                    if (nextValue === null) {
                        return ctx.answerCallbackQuery("Dies ist bereits der Maximalwert.");
                    }

                    await this.settings.setSendInterval(ctx.chat.id, nextValue);

                    await ctx.menu.update();
                }
            }
        ).row()
        .text(
            "Zurück",
            async (ctx) => {
                if (await this.canClickMenu(ctx)) {
                    await ctx.menu.back({ immediate: false });
                    await ctx.editMessageText(SettingsMenu.getInstance().getMenuText())
                }
            }
        );
    }

}