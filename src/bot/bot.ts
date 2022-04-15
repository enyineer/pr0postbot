import { Menu } from '@grammyjs/menu';
import { apiThrottler } from '@grammyjs/transformer-throttler';
import { Bot as GrammyBot, Context, Filter } from 'grammy'
import { Pr0grammService } from '../services/pr0grammService';
import { TelegramChatService } from '../services/telegramChatService';
import { Filters, FilterTypes } from './filters';
export class Bot {

    private readonly bot: GrammyBot;
    private readonly telegramChatService: TelegramChatService;
    private readonly pr0grammService: Pr0grammService;

    private readonly pr0grammCdn: string;
    private readonly pr0grammSite: string;

    constructor(botToken: string) {
        if (process.env.PR0GRAMM_CDN === undefined) {
            throw new Error("PR0GRAMM_CDN is not defined in .env");
        }
        this.pr0grammCdn = process.env.PR0GRAMM_CDN;

        if (process.env.PR0GRAMM_SITE === undefined) {
            throw new Error("PR0GRAMM_SITE is not defined in .env");
        }
        this.pr0grammSite = process.env.PR0GRAMM_SITE;

        this.telegramChatService = new TelegramChatService();
        this.pr0grammService = Pr0grammService.getInstance();

        this.bot = new GrammyBot(botToken);
        
        const throttler = apiThrottler();
        this.bot.api.config.use(throttler);

        this.setupMyChatMemberAction(this.bot);
        this.setUpFilterCommand(this.bot);

        this.bot.catch((err) => {
            console.error(JSON.stringify(err, null, 2));
        })

        this.bot.start();
        console.log("Bot started");

        this.setupPr0grammUpdateHandler(this.bot);
    }

    private setupMyChatMemberAction(bot: GrammyBot) {
        bot.on("my_chat_member", async (ctx) => {
            switch(ctx.myChatMember.new_chat_member.status) {
                case 'administrator':
                case 'creator':
                case 'member':
                    await this.telegramChatService.create({ id: ctx.chat.id });
                    ctx.reply("Ich schicke euch jetzt die neusten beliebten Posts von Pr0gramm. Benutze /filter um die Filter anzupassen (nur Admins).");
                    console.log(`Joined chat ${ctx.chat.id} - New status: ${ctx.myChatMember.new_chat_member.status}`)
                    break;
                case 'kicked':
                case 'left':
                    await this.telegramChatService.delete({ id: ctx.chat.id });
                    console.log(`Left chat ${ctx.chat.id} - New status: ${ctx.myChatMember.new_chat_member.status}`)
                    break;
            }
        });
    }

    private setUpFilterCommand(bot: GrammyBot) {
        const filters = new Filters(bot);

        const filtersMenu = new Menu("filters-menu", { autoAnswer: false })
            .text(
                async (ctx) => ctx.chat && await filters.isFilterEnabled(ctx.chat.id, FilterTypes.SFW) ? "SFW ✅" : "SFW ❌",
                async (ctx) => {
                    if (await this.isMenuOutdated(ctx)) {
                        return ctx.answerCallbackQuery({
                            text: "Dieses Menü ist veraltet."
                        });
                    }
                    if (!await this.isAdmin(ctx)) {
                        return ctx.answerCallbackQuery({
                            text: "Du bist kein Admin dieser Gruppe."
                        });
                    }
                    try {
                        ctx.chat && await filters.toggleFilter(ctx.chat.id, FilterTypes.SFW);
                        await ctx.menu.update();
                    } catch (err) {
                       if (err instanceof Error) {
                            return ctx.answerCallbackQuery({
                                text: err.message
                            });
                       }
                    }
                }
            )
            .text(
                async (ctx) => ctx.chat && await filters.isFilterEnabled(ctx.chat.id, FilterTypes.NSFW) ? "NSFW ✅" : "NSFW ❌",
                async (ctx) => {
                    if (await this.isMenuOutdated(ctx)) {
                        return ctx.answerCallbackQuery({
                            text: "Dieses Menü ist veraltet."
                        });
                    }
                    if (!await this.isAdmin(ctx)) {
                        return ctx.answerCallbackQuery({
                            text: "Du bist kein Admin dieser Gruppe."
                        });
                    }
                    try {
                        ctx.chat && await filters.toggleFilter(ctx.chat.id, FilterTypes.NSFW);
                        await ctx.menu.update();
                    } catch (err) {
                        if (err instanceof Error) {
                            return ctx.answerCallbackQuery({
                                text: err.message
                            });
                        }
                    }
                }
            )
            .text(
                async (ctx) => ctx.chat && await filters.isFilterEnabled(ctx.chat.id, FilterTypes.NSFL) ? "NSFL ✅" : "NSFL ❌",
                async (ctx) => {
                    if (await this.isMenuOutdated(ctx)) {
                        return ctx.answerCallbackQuery({
                            text: "Dieses Menü ist veraltet."
                        });
                    }
                    if (!await this.isAdmin(ctx)) {
                        return ctx.answerCallbackQuery({
                            text: "Du bist kein Admin dieser Gruppe."
                        });
                    }
                    try {
                        ctx.chat && await filters.toggleFilter(ctx.chat.id, FilterTypes.NSFL);
                        await ctx.menu.update();
                    } catch (err) {
                        if (err instanceof Error) {
                            return ctx.answerCallbackQuery({
                                text: err.message
                            });
                        }
                    }
                }
            );

        bot.use(filtersMenu);
        
        bot.command("filter", async (ctx) => {
            if (ctx.from === undefined) {
                return ctx.reply("Ich kann leider nur auf Direktnachrichten reagieren.");
            }

            if (!await this.isAdmin(ctx)) {
                return ctx.reply("Die Filtereinstellungen dürfen nur durch Admins dieses Chats verändert werden.");
            }

            const filterMenuMessage = await ctx.reply("Schalte Filter für die Posts ein oder aus.", { reply_markup: filtersMenu });

            await this.telegramChatService.updateLatestFilterMenuId(ctx.chat.id, filterMenuMessage.message_id);
        });
    }

    private setupPr0grammUpdateHandler(bot: GrammyBot) {
        const itemUpdateObservable = this.pr0grammService.getItemObservable();

        itemUpdateObservable.subscribe(async (update) => {
            
            const activeChats = await this.telegramChatService.findAll();

            for (const chat of activeChats) {
                
                if (Filters.isFlagMatchingFilters(update.flags, {
                    sfw: chat.sfw,
                    nsfw: chat.nsfw,
                    nsfl: chat.nsfl
                })) {
                    const imageUrl = `${this.pr0grammCdn}/${update.image}`
                    const postMarkdown = `<a href="${this.pr0grammSite}/top/${update.id}">Post</a>`;
                    const userMarkdown = `<a href="${this.pr0grammSite}/user/${update.user}">${update.user}</a>`;
                    const caption = `${postMarkdown} von ${userMarkdown}`;
                    if (update.image.endsWith(".mp4")) {
                        await bot.api.sendVideo(parseInt(chat.id.toString()), imageUrl, {
                            caption: caption,
                            parse_mode: 'HTML'
                        });
                    } else if (update.image.endsWith(".jpg") || update.image.endsWith(".png")) {
                        await bot.api.sendPhoto(parseInt(chat.id.toString()), imageUrl, {
                            caption: caption,
                            parse_mode: 'HTML'
                        });
                    } else {
                        console.error(`Unknown file type for image ${update.image}`);
                    }
                }
            }
        });

        this.pr0grammService.start();
    }

    private async isAdmin(ctx: Filter<Context, "message"> | Filter<Context, "callback_query">): Promise<boolean> {
        if (ctx.chat === undefined) {
            return false;
        }

        if (ctx.chat.type === "private") {
            return true;
        }

        const chatMember = await ctx.getChatMember(ctx.from.id);

        if (chatMember.status !== "administrator" && chatMember.status !== "creator") {
            return false;
        }

        return true;
    }

    private async isMenuOutdated(ctx: Filter<Context, "callback_query">): Promise<boolean> {
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

        if (originatingMessageId === undefined || originatingMessageId !== parseInt(chat.latestFilterMenuId.toString())) {
            return true;
        }

        return false;
    }

}