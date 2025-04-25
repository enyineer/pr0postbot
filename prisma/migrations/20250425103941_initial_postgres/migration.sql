-- CreateTable
CREATE TABLE "TelegramChat" (
    "id" BIGINT NOT NULL,
    "sfw" BOOLEAN NOT NULL DEFAULT true,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,
    "nsfl" BOOLEAN NOT NULL DEFAULT false,
    "latestSettingsMenuId" BIGINT NOT NULL DEFAULT 0,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendInterval" INTEGER NOT NULL DEFAULT 300,
    "minBenis" INTEGER NOT NULL DEFAULT 0,
    "maxAmount" INTEGER NOT NULL DEFAULT 16,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "showText" BOOLEAN NOT NULL DEFAULT true,
    "showNew" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TelegramChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pr0grammItem" (
    "id" INTEGER NOT NULL,
    "promoted" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "up" INTEGER NOT NULL,
    "down" INTEGER NOT NULL,
    "created" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "thumb" TEXT NOT NULL,
    "fullsize" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "audio" BOOLEAN NOT NULL,
    "source" TEXT NOT NULL,
    "flags" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "mark" INTEGER NOT NULL,
    "gift" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cold" BOOLEAN NOT NULL DEFAULT false,
    "preview" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Pr0grammItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShownItemsOnChats" (
    "telegramChatId" BIGINT NOT NULL,
    "pr0grammItemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sendSuccess" BOOLEAN NOT NULL,

    CONSTRAINT "ShownItemsOnChats_pkey" PRIMARY KEY ("telegramChatId","pr0grammItemId")
);

-- AddForeignKey
ALTER TABLE "ShownItemsOnChats" ADD CONSTRAINT "ShownItemsOnChats_telegramChatId_fkey" FOREIGN KEY ("telegramChatId") REFERENCES "TelegramChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShownItemsOnChats" ADD CONSTRAINT "ShownItemsOnChats_pr0grammItemId_fkey" FOREIGN KEY ("pr0grammItemId") REFERENCES "Pr0grammItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
