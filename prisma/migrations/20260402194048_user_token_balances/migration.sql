-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" DATETIME,
    "plan" TEXT NOT NULL DEFAULT 'NONE',
    "planStartedAt" DATETIME,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "tokensAvailable" INTEGER NOT NULL DEFAULT 0,
    "tokensHeld" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("email", "emailVerified", "id", "image", "name", "phone", "phoneVerified", "phoneVerifiedAt", "plan", "planStartedAt", "profileComplete") SELECT "email", "emailVerified", "id", "image", "name", "phone", "phoneVerified", "phoneVerifiedAt", "plan", "planStartedAt", "profileComplete" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
