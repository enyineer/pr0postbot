import { Menu } from '@grammyjs/menu';
import { CustomMenu } from './menu';
import { SettingsMenu } from './settingsMenu';

export class MaxAmountMenu extends CustomMenu {
    private static instance: MaxAmountMenu;

    static getInstance(): MaxAmountMenu {
        if (MaxAmountMenu.instance === undefined) {
            MaxAmountMenu.instance = new MaxAmountMenu();
        }
        return MaxAmountMenu.instance;
    }

    private constructor() {
        super("max-amount-menu", "Setze die maximale Anzahl von Nachrichten, welche du im gesetzten Intervall erhalten willst. Beachte: wenn die Anzahl neuer Posts seit dem letzten Update diese Anzahl überschreitet werden nur die Nachrichten mit dem höchsten Benis angezeigt.");
    }

    getMenu = (): Menu => {
        return new Menu(this.getMenuIdentifier(), { autoAnswer: false })
        .text(
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "No Chat";
                }

                const currentSettings = await this.settings.getSettings(ctx.chat.id);
                const previousValue = this.settings.maxAmountSettings.previousValue(currentSettings.maxAmount);

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
                    const previousValue = this.settings.maxAmountSettings.previousValue(currentSettings.maxAmount);

                    if (previousValue === null) {
                        return ctx.answerCallbackQuery("Dies ist bereits der Minimalwert.");
                    }

                    await this.settings.setMaxAmount(ctx.chat.id, previousValue);

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

                return `✉️ x ${currentSettings.maxAmount.toString()}`
            },
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "No chat";
                }

                const currentSettings = await this.settings.getSettings(ctx.chat.id);

                await ctx.answerCallbackQuery(`Du erhältst ${currentSettings.maxAmount} Nachrichten pro Intervall.`);
            }
        )
        .text(
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "No Chat";
                }

                const currentSettings = await this.settings.getSettings(ctx.chat.id);
                const nextValue = this.settings.maxAmountSettings.nextValue(currentSettings.maxAmount);

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
                    const nextValue = this.settings.maxAmountSettings.nextValue(currentSettings.maxAmount);

                    if (nextValue === null) {
                        return ctx.answerCallbackQuery("Dies ist bereits der Maximalwert.");
                    }

                    await this.settings.setMaxAmount(ctx.chat.id, nextValue);

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