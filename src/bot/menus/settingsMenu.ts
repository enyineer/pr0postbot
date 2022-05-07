import { Menu } from '@grammyjs/menu';
import { FilterMenu } from './filterMenu';
import { MaxAmountMenu } from './maxAmountMenu';
import { CustomMenu } from './menu';
import { MinBenisMenu } from './minBenisMenu';
import { SendIntervalMenu } from './sendIntervalMenu';
import { StyleMenu } from './styleMenu';

export class SettingsMenu extends CustomMenu {
    private static instance: SettingsMenu;

    static getInstance(): SettingsMenu {
        if (SettingsMenu.instance === undefined) {
            SettingsMenu.instance = new SettingsMenu();
        }
        return SettingsMenu.instance;
    }

    private constructor() {
        super("settings-menu", "Wähle eine der Einstellungen für weitere Informationen.");
    }

    getMenu = (): Menu => {
        const menu = new Menu(this.getMenuIdentifier())
        .text(
            "👀 Filter",
            async (ctx) => {
                if (await this.canClickMenu(ctx)) {
                    await ctx.menu.nav(FilterMenu.getInstance().getMenuIdentifier(), { immediate: false });
                    await ctx.editMessageText(FilterMenu.getInstance().getMenuText());
                }
            }
        )
        .text(
            "⏲️ Intervall",
            async (ctx) => {
                if (await this.canClickMenu(ctx)) {
                    await ctx.menu.nav(SendIntervalMenu.getInstance().getMenuIdentifier(), { immediate: false });
                    await ctx.editMessageText(SendIntervalMenu.getInstance().getMenuText());
                }
            }
        ).row()
        .text(
            "✉️ Max. Nachrichten",
            async (ctx) => {
                if (await this.canClickMenu(ctx)) {
                    await ctx.menu.nav(MaxAmountMenu.getInstance().getMenuIdentifier(), { immediate: false });
                    await ctx.editMessageText(MaxAmountMenu.getInstance().getMenuText());
                }
            }
        )
        .text(
            "➕ Mindestbenis",
            async (ctx) => {
                if (await this.canClickMenu(ctx)) {
                    await ctx.menu.nav(MinBenisMenu.getInstance().getMenuIdentifier(), { immediate: false });
                    await ctx.editMessageText(MinBenisMenu.getInstance().getMenuText());
                }
            }
        ).row()
        .text(
            "🔎 Ansicht",
            async (ctx) => {
                if (await this.canClickMenu(ctx)) {
                    await ctx.menu.nav(StyleMenu.getInstance().getMenuIdentifier(), { immediate: false });
                    await ctx.editMessageText(StyleMenu.getInstance().getMenuText());
                }
            }
        ).row()

        menu.register([
            FilterMenu.getInstance().getMenu(),
            SendIntervalMenu.getInstance().getMenu(),
            MaxAmountMenu.getInstance().getMenu(),
            MinBenisMenu.getInstance().getMenu(),
            StyleMenu.getInstance().getMenu()
        ]);

        return menu;
    }

}