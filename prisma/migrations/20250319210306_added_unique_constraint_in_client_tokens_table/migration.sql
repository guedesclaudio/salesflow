/*
  Warnings:

  - A unique constraint covering the columns `[access_token]` on the table `client_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "client_tokens_access_token_key" ON "client_tokens"("access_token");
