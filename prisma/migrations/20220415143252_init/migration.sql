-- CreateTable
CREATE TABLE "TelegramChat" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "sfw" BOOLEAN NOT NULL DEFAULT true,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,
    "nsfl" BOOLEAN NOT NULL DEFAULT false,
    "latestFilterMenuId" BIGINT NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pr0grammItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "gift" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
