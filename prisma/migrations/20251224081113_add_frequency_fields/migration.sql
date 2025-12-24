-- CreateEnum
CREATE TYPE "FrequencyType" AS ENUM ('DAILY', 'INTERVAL', 'SPECIFIC_DAYS');

-- CreateEnum
CREATE TYPE "DosageUnit" AS ENUM ('MG', 'ML', 'IU', 'TABLET', 'CAPSULE', 'DROPS', 'TSP', 'TBSP');

-- CreateEnum
CREATE TYPE "IntervalUnit" AS ENUM ('DAYS', 'WEEKS', 'MONTHS');

-- AlterTable
ALTER TABLE "medications" ADD COLUMN     "frequency_type" "FrequencyType" NOT NULL DEFAULT 'DAILY',
ADD COLUMN     "interval_unit" "IntervalUnit" NOT NULL DEFAULT 'DAYS',
ADD COLUMN     "interval_value" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "selected_days" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "unit" "DosageUnit" NOT NULL DEFAULT 'MG';
