import dotenv from "dotenv";
import { DateTime } from 'luxon';
import { Bot } from './bot/bot';
import { SystemService } from './services/logic/systemService';

dotenv.config();

SystemService.getInstance().startupTime = DateTime.now();
new Bot(SystemService.getInstance().BOT_TOKEN);