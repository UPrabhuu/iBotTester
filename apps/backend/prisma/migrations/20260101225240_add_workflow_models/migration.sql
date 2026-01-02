-- CreateTable
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT,
    "parsed_intent_id" TEXT,
    "user_prompt" TEXT NOT NULL,
    "url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "total_time" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_activities" (
    "id" TEXT NOT NULL,
    "workflow_execution_id" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "data_json" JSONB,
    "duration" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "workflow_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discovered_page_snapshots" (
    "id" TEXT NOT NULL,
    "workflow_activity_id" TEXT NOT NULL,
    "project_id" TEXT,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "viewport_json" JSONB,
    "elements_json" JSONB NOT NULL,
    "metadata_json" JSONB,
    "screenshots_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discovered_page_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_test_models" (
    "id" TEXT NOT NULL,
    "workflow_activity_id" TEXT NOT NULL,
    "project_id" TEXT,
    "model_version" TEXT NOT NULL DEFAULT '1.0.0',
    "model_json" JSONB NOT NULL,
    "test_case_count" INTEGER NOT NULL DEFAULT 0,
    "total_steps" INTEGER NOT NULL DEFAULT 0,
    "configuration_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_test_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflow_executions_user_id_idx" ON "workflow_executions"("user_id");

-- CreateIndex
CREATE INDEX "workflow_executions_project_id_idx" ON "workflow_executions"("project_id");

-- CreateIndex
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions"("status");

-- CreateIndex
CREATE INDEX "workflow_executions_created_at_idx" ON "workflow_executions"("created_at");

-- CreateIndex
CREATE INDEX "workflow_activities_workflow_execution_id_idx" ON "workflow_activities"("workflow_execution_id");

-- CreateIndex
CREATE INDEX "workflow_activities_activity_type_idx" ON "workflow_activities"("activity_type");

-- CreateIndex
CREATE INDEX "workflow_activities_status_idx" ON "workflow_activities"("status");

-- CreateIndex
CREATE UNIQUE INDEX "discovered_page_snapshots_workflow_activity_id_key" ON "discovered_page_snapshots"("workflow_activity_id");

-- CreateIndex
CREATE INDEX "discovered_page_snapshots_project_id_idx" ON "discovered_page_snapshots"("project_id");

-- CreateIndex
CREATE INDEX "discovered_page_snapshots_url_idx" ON "discovered_page_snapshots"("url");

-- CreateIndex
CREATE INDEX "discovered_page_snapshots_created_at_idx" ON "discovered_page_snapshots"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "generated_test_models_workflow_activity_id_key" ON "generated_test_models"("workflow_activity_id");

-- CreateIndex
CREATE INDEX "generated_test_models_project_id_idx" ON "generated_test_models"("project_id");

-- CreateIndex
CREATE INDEX "generated_test_models_created_at_idx" ON "generated_test_models"("created_at");

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_parsed_intent_id_fkey" FOREIGN KEY ("parsed_intent_id") REFERENCES "parsed_intents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_activities" ADD CONSTRAINT "workflow_activities_workflow_execution_id_fkey" FOREIGN KEY ("workflow_execution_id") REFERENCES "workflow_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discovered_page_snapshots" ADD CONSTRAINT "discovered_page_snapshots_workflow_activity_id_fkey" FOREIGN KEY ("workflow_activity_id") REFERENCES "workflow_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_test_models" ADD CONSTRAINT "generated_test_models_workflow_activity_id_fkey" FOREIGN KEY ("workflow_activity_id") REFERENCES "workflow_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
