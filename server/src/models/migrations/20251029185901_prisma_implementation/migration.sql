-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "cooperative_id" INTEGER,
    "full_name" TEXT,
    "company_name" TEXT,
    "cuit" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_cooperative_id_fkey" FOREIGN KEY ("cooperative_id") REFERENCES "cooperatives" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "cooperatives" (
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
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pending_changes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cooperative_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "changes" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by" INTEGER,
    "reviewed_at" DATETIME,
    CONSTRAINT "pending_changes_cooperative_id_fkey" FOREIGN KEY ("cooperative_id") REFERENCES "cooperatives" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "pending_changes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "pending_changes_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "invoices" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "validated_at" DATETIME,
    "sent_at" DATETIME,
    "responded_at" DATETIME,
    CONSTRAINT "invoices_cooperative_id_fkey" FOREIGN KEY ("cooperative_id") REFERENCES "cooperatives" ("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit_price" REAL NOT NULL,
    "total_price" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoice_attachments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_id" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_attachments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cooperatives_code_key" ON "cooperatives"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cooperatives_cuit_key" ON "cooperatives"("cuit");
