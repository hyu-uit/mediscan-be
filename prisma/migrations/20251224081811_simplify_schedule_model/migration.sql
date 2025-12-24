/*
  Warnings:

  - You are about to drop the column `custom_time` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `time_slot` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `time` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "schedules_medication_id_time_slot_key";

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "custom_time",
DROP COLUMN "time_slot",
ADD COLUMN     "time" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
