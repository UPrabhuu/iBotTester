-- CreateTable
CREATE TABLE "parsed_intents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT,
    "prompt" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "url" TEXT,
    "constraints_json" JSONB,
    "expected_outcome" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "ai_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parsed_intents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parsed_intents_user_id_idx" ON "parsed_intents"("user_id");

-- CreateIndex
CREATE INDEX "parsed_intents_project_id_idx" ON "parsed_intents"("project_id");

-- CreateIndex
CREATE INDEX "parsed_intents_created_at_idx" ON "parsed_intents"("created_at");
