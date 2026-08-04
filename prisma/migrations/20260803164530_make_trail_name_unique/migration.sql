/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Trail` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'EMPLOYEE';

-- AlterTable
ALTER TABLE "Trail" ADD COLUMN     "maxCapacity" INTEGER NOT NULL DEFAULT 500;

-- CreateIndex
CREATE UNIQUE INDEX "Trail_name_key" ON "Trail"("name");
