//import { apiThrottler } from "@grammyjs/transformer-throttler";
import { Bot as GrammyBot, Context, Filter, CommandContext } from "grammy";
import { Logger } from "../logger/logger";
import { Pr0grammService } from "../services/logic/pr0grammService";
import { TelegramChatService } from "../services/database/telegramChatService";
import { ChatService } from "../services/logic/chatService";
import { SettingsMenu } from "./menus/settingsMenu";
import { Utils } from "./utils";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import { run } from "@grammyjs/runner";
import { Update } from "grammy/types";
export class Bot {
  private readonly bot: GrammyBot;
  private readonly telegramChatService: TelegramChatService;
  private readonly pr0grammService: Pr0grammService;
  private readonly chatService: ChatService;

  constructor(botToken: string) {
    this.bot = new GrammyBot(botToken);

    const throttler = apiThrottler();
    this.bot.api.config.use(throttler);

    this.telegramChatService = new TelegramChatService();
    this.pr0grammService = Pr0grammService.getInstance();
    // Todo: Move bot out of ChatService
    this.chatService = ChatService.getInstance(this.bot);

    //const throttler = apiThrottler();
    //this.bot.api.config.use(throttler);

    this.setupStartAction(this.bot);
    this.setupMyChatMemberAction(this.bot);
    this.setUpSettingsCommand(this.bot);

    this.bot.catch((err) => {
      Logger.i.error("Caught bot error", err);
    });

    this.bot.init().then(() => {
      run(this.bot);
      Logger.i.info(`Bot started - https://t.me/${this.bot.botInfo.username}`);
      this.startUpdateLoops();
    });
  }

  private async setActive(
    ctx: CommandContext<Context> | Filter<Context, "my_chat_member">,
    active: boolean
  ) {
    await this.telegramChatService.setActive(ctx.chat.id, active);
    if (active) {
      ctx.reply(
        `Ich schicke ${
          ctx.chat.type === "private" ? "dir" : "euch"
        } jetzt die neusten beliebten Posts von Pr0gramm. Benutze /settings um die Einstellungen anzupassen.`
      );
      Logger.i.info(`Joined chat ${ctx.chat.id}`);
    } else {
      Logger.i.info(`Left chat ${ctx.chat.id}`);
    }
  }

  private async setupStartAction(bot: GrammyBot) {
    bot.command("start", (ctx) => {
      this.setActive(ctx, true);
    });
  }

  private setupMyChatMemberAction(bot: GrammyBot) {
    bot.on("my_chat_member", async (ctx) => {
      switch (ctx.myChatMember.new_chat_member.status) {
        case "administrator":
        case "creator":
        case "member":
          await this.setActive(ctx, true);
          break;
        case "kicked":
        case "left":
          // Only set chats to inactive to prevent foreign key inconsistencies
          await this.setActive(ctx, false);
          break;
      }
    });
  }

  private setUpSettingsCommand(bot: GrammyBot) {
    bot.use(SettingsMenu.getInstance().getMenu());

    bot.command("settings", async (ctx) => {
      if (!(await Utils.isAdmin(ctx))) {
        return ctx.reply(
          "Die Einstellungen dürfen nur durch Admins dieses Chats verändert werden."
        );
      }

      const settingsMessage = await ctx.reply(
        SettingsMenu.getInstance().getMenuText(),
        { reply_markup: SettingsMenu.getInstance().getMenu() }
      );

      await this.telegramChatService.updateLatestSettingsMenuId(
        ctx.chat.id,
        settingsMessage.message_id
      );
    });
  }

  private async startUpdateLoops() {
    const eventEmitter = await this.pr0grammService.start();
    this.chatService.start(eventEmitter);
  }
}
