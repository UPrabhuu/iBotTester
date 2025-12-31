-- AlterTable
ALTER TABLE "chat_conversations" ADD COLUMN     "branch_id" TEXT,
ADD COLUMN     "project_id" TEXT;

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "metadata" TEXT;
