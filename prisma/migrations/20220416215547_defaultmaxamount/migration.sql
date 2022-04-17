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
    "maxAmount" INTEGER NOT NULL DEFAULT 16,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_TelegramChat" ("active", "createdAt", "id", "lastUpdate", "latestFilterMenuId", "latestSettingsMenuId", "maxAmount", "minBenis", "nsfl", "nsfw", "sendInterval", "sfw", "updatedAt") SELECT "active", "createdAt", "id", "lastUpdate", "latestFilterMenuId", "latestSettingsMenuId", "maxAmount", "minBenis", "nsfl", "nsfw", "sendInterval", "sfw", "updatedAt" FROM "TelegramChat";
DROP TABLE "TelegramChat";
ALTER TABLE "new_TelegramChat" RENAME TO "TelegramChat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
