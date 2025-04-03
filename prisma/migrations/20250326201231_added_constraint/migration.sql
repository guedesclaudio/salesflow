/*
  Warnings:

  - A unique constraint covering the columns `[sale_date,authorization_code,sale_status]` on the table `sales` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "sales_sale_date_authorization_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "sales_sale_date_authorization_code_sale_status_key" ON "sales"("sale_date", "authorization_code", "sale_status");
