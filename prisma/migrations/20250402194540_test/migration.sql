/*
  Warnings:

  - You are about to alter the column `value` on the `sales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - Made the column `webhook` on table `sales` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "sales" ALTER COLUMN "value" SET DATA TYPE INTEGER,
ALTER COLUMN "webhook" SET NOT NULL;
