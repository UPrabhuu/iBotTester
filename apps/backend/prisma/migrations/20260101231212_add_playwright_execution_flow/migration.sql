-- CreateTable
CREATE TABLE "playwright_executions" (
    "id" TEXT NOT NULL,
    "test_case_id" TEXT,
    "project_id" TEXT,
    "user_id" TEXT NOT NULL,
    "execution_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration" INTEGER,
    "browser_type" TEXT NOT NULL DEFAULT 'chromium',
    "viewport_json" JSONB,
    "config_json" JSONB,
    "error_message" TEXT,
    "triggered_by" TEXT,
    "execution_type" TEXT NOT NULL DEFAULT 'manual',

    CONSTRAINT "playwright_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_data" (
    "id" TEXT NOT NULL,
    "playwright_execution_id" TEXT NOT NULL,
    "evidence_type" TEXT NOT NULL,
    "step_number" INTEGER,
    "step_description" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_url" TEXT,
    "metadata_json" JSONB,
    "file_size" INTEGER,
    "mime_type" TEXT,

    CONSTRAINT "evidence_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_results" (
    "id" TEXT NOT NULL,
    "playwright_execution_id" TEXT NOT NULL,
    "overall_status" TEXT NOT NULL,
    "validation_type" TEXT NOT NULL DEFAULT 'automated',
    "issues_found" INTEGER NOT NULL DEFAULT 0,
    "issues_json" JSONB,
    "visual_diff_score" DOUBLE PRECISION,
    "visual_diff_url" TEXT,
    "expected_data_json" JSONB,
    "actual_data_json" JSONB,
    "diff_data_json" JSONB,
    "ai_analysis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_reports" (
    "id" TEXT NOT NULL,
    "playwright_execution_id" TEXT NOT NULL,
    "report_type" TEXT NOT NULL DEFAULT 'standard',
    "summary" TEXT NOT NULL,
    "total_steps" INTEGER NOT NULL,
    "passed_steps" INTEGER NOT NULL,
    "failed_steps" INTEGER NOT NULL,
    "skipped_steps" INTEGER NOT NULL,
    "performance_metrics_json" JSONB,
    "coverage_data_json" JSONB,
    "recommendations_json" JSONB,
    "report_data_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execution_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "playwright_executions_test_case_id_idx" ON "playwright_executions"("test_case_id");

-- CreateIndex
CREATE INDEX "playwright_executions_project_id_idx" ON "playwright_executions"("project_id");

-- CreateIndex
CREATE INDEX "playwright_executions_user_id_idx" ON "playwright_executions"("user_id");

-- CreateIndex
CREATE INDEX "playwright_executions_status_idx" ON "playwright_executions"("status");

-- CreateIndex
CREATE INDEX "playwright_executions_started_at_idx" ON "playwright_executions"("started_at");

-- CreateIndex
CREATE INDEX "evidence_data_playwright_execution_id_idx" ON "evidence_data"("playwright_execution_id");

-- CreateIndex
CREATE INDEX "evidence_data_evidence_type_idx" ON "evidence_data"("evidence_type");

-- CreateIndex
CREATE INDEX "evidence_data_step_number_idx" ON "evidence_data"("step_number");

-- CreateIndex
CREATE UNIQUE INDEX "validation_results_playwright_execution_id_key" ON "validation_results"("playwright_execution_id");

-- CreateIndex
CREATE INDEX "validation_results_overall_status_idx" ON "validation_results"("overall_status");

-- CreateIndex
CREATE INDEX "validation_results_created_at_idx" ON "validation_results"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "execution_reports_playwright_execution_id_key" ON "execution_reports"("playwright_execution_id");

-- CreateIndex
CREATE INDEX "execution_reports_report_type_idx" ON "execution_reports"("report_type");

-- CreateIndex
CREATE INDEX "execution_reports_created_at_idx" ON "execution_reports"("created_at");

-- AddForeignKey
ALTER TABLE "evidence_data" ADD CONSTRAINT "evidence_data_playwright_execution_id_fkey" FOREIGN KEY ("playwright_execution_id") REFERENCES "playwright_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_results" ADD CONSTRAINT "validation_results_playwright_execution_id_fkey" FOREIGN KEY ("playwright_execution_id") REFERENCES "playwright_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_reports" ADD CONSTRAINT "execution_reports_playwright_execution_id_fkey" FOREIGN KEY ("playwright_execution_id") REFERENCES "playwright_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
