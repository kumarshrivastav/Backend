/*
  Warnings:

  - You are about to alter the column `content` on the `News` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2000)`.
  - A unique constraint covering the columns `[title]` on the table `News` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "News" DROP CONSTRAINT "News_user_id_fkey";

-- AlterTable
ALTER TABLE "News" ALTER COLUMN "content" SET DATA TYPE VARCHAR(2000),
ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "image" SET DEFAULT 'https://cdn.pixabay.com/photo/2015/02/15/09/33/news-636978_1280.jpg',
ALTER COLUMN "image" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "News_title_key" ON "News"("title");

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
