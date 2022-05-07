import { Prisma, PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

export class TelegramChatService {
    private readonly prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(data: Prisma.TelegramChatCreateInput) {
        const existingChat = await this.prisma.telegramChat.findUnique({
            where: {
                id: data.id
            }
        });

        if (existingChat !== null) {
            return existingChat;
        }
        
        return await this.prisma.telegramChat.create({ data });
    }

    async findUnique(where: Prisma.TelegramChatWhereUniqueInput) {
        return await this.prisma.telegramChat.findUnique({ where });
    }

    async findMany(args: Prisma.TelegramChatFindManyArgs) {
        return await this.prisma.telegramChat.findMany(args);
    }

    async update(update: Prisma.TelegramChatUpdateArgs) {
        return await this.prisma.telegramChat.update(update)
    }

    async upsert(args: Prisma.TelegramChatUpsertArgs) {
        return await this.prisma.telegramChat.upsert(args);
    }

    async delete(where: Prisma.TelegramChatWhereUniqueInput) {
        return await this.prisma.telegramChat.delete({ where });
    }

    async updateLatestSettingsMenuId(chatId: number, menuId: number) {
        return await this.prisma.telegramChat.update({
            data: {
                latestSettingsMenuId: menuId
            },
            where: {
                id: chatId
            }
        });
    }

    async setActive(chatId: number, active: boolean) {
        return await this.upsert({
            create: {
                id: chatId,
                active,
                lastUpdate: DateTime.now().toJSDate()
            },
            update: {
                active,
                lastUpdate: DateTime.now().toJSDate()
            },
            where: {
                id: chatId
            }
        });
    }

    async updateLastUpdate(chatId: number) {
        this.update({
            data: {
                lastUpdate: DateTime.now().toJSDate()
            },
            where: {
                id: chatId
            }
        });
    }

}