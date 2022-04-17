import dotenv from "dotenv";
import { Bot } from './bot/bot';
import { SystemService } from './services/logic/systemService';

dotenv.config();

new Bot(SystemService.getInstance().BOT_TOKEN);