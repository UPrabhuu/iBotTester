-- CreateTable
CREATE TABLE "execution_snapshots" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "test_case_id" TEXT NOT NULL,
    "snapshot_data" JSONB NOT NULL,
    "self_healing_events" JSONB[],
    "performance_metrics" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execution_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_differences" (
    "id" TEXT NOT NULL,
    "current_snapshot_id" TEXT NOT NULL,
    "previous_snapshot_id" TEXT,
    "difference_type" TEXT NOT NULL,
    "impact_score" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "diff_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flow_differences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_reports" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "report_type" TEXT NOT NULL DEFAULT 'standard',
    "overall_status" TEXT NOT NULL,
    "confidence_score" DOUBLE PRECISION,
    "summary" TEXT NOT NULL,
    "detailed_analysis" TEXT,
    "suggested_fixes" JSONB[],
    "root_cause_analysis" TEXT,
    "actionable_insights" JSONB[],
    "generated_by" TEXT NOT NULL DEFAULT 'ai',
    "ai_model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_evidence" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "step_number" INTEGER,
    "evidence_type" TEXT NOT NULL,
    "file_path" TEXT,
    "content" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execution_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "execution_snapshots_test_case_id_idx" ON "execution_snapshots"("test_case_id");

-- CreateIndex
CREATE INDEX "execution_snapshots_execution_id_idx" ON "execution_snapshots"("execution_id");

-- CreateIndex
CREATE INDEX "execution_snapshots_created_at_idx" ON "execution_snapshots"("created_at");

-- CreateIndex
CREATE INDEX "flow_differences_current_snapshot_id_idx" ON "flow_differences"("current_snapshot_id");

-- CreateIndex
CREATE INDEX "flow_differences_difference_type_idx" ON "flow_differences"("difference_type");

-- CreateIndex
CREATE INDEX "flow_differences_created_at_idx" ON "flow_differences"("created_at");

-- CreateIndex
CREATE INDEX "test_reports_execution_id_idx" ON "test_reports"("execution_id");

-- CreateIndex
CREATE INDEX "test_reports_overall_status_idx" ON "test_reports"("overall_status");

-- CreateIndex
CREATE INDEX "test_reports_created_at_idx" ON "test_reports"("created_at");

-- CreateIndex
CREATE INDEX "execution_evidence_execution_id_idx" ON "execution_evidence"("execution_id");

-- CreateIndex
CREATE INDEX "execution_evidence_evidence_type_idx" ON "execution_evidence"("evidence_type");

-- CreateIndex
CREATE INDEX "execution_evidence_created_at_idx" ON "execution_evidence"("created_at");

-- AddForeignKey
ALTER TABLE "execution_snapshots" ADD CONSTRAINT "execution_snapshots_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "test_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_differences" ADD CONSTRAINT "flow_differences_current_snapshot_id_fkey" FOREIGN KEY ("current_snapshot_id") REFERENCES "execution_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_differences" ADD CONSTRAINT "flow_differences_previous_snapshot_id_fkey" FOREIGN KEY ("previous_snapshot_id") REFERENCES "execution_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
