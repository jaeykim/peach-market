-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "verifiedAt" DATETIME,
    "residentNumber" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isBroker" BOOLEAN NOT NULL DEFAULT false,
    "brokerLicense" TEXT,
    "brokerOffice" TEXT,
    "brokerRegion" TEXT,
    "notifEmailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notifPushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notifAppEnabled" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("address", "brokerLicense", "brokerOffice", "brokerRegion", "createdAt", "email", "id", "isBroker", "name", "password", "phone", "residentNumber", "verifiedAt") SELECT "address", "brokerLicense", "brokerOffice", "brokerRegion", "createdAt", "email", "id", "isBroker", "name", "password", "phone", "residentNumber", "verifiedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
