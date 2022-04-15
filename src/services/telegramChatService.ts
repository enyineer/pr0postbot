import { Prisma, PrismaClient } from '@prisma/client';

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

    async findAll() {
        return await this.prisma.telegramChat.findMany();
    }

    async update(update: Prisma.TelegramChatUpdateArgs) {
        return await this.prisma.telegramChat.update(update)
    }

    async delete(where: Prisma.TelegramChatWhereUniqueInput) {
        return await this.prisma.telegramChat.delete({ where });
    }

    async updateLatestFilterMenuId(chatId: number, menuId: number) {
        return await this.prisma.telegramChat.update({
            data: {
                latestFilterMenuId: menuId
            },
            where: {
                id: chatId
            }
        });
    }
}