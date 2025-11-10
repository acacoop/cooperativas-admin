-- CreateTable
CREATE TABLE "cost_centers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cooperative_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "cost_centers_cooperative_id_fkey" FOREIGN KEY ("cooperative_id") REFERENCES "cooperatives" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoice_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cooperative_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "invoice_categories_cooperative_id_fkey" FOREIGN KEY ("cooperative_id") REFERENCES "cooperatives" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cooperatives" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" INTEGER NOT NULL,
    "cuit" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "votes" INTEGER,
    "substitutes" INTEGER,
    "car" INTEGER,
    "car_name" TEXT,
    "verification_code" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "president" TEXT,
    "secretary" TEXT,
    "treasurer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "invoiceSystemActive" BOOLEAN DEFAULT false,
    "activatedAt" DATETIME,
    "activatedBy" INTEGER,
    "adminUserId" INTEGER,
    CONSTRAINT "cooperatives_activatedBy_fkey" FOREIGN KEY ("activatedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cooperatives_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_cooperatives" ("address", "car", "car_name", "code", "created_at", "cuit", "email", "id", "name", "phone", "president", "secretary", "status", "substitutes", "treasurer", "updated_at", "verification_code", "votes") SELECT "address", "car", "car_name", "code", "created_at", "cuit", "email", "id", "name", "phone", "president", "secretary", "status", "substitutes", "treasurer", "updated_at", "verification_code", "votes" FROM "cooperatives";
DROP TABLE "cooperatives";
ALTER TABLE "new_cooperatives" RENAME TO "cooperatives";
CREATE UNIQUE INDEX "cooperatives_code_key" ON "cooperatives"("code");
CREATE UNIQUE INDEX "cooperatives_cuit_key" ON "cooperatives"("cuit");
CREATE TABLE "new_invoices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_number" TEXT NOT NULL,
    "issue_date" DATETIME NOT NULL,
    "issuer_cuit" TEXT NOT NULL,
    "receiver_cuit" TEXT NOT NULL,
    "cooperative_id" INTEGER,
    "supplier_id" INTEGER,
    "subtotal" REAL,
    "iva_amount" REAL,
    "total_amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendiente_validacion',
    "file_path" TEXT,
    "original_filename" TEXT,
    "rejection_reason" TEXT,
    "status_updated_by" INTEGER,
    "cost_center" TEXT,
    "category" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "validated_at" DATETIME,
    "sent_at" DATETIME,
    "responded_at" DATETIME,
    CONSTRAINT "invoices_cooperative_id_fkey" FOREIGN KEY ("cooperative_id") REFERENCES "cooperatives" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "invoices_status_updated_by_fkey" FOREIGN KEY ("status_updated_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
);
INSERT INTO "new_invoices" ("cooperative_id", "created_at", "file_path", "id", "invoice_number", "issue_date", "issuer_cuit", "iva_amount", "original_filename", "receiver_cuit", "rejection_reason", "responded_at", "sent_at", "status", "subtotal", "supplier_id", "total_amount", "updated_at", "validated_at") SELECT "cooperative_id", "created_at", "file_path", "id", "invoice_number", "issue_date", "issuer_cuit", "iva_amount", "original_filename", "receiver_cuit", "rejection_reason", "responded_at", "sent_at", "status", "subtotal", "supplier_id", "total_amount", "updated_at", "validated_at" FROM "invoices";
DROP TABLE "invoices";
ALTER TABLE "new_invoices" RENAME TO "invoices";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_cooperative_id_name_key" ON "cost_centers"("cooperative_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_categories_cooperative_id_name_key" ON "invoice_categories"("cooperative_id", "name");
