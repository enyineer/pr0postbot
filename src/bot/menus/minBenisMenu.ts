import { Menu } from '@grammyjs/menu';
import { CustomMenu } from './menu';
import { SettingsMenu } from './settingsMenu';

export class MinBenisMenu extends CustomMenu {
    private static instance: MinBenisMenu;

    static getInstance(): MinBenisMenu {
        if (MinBenisMenu.instance === undefined) {
            MinBenisMenu.instance = new MinBenisMenu();
        }
        return MinBenisMenu.instance;
    }

    private constructor() {
        super("min-benis-menu", "Setze den Mindestbenis den ein Post haben muss bevor er angezeigt wird.");
    }

    getMenu = (): Menu => {
        return new Menu(this.getMenuIdentifier(), { autoAnswer: false })
        .text(
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "No Chat";
                }

                const currentSettings = await this.settings.getSettings(ctx.chat.id);
                const previousValue = this.settings.minBenisSettings.previousValue(currentSettings.minBenis);

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
                    const previousValue = this.settings.minBenisSettings.previousValue(currentSettings.minBenis);

                    if (previousValue === null) {
                        return ctx.answerCallbackQuery("Dies ist bereits der Minimalwert.");
                    }

                    await this.settings.setMinBenis(ctx.chat.id, previousValue);

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

                return `➕ > ${currentSettings.maxAmount.toString()}`
            },
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "No chat";
                }

                const currentSettings = await this.settings.getSettings(ctx.chat.id);

                await ctx.answerCallbackQuery(`Du siehst nur Posts, welche mehr als ${currentSettings.minBenis} Benis haben.`);
            }
        )
        .text(
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "No Chat";
                }

                const currentSettings = await this.settings.getSettings(ctx.chat.id);
                const nextValue = this.settings.minBenisSettings.nextValue(currentSettings.minBenis);

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
                    const nextValue = this.settings.minBenisSettings.nextValue(currentSettings.minBenis);

                    if (nextValue === null) {
                        return ctx.answerCallbackQuery("Dies ist bereits der Maximalwert.");
                    }

                    await this.settings.setMinBenis(ctx.chat.id, nextValue);

                    await ctx.menu.update();
                }
            }
        ).row()
        .text(
            "Zurück",
            async (ctx) => {
                if (await this.canClickMenu(ctx)) {
                    await ctx.editMessageText(SettingsMenu.getInstance().getMenuText());
                    await ctx.menu.back();
                }
            }
        );
    }

}