-- CreateTable
CREATE TABLE "ShownItemsOnChats" (
    "telegramChatId" BIGINT NOT NULL,
    "pr0grammItemId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sendSuccess" BOOLEAN NOT NULL,

    PRIMARY KEY ("telegramChatId", "pr0grammItemId"),
    CONSTRAINT "ShownItemsOnChats_telegramChatId_fkey" FOREIGN KEY ("telegramChatId") REFERENCES "TelegramChat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ShownItemsOnChats_pr0grammItemId_fkey" FOREIGN KEY ("pr0grammItemId") REFERENCES "Pr0grammItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TelegramChat" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "sfw" BOOLEAN NOT NULL DEFAULT true,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,
    "nsfl" BOOLEAN NOT NULL DEFAULT false,
    "latestFilterMenuId" BIGINT NOT NULL DEFAULT 0,
    "latestSettingsMenuId" BIGINT NOT NULL DEFAULT 0,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendInterval" INTEGER NOT NULL DEFAULT 5,
    "minBenis" INTEGER NOT NULL DEFAULT 0,
    "maxAmount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_TelegramChat" ("createdAt", "id", "latestFilterMenuId", "nsfl", "nsfw", "sfw", "updatedAt") SELECT "createdAt", "id", "latestFilterMenuId", "nsfl", "nsfw", "sfw", "updatedAt" FROM "TelegramChat";
DROP TABLE "TelegramChat";
ALTER TABLE "new_TelegramChat" RENAME TO "TelegramChat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
