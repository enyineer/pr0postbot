import dotenv from "dotenv";
import { DateTime } from 'luxon';
import { Bot } from './bot/bot';
import { SystemService } from './services/logic/systemService';

SystemService.getInstance().lastStartup = DateTime.now();

dotenv.config();

new Bot(SystemService.getInstance().BOT_TOKEN);