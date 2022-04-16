import { Menu, MenuFlavor } from "@grammyjs/menu";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import { Bot as GrammyBot, Context, Filter } from "grammy";
import { Logger } from '../logger/logger';
import { Pr0grammService } from "../services/pr0grammService";
import { TelegramChatService } from "../services/telegramChatService";
import { Filters, FilterTypes } from "./filters";
export class Bot {
    private readonly bot: GrammyBot;
    private readonly telegramChatService: TelegramChatService;
    private readonly pr0grammService: Pr0grammService;

    constructor(botToken: string) {
        this.telegramChatService = new TelegramChatService();
        this.pr0grammService = Pr0grammService.getInstance();

        this.bot = new GrammyBot(botToken);

        const throttler = apiThrottler();
        this.bot.api.config.use(throttler);

        this.setupMyChatMemberAction(this.bot);
        this.setUpFilterCommand(this.bot);

        this.bot.catch((err) => {
            Logger.i.error("Caught bot error", err);
        });

        this.bot.start();
        Logger.i.info("Bot started");

        this.setupPr0grammUpdateHandler(this.bot);
    }

    private setupMyChatMemberAction(bot: GrammyBot) {
        bot.on("my_chat_member", async (ctx) => {
            switch (ctx.myChatMember.new_chat_member.status) {
                case "administrator":
                case "creator":
                case "member":
                    await this.telegramChatService.create({ id: ctx.chat.id });
                    ctx.reply(
                        "Ich schicke euch jetzt die neusten beliebten Posts von Pr0gramm. Benutze /filter um die Filter anzupassen (nur Admins)."
                    );
                    Logger.i.info(
                        `Joined chat ${ctx.chat.id} - New status: ${ctx.myChatMember.new_chat_member.status}`
                    );
                    break;
                case "kicked":
                case "left":
                    await this.telegramChatService.delete({ id: ctx.chat.id });
                    Logger.i.info(
                        `Left chat ${ctx.chat.id} - New status: ${ctx.myChatMember.new_chat_member.status}`
                    );
                    break;
            }
        });
    }

    private setUpFilterCommand(bot: GrammyBot) {
        const filters = new Filters();

        const filtersMenu = new Menu("filters-menu", { autoAnswer: false })
            .text(
                async (ctx) =>
                    ctx.chat &&
                        (await filters.isFilterEnabled(ctx.chat.id, FilterTypes.SFW))
                        ? "SFW ✅"
                        : "SFW ❌",
                async (ctx) =>
                    this.filterMenuCallbackHander(ctx, FilterTypes.SFW, filters)
            )
            .text(
                async (ctx) =>
                    ctx.chat &&
                        (await filters.isFilterEnabled(ctx.chat.id, FilterTypes.NSFW))
                        ? "NSFW ✅"
                        : "NSFW ❌",
                async (ctx) =>
                    this.filterMenuCallbackHander(ctx, FilterTypes.NSFW, filters)
            )
            .text(
                async (ctx) =>
                    ctx.chat &&
                        (await filters.isFilterEnabled(ctx.chat.id, FilterTypes.NSFL))
                        ? "NSFL ✅"
                        : "NSFL ❌",
                async (ctx) =>
                    this.filterMenuCallbackHander(ctx, FilterTypes.NSFL, filters)
            );

        bot.use(filtersMenu);

        bot.command("filter", async (ctx) => {
            if (ctx.from === undefined) {
                return ctx.reply(
                    "Ich kann leider nur auf Direktnachrichten reagieren."
                );
            }

            if (!(await this.isAdmin(ctx))) {
                return ctx.reply(
                    "Die Filtereinstellungen dürfen nur durch Admins dieses Chats verändert werden."
                );
            }

            const filterMenuMessage = await ctx.reply(
                "Schalte Filter für die Posts ein oder aus.",
                { reply_markup: filtersMenu }
            );

            await this.telegramChatService.updateLatestFilterMenuId(
                ctx.chat.id,
                filterMenuMessage.message_id
            );
        });
    }

    private filterMenuCallbackHander = async (
        ctx: Filter<Context, "callback_query"> & MenuFlavor,
        type: FilterTypes,
        filters: Filters
    ) => {
        if (await this.isMenuOutdated(ctx)) {
            return ctx.answerCallbackQuery({
                text: "Dieses Menü ist veraltet.",
            });
        }
        if (!(await this.isAdmin(ctx))) {
            return ctx.answerCallbackQuery({
                text: "Du bist kein Admin dieser Gruppe.",
            });
        }
        try {
            ctx.chat && (await filters.toggleFilter(ctx.chat.id, type));
            await ctx.menu.update();
        } catch (err) {
            if (err instanceof Error) {
                return ctx.answerCallbackQuery({
                    text: err.message,
                });
            }
        }
    };

    private setupPr0grammUpdateHandler(bot: GrammyBot) {
        const updateObservable = this.pr0grammService.getUpdateObservable();

        updateObservable.subscribe(async (update) => {
            const activeChats = await this.telegramChatService.findAll();

            for (const chat of activeChats) {
                update.filter({
                    sfw: chat.sfw,
                    nsfw: chat.nsfw,
                    nsfl: chat.nsfl
                })
                .toMediaCollectionGroup()
                .send(bot, parseInt(chat.id.toString()));
            }
        });

        this.pr0grammService.start();
    }

    private async isAdmin(
        ctx: Filter<Context, "message"> | Filter<Context, "callback_query">
    ): Promise<boolean> {
        if (ctx.chat === undefined) {
            return false;
        }

        if (ctx.chat.type === "private") {
            return true;
        }

        const chatMember = await ctx.getChatMember(ctx.from.id);

        if (
            chatMember.status !== "administrator" &&
            chatMember.status !== "creator"
        ) {
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
            originatingMessageId !== parseInt(chat.latestFilterMenuId.toString())
        ) {
            return true;
        }

        return false;
    }

    
}



