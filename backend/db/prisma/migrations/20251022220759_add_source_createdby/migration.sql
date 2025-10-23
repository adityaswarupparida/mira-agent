/*
  Warnings:

  - Added the required column `created_by` to the `help_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `help_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "help_requests" ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL;
