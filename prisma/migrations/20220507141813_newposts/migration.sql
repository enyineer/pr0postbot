-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TelegramChat" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "sfw" BOOLEAN NOT NULL DEFAULT true,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,
    "nsfl" BOOLEAN NOT NULL DEFAULT false,
    "latestSettingsMenuId" BIGINT NOT NULL DEFAULT 0,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendInterval" INTEGER NOT NULL DEFAULT 300,
    "minBenis" INTEGER NOT NULL DEFAULT 0,
    "maxAmount" INTEGER NOT NULL DEFAULT 16,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "showText" BOOLEAN NOT NULL DEFAULT true,
    "showNew" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_TelegramChat" ("active", "createdAt", "id", "lastUpdate", "latestSettingsMenuId", "maxAmount", "minBenis", "nsfl", "nsfw", "sendInterval", "sfw", "showText", "updatedAt") SELECT "active", "createdAt", "id", "lastUpdate", "latestSettingsMenuId", "maxAmount", "minBenis", "nsfl", "nsfw", "sendInterval", "sfw", "showText", "updatedAt" FROM "TelegramChat";
DROP TABLE "TelegramChat";
ALTER TABLE "new_TelegramChat" RENAME TO "TelegramChat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
