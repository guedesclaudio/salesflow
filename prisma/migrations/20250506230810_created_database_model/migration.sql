-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('PENDING', 'PROCESSED', 'ERROR', 'CANCELED', 'WAITING_PAYMENT');

-- CreateTable
CREATE TABLE "client_tokens" (
    "id" SERIAL NOT NULL,
    "client_id" UUID NOT NULL,
    "access_token" TEXT NOT NULL,
    "activity_status" "ActivityStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "client_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "activity_status" "ActivityStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" UUID NOT NULL,
    "authorization_code" VARCHAR(20) NOT NULL,
    "client_id" UUID NOT NULL,
    "sale_status" "SaleStatus" NOT NULL,
    "value" INTEGER NOT NULL,
    "user_code" VARCHAR(11) NOT NULL,
    "sale_date" TIMESTAMP(3) NOT NULL,
    "cancel_sale_date" TIMESTAMP(3),
    "webhook" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "log" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_tokens_access_token_key" ON "client_tokens"("access_token");

-- CreateIndex
CREATE INDEX "idx_client_tokens_access_token" ON "client_tokens"("access_token");

-- CreateIndex
CREATE INDEX "idx_client_tokens_deleted_at" ON "client_tokens"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "clients_code_key" ON "clients"("code");

-- CreateIndex
CREATE INDEX "idx_clients_deleted_at" ON "clients"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_clients_code" ON "clients"("code");

-- CreateIndex
CREATE INDEX "idx_clients_name" ON "clients"("name");

-- CreateIndex
CREATE INDEX "idx_sales_deleted_at" ON "sales"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_sales_user_code" ON "sales"("user_code");

-- CreateIndex
CREATE INDEX "idx_sales_sale_status" ON "sales"("sale_status");

-- CreateIndex
CREATE INDEX "idx_sales_sale_date" ON "sales"("sale_date");

-- CreateIndex
CREATE INDEX "idx_sales_client_id" ON "sales"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_sale_date_authorization_code_sale_status_key" ON "sales"("sale_date", "authorization_code", "sale_status");

-- AddForeignKey
ALTER TABLE "client_tokens" ADD CONSTRAINT "client_tokens_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
