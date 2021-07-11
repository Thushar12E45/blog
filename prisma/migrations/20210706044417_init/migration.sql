/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "article" DROP CONSTRAINT "article_authorId_fkey";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "userTable" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userTable.email_unique" ON "userTable"("email");

-- AddForeignKey
ALTER TABLE "article" ADD FOREIGN KEY ("authorId") REFERENCES "userTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
