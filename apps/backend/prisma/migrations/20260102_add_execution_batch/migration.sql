-- CreateTable execution_batches
CREATE TABLE "execution_batches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "conversation_id" TEXT,
    "batch_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "total_tests" INTEGER NOT NULL DEFAULT 0,
    "completed_tests" INTEGER NOT NULL DEFAULT 0,
    "passed_tests" INTEGER NOT NULL DEFAULT 0,
    "failed_tests" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration" INTEGER,
    "batch_metadata_json" JSONB,

    CONSTRAINT "execution_batches_pkey" PRIMARY KEY ("id")
);

-- AddColumn to executions
ALTER TABLE "executions" ADD COLUMN "batch_id" TEXT;
ALTER TABLE "executions" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "executions" ADD COLUMN "execution_metadata_json" JSONB;

-- CreateIndex
CREATE INDEX "execution_batches_user_id_idx" ON "execution_batches"("user_id");
CREATE INDEX "execution_batches_project_id_idx" ON "execution_batches"("project_id");
CREATE INDEX "execution_batches_status_idx" ON "execution_batches"("status");
CREATE INDEX "execution_batches_started_at_idx" ON "execution_batches"("started_at");
CREATE INDEX "executions_batch_id_idx" ON "executions"("batch_id");

-- AddForeignKey
ALTER TABLE "executions" ADD CONSTRAINT "executions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "execution_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
