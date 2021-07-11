/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `article` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "article.title_unique" ON "article"("title");
