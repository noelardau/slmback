-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COLLECTIF', 'ADMIN');

-- AlterTable
ALTER TABLE "collectif" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'COLLECTIF';
