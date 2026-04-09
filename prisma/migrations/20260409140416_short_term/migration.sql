-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "isSublet" BOOLEAN NOT NULL DEFAULT false,
    "isShortTerm" BOOLEAN NOT NULL DEFAULT false,
    "rentalMonths" INTEGER,
    "address" TEXT NOT NULL,
    "addressDetail" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "title" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "areaExclusive" REAL,
    "areaSupply" REAL,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "direction" TEXT,
    "builtYear" INTEGER,
    "rooms" INTEGER,
    "bathrooms" INTEGER,
    "maintenanceFee" INTEGER,
    "askingPrice" INTEGER NOT NULL,
    "priceMin" INTEGER,
    "priceMax" INTEGER,
    "deposit" INTEGER,
    "dealType" TEXT NOT NULL,
    "description" TEXT,
    "photos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("address", "addressDetail", "areaExclusive", "areaSupply", "askingPrice", "bathrooms", "builtYear", "createdAt", "dealType", "deposit", "description", "direction", "floor", "id", "isSublet", "lat", "lng", "maintenanceFee", "ownerId", "photos", "priceMax", "priceMin", "propertyType", "rooms", "side", "status", "title", "totalFloors", "updatedAt", "viewCount") SELECT "address", "addressDetail", "areaExclusive", "areaSupply", "askingPrice", "bathrooms", "builtYear", "createdAt", "dealType", "deposit", "description", "direction", "floor", "id", "isSublet", "lat", "lng", "maintenanceFee", "ownerId", "photos", "priceMax", "priceMin", "propertyType", "rooms", "side", "status", "title", "totalFloors", "updatedAt", "viewCount" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
