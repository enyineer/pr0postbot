import { Menu, MenuFlavor } from '@grammyjs/menu';
import { Context, Filter } from 'grammy';
import { FilterFlags, Settings } from '../settings/settings';
import { CustomMenu } from './menu';
import { SettingsMenu } from './settingsMenu';

export class FilterMenu extends CustomMenu {
    private static instance: FilterMenu;

    static getInstance(): FilterMenu {
        if (FilterMenu.instance === undefined) {
            FilterMenu.instance = new FilterMenu();
        }
        return FilterMenu.instance;
    }

    private constructor() {
        super("filters-menu", "Setze die gewünschten Filter.");
    }

    getMenu = (): Menu => {
        return new Menu(this.getMenuIdentifier(), { autoAnswer: false })
        .text(
            async (ctx) =>
                ctx.chat &&
                    (await this.settings.isFilterFlagEnabled(ctx.chat.id, FilterFlags.SFW))
                    ? "SFW ✅"
                    : "SFW ❌",
            async (ctx) =>
                this.filterFlagMenuCallbackHander(ctx, FilterFlags.SFW, this.settings)
        )
        .text(
            async (ctx) =>
                ctx.chat &&
                    (await this.settings.isFilterFlagEnabled(ctx.chat.id, FilterFlags.NSFW))
                    ? "NSFW ✅"
                    : "NSFW ❌",
            async (ctx) =>
                this.filterFlagMenuCallbackHander(ctx, FilterFlags.NSFW, this.settings)
        )
        .text(
            async (ctx) =>
                ctx.chat &&
                    (await this.settings.isFilterFlagEnabled(ctx.chat.id, FilterFlags.NSFL))
                    ? "NSFL ✅"
                    : "NSFL ❌",
            async (ctx) =>
                this.filterFlagMenuCallbackHander(ctx, FilterFlags.NSFL, this.settings)
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

    private filterFlagMenuCallbackHander = async (
        ctx: Filter<Context, "callback_query"> & MenuFlavor,
        type: FilterFlags,
        settings: Settings
    ) => {
        if (await this.canClickMenu(ctx)) {
            try {
                ctx.chat && (await settings.toggleFilterFlag(ctx.chat.id, type));
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