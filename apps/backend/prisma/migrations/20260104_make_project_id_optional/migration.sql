-- AlterTable
-- Make projectId optional in execution_batches table
ALTER TABLE "execution_batches" ALTER COLUMN "project_id" DROP NOT NULL;
