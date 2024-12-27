-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pr0grammItem" (
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
    "gift" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "cold" BOOLEAN NOT NULL DEFAULT false,
    "preview" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Pr0grammItem" ("audio", "cold", "created", "createdAt", "down", "flags", "fullsize", "gift", "height", "id", "image", "mark", "preview", "promoted", "source", "thumb", "up", "updatedAt", "user", "userId", "width") SELECT "audio", "cold", "created", "createdAt", "down", "flags", "fullsize", "gift", "height", "id", "image", "mark", "preview", "promoted", "source", "thumb", "up", "updatedAt", "user", "userId", "width" FROM "Pr0grammItem";
DROP TABLE "Pr0grammItem";
ALTER TABLE "new_Pr0grammItem" RENAME TO "Pr0grammItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
