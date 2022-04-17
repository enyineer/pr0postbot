import { Prisma, PrismaClient } from '@prisma/client';

export class ShownItemsOnChatsService {
    private readonly prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(data: Prisma.ShownItemsOnChatsCreateInput) {
        return await this.prisma.shownItemsOnChats.create({ data });
    }

    async findUnique(where: Prisma.ShownItemsOnChatsWhereUniqueInput) {
        return await this.prisma.shownItemsOnChats.findUnique({ where });
    }

    async findMany(where: Prisma.ShownItemsOnChatsWhereInput) {
        return await this.prisma.shownItemsOnChats.findMany({
            where
        });
    }

    async update(update: Prisma.ShownItemsOnChatsUpdateArgs) {
        return await this.prisma.shownItemsOnChats.update(update)
    }

    async upsert(upsert: Prisma.ShownItemsOnChatsUpsertArgs) {
        return await this.prisma.shownItemsOnChats.upsert(upsert);
    }

    async delete(where: Prisma.ShownItemsOnChatsWhereUniqueInput) {
        return await this.prisma.shownItemsOnChats.delete({ where });
    }
}