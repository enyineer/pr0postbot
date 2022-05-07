import { Menu, MenuFlavor } from '@grammyjs/menu';
import { Context, Filter } from 'grammy';
import { CustomMenu } from './menu';
import { SettingsMenu } from './settingsMenu';

export class StyleMenu extends CustomMenu {
    private static instance: StyleMenu;

    static getInstance(): StyleMenu {
        if (StyleMenu.instance === undefined) {
            StyleMenu.instance = new StyleMenu();
        }
        return StyleMenu.instance;
    }

    private constructor() {
        super("style-menu", "Stelle die Ansicht der Posts um.");
    }

    getMenu = (): Menu => {
        return new Menu(this.getMenuIdentifier(), { autoAnswer: false })
        .text(
            async (ctx) => {
                if (ctx.chat === undefined) {
                    return "Kein Chat";
                }
                const chatSettings = await this.settings.getSettings(ctx.chat.id);
                return chatSettings.showText === true ? "✅ Text" : "❌ Text";
            },
            async (ctx) => {
                await this.showTextButtonCallbackHander(ctx);
            }
        ).row()
        .text(
            "Zurück",
            async (ctx) => {
                if (await this.canClickMenu(ctx)) {
                    await ctx.menu.back({ immediate: false });
                    await ctx.editMessageText(SettingsMenu.getInstance().getMenuText());
                }
            }
        );
    }

    private showTextButtonCallbackHander = async (
        ctx: Filter<Context, "callback_query"> & MenuFlavor,
    ) => {
        if (await this.canClickMenu(ctx)) {
            try {
                ctx.chat && await this.settings.toggleShowText(ctx.chat.id);
                await ctx.menu.update();
            } catch (err) {
                if (err instanceof Error) {
                    return ctx.answerCallbackQuery({
                        text: err.message,
                    });
                }
            }
        }
    };

}