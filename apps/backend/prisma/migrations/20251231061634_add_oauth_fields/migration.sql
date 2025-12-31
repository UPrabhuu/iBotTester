-- AlterTable
ALTER TABLE "users" ADD COLUMN     "provider" TEXT,
ADD COLUMN     "provider_id" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "users_provider_provider_id_idx" ON "users"("provider", "provider_id");
