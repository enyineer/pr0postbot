import dotenv from "dotenv";
import { Bot } from './bot/bot';

dotenv.config();

if (process.env.BOT_TOKEN === undefined) {
    throw new Error("BOT_TOKEN is not defined in .env");
}

new Bot(process.env.BOT_TOKEN);