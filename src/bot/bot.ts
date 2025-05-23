//import { apiThrottler } from "@grammyjs/transformer-throttler";
import {
  Bot as GrammyBot,
  Context,
  Filter,
  CommandContext,
  webhookCallback,
} from "grammy";
import { logger } from "../logger/logger";
import { Pr0grammService } from "../services/logic/pr0grammService";
import { TelegramChatService } from "../services/database/telegramChatService";
import { ChatService } from "../services/logic/chatService";
import { SettingsMenu } from "./menus/settingsMenu";
import { Utils } from "./utils";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import http from "http";

import express from "express";

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

    this.setupStartAction(this.bot);
    this.setupMyChatMemberAction(this.bot);
    this.setUpSettingsCommand(this.bot);

    this.bot.catch((err) => {
      logger.error("Caught bot error", err);
    });

    if (process.env.NODE_ENV !== "production") {
      this.bot.init().then(() => {
        this.bot.start();
        this.startUpdateLoops();
        logger.info(
          `Bot started with long polling - https://t.me/${this.bot.botInfo.username}`
        );
      });
    } else {
      const BOT_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL;
      if (!BOT_WEBHOOK_URL) {
        throw new Error("BOT_WEBHOOK_URL is not set!");
      }

      const BOT_WEBHOOK_PORT = Number.parseInt(
        process.env.BOT_WEBHOOK_PORT ?? ""
      );
      if (Number.isNaN(BOT_WEBHOOK_PORT)) {
        throw new Error("BOT_WEBHOOK_PORT is not set or not numeric!");
      }

      const BOT_WEBHOOK_SECRET = process.env.BOT_WEBHOOK_SECRET;
      if (!BOT_WEBHOOK_SECRET) {
        throw new Error(`BOT_WEBHOOK_SECRET is not set!`);
      }
      if (!/[A-Za-z0-9\-_]{1,256}/.test(BOT_WEBHOOK_SECRET)) {
        throw new Error(
          `BOT_WEBHOOK_SECRET can only contain A-Z, a-z, 0-9, -, _ and be between 1 and 256 characters long!`
        );
      }

      const app = express();
      app.use(express.json());
      app.use(
        webhookCallback(this.bot, "express", {
          secretToken: BOT_WEBHOOK_SECRET,
        })
      );

      http.createServer(app).listen(BOT_WEBHOOK_PORT);

      logger.info(`Webhook server is listening on Port ${BOT_WEBHOOK_PORT}`);

      this.bot.init().then(async () => {
        try {
          await this.bot.api.setWebhook(BOT_WEBHOOK_URL, {
            secret_token: BOT_WEBHOOK_SECRET,
          });
          logger.info(`Set webhook URL to ${BOT_WEBHOOK_URL}`);
        } catch (err) {
          logger.warn(
            `Failed to setup Webhook URL - This could be because you restarted your instance too often. Open https://api.telegram.org/bot${botToken}/setWebhook?url=${BOT_WEBHOOK_URL} manually if necessary.\n${JSON.stringify(
              err
            )}`
          );
        }
        this.startUpdateLoops();
        logger.info(
          `Bot started with webhook - https://t.me/${this.bot.botInfo.username}`
        );
      });
    }
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
      logger.info(`Joined chat ${ctx.chat.id}`);
    } else {
      logger.info(`Left chat ${ctx.chat.id}`);
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
