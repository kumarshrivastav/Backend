/*
  Warnings:

  - You are about to drop the column `created_At` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `updated_At` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `created_At` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_At` on the `Users` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `News` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "News" RENAME COLUMN "created_At" TO "createdAt";
ALTER TABLE "News" RENAME COLUMN "updated_At" TO "updatedAt";


-- AlterTable
ALTER TABLE "Users" RENAME COLUMN "created_At" TO "createdAt";
ALTER TABLE "Users" RENAME COLUMN "updated_At" TO "updatedAt";