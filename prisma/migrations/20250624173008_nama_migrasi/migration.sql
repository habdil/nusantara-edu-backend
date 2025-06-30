-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('admin', 'principal', 'teacher', 'school_admin_staff', 'education_department');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'excused', 'sick', 'unexcused');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('ongoing', 'completed', 'overdue', 'canceled');

-- CreateEnum
CREATE TYPE "ConditionStatus" AS ENUM ('good', 'minor_damage', 'major_damage', 'under_repair');

-- CreateEnum
CREATE TYPE "WarningCategory" AS ENUM ('attendance', 'academic', 'financial', 'asset', 'teacher', 'deadline', 'system');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRoles" NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT,
    "profile_picture" TEXT,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" SERIAL NOT NULL,
    "npsn" TEXT NOT NULL,
    "school_name" TEXT NOT NULL,
    "full_address" TEXT NOT NULL,
    "postal_code" TEXT,
    "phone_number" TEXT,
    "email" TEXT,
    "website" TEXT,
    "principal_id" INTEGER,
    "total_students" INTEGER,
    "total_teachers" INTEGER,
    "total_staff" INTEGER,
    "established_year" INTEGER,
    "accreditation" TEXT,
    "logo_url" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" SERIAL NOT NULL,
    "employee_id" TEXT,
    "full_name" TEXT NOT NULL,
    "school_id" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "birth_date" DATE,
    "address" TEXT,
    "email" TEXT,
    "phone_number" TEXT,
    "subject_area" TEXT NOT NULL,
    "position" TEXT,
    "employment_status" TEXT,
    "education_level" TEXT,
    "teaching_start_year" INTEGER,
    "profile_photo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "national_student_id" TEXT,
    "full_name" TEXT NOT NULL,
    "school_id" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birth_date" DATE,
    "address" TEXT,
    "parent_name" TEXT,
    "parent_contact" TEXT,
    "student_photo" TEXT,
    "enrollment_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" SERIAL NOT NULL,
    "subject_code" TEXT NOT NULL,
    "subject_name" TEXT NOT NULL,
    "description" TEXT,
    "grade_level" TEXT NOT NULL,
    "weekly_hours" INTEGER,
    "curriculum" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_records" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "semester" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "knowledge_score" DECIMAL(65,30),
    "skill_score" DECIMAL(65,30),
    "attitude_score" TEXT,
    "midterm_exam_score" DECIMAL(65,30),
    "final_exam_score" DECIMAL(65,30),
    "final_score" DECIMAL(65,30),
    "teacher_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "academic_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basic_competencies" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "competency_code" TEXT NOT NULL,
    "competency_description" TEXT NOT NULL,
    "difficulty_level" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "basic_competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_achievements" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "basic_competency_id" INTEGER NOT NULL,
    "semester" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "score" DECIMAL(65,30),
    "is_achieved" BOOLEAN,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "competency_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_attendance" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "check_in_time" TIME,
    "check_out_time" TIME,
    "notes" TEXT,
    "recorded_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "student_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_attendance" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "check_in_time" TIME,
    "check_out_time" TIME,
    "notes" TEXT,
    "recorded_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "teacher_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_performance" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "evaluation_period" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "discipline_score" DECIMAL(65,30),
    "teaching_score" DECIMAL(65,30),
    "self_development_score" DECIMAL(65,30),
    "contribution_score" DECIMAL(65,30),
    "total_score" DECIMAL(65,30),
    "evaluation_notes" TEXT,
    "evaluator_id" INTEGER,
    "evaluation_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "teacher_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_performance_details" (
    "id" SERIAL NOT NULL,
    "teacher_performance_id" INTEGER NOT NULL,
    "assessment_category" TEXT NOT NULL,
    "indicator" TEXT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "notes" TEXT,
    "supporting_evidence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "teacher_performance_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_developments" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "development_type" TEXT NOT NULL,
    "activity_name" TEXT NOT NULL,
    "organizer" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "total_hours" INTEGER,
    "certificate" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "teacher_developments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_finances" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "budget_year" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "budget_category" TEXT NOT NULL,
    "budget_amount" DECIMAL(65,30) NOT NULL,
    "used_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remaining_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "approval_status" BOOLEAN,
    "approved_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "school_finances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_transactions" (
    "id" SERIAL NOT NULL,
    "school_finance_id" INTEGER NOT NULL,
    "transaction_date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "transaction_category" TEXT,
    "transaction_proof" TEXT,
    "recorded_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "asset_code" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "asset_category" TEXT NOT NULL,
    "acquisition_date" DATE,
    "acquisition_value" DECIMAL(65,30),
    "useful_life" INTEGER,
    "condition" "ConditionStatus" NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "qr_code" TEXT,
    "asset_photo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_maintenance" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "maintenance_date" DATE NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "description" TEXT,
    "cost" DECIMAL(65,30),
    "technician" TEXT,
    "maintenance_result" TEXT,
    "next_maintenance_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "asset_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "facility_name" TEXT NOT NULL,
    "facility_type" TEXT NOT NULL,
    "capacity" INTEGER,
    "location" TEXT,
    "condition" "ConditionStatus",
    "notes" TEXT,
    "facility_photo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_usage" (
    "id" SERIAL NOT NULL,
    "facility_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "purpose" TEXT NOT NULL,
    "user_id" INTEGER,
    "approval_status" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "facility_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_kpis" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "academic_year" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "kpi_category" TEXT NOT NULL,
    "kpi_name" TEXT NOT NULL,
    "target_value" DECIMAL(65,30),
    "achieved_value" DECIMAL(65,30),
    "achievement_percentage" DECIMAL(65,30),
    "trend" TEXT,
    "priority" INTEGER,
    "analysis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "school_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "early_warnings" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "category" "WarningCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "urgency_level" "UrgencyLevel" NOT NULL,
    "detected_date" DATE NOT NULL,
    "target_value" DECIMAL(65,30),
    "actual_value" DECIMAL(65,30),
    "handling_status" TEXT,
    "handled_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "early_warnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "supporting_data" JSONB,
    "confidence_level" DECIMAL(65,30),
    "generated_date" DATE NOT NULL,
    "predicted_impact" TEXT,
    "implementation_status" TEXT,
    "principal_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chat_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "topic_category" TEXT,
    "is_bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chat_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "national_standards" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "standard_name" TEXT NOT NULL,
    "description" TEXT,
    "minimum_value" DECIMAL(65,30),
    "unit" TEXT,
    "grade_level" TEXT,
    "established_year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "national_standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_benchmarks" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "national_standard_id" INTEGER NOT NULL,
    "academic_year" TEXT NOT NULL,
    "school_value" DECIMAL(65,30),
    "district_rank" INTEGER,
    "province_rank" INTEGER,
    "national_rank" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "school_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "report_title" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "report_period" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "file_format" TEXT,
    "file_url" TEXT,
    "created_by" INTEGER,
    "created_date" TIMESTAMP(3),
    "submission_status" TEXT,
    "submission_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "layout_config" JSONB,
    "visible_kpis" JSONB,
    "chart_preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "dashboard_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "school_id" INTEGER,
    "activity" TEXT NOT NULL,
    "description" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "system_module" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "schools_npsn_key" ON "schools"("npsn");

-- CreateIndex
CREATE INDEX "schools_npsn_idx" ON "schools"("npsn");

-- CreateIndex
CREATE INDEX "school_location" ON "schools"("school_name", "full_address");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_employee_id_key" ON "teachers"("employee_id");

-- CreateIndex
CREATE INDEX "teachers_employee_id_idx" ON "teachers"("employee_id");

-- CreateIndex
CREATE INDEX "teacher_school" ON "teachers"("school_id");

-- CreateIndex
CREATE INDEX "teacher_subject" ON "teachers"("subject_area");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_id_key" ON "students"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_national_student_id_key" ON "students"("national_student_id");

-- CreateIndex
CREATE INDEX "students_student_id_idx" ON "students"("student_id");

-- CreateIndex
CREATE INDEX "students_national_student_id_idx" ON "students"("national_student_id");

-- CreateIndex
CREATE INDEX "student_class" ON "students"("school_id", "grade");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_subject_code_key" ON "subjects"("subject_code");

-- CreateIndex
CREATE INDEX "subjects_subject_code_idx" ON "subjects"("subject_code");

-- CreateIndex
CREATE INDEX "subject_grade" ON "subjects"("subject_name", "grade_level");

-- CreateIndex
CREATE UNIQUE INDEX "academic_records_student_id_subject_id_semester_academic_ye_key" ON "academic_records"("student_id", "subject_id", "semester", "academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "basic_competencies_subject_id_competency_code_key" ON "basic_competencies"("subject_id", "competency_code");

-- CreateIndex
CREATE UNIQUE INDEX "competency_achievements_student_id_basic_competency_id_seme_key" ON "competency_achievements"("student_id", "basic_competency_id", "semester", "academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "student_attendance_student_id_date_key" ON "student_attendance"("student_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_attendance_teacher_id_date_key" ON "teacher_attendance"("teacher_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_performance_teacher_id_evaluation_period_academic_y_key" ON "teacher_performance"("teacher_id", "evaluation_period", "academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_performance_details_teacher_performance_id_assessme_key" ON "teacher_performance_details"("teacher_performance_id", "assessment_category", "indicator");

-- CreateIndex
CREATE INDEX "teacher_development_type" ON "teacher_developments"("teacher_id", "development_type");

-- CreateIndex
CREATE UNIQUE INDEX "school_finances_school_id_budget_year_period_budget_categor_key" ON "school_finances"("school_id", "budget_year", "period", "budget_category");

-- CreateIndex
CREATE INDEX "transaction_budget" ON "financial_transactions"("school_finance_id");

-- CreateIndex
CREATE INDEX "transaction_date" ON "financial_transactions"("transaction_date");

-- CreateIndex
CREATE UNIQUE INDEX "assets_asset_code_key" ON "assets"("asset_code");

-- CreateIndex
CREATE INDEX "assets_asset_code_idx" ON "assets"("asset_code");

-- CreateIndex
CREATE INDEX "school_asset_category" ON "assets"("school_id", "asset_category");

-- CreateIndex
CREATE INDEX "asset_maintenance_date" ON "asset_maintenance"("asset_id", "maintenance_date");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_school_id_facility_name_key" ON "facilities"("school_id", "facility_name");

-- CreateIndex
CREATE INDEX "facility_schedule" ON "facility_usage"("facility_id", "date", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "school_kpis_school_id_academic_year_period_kpi_name_key" ON "school_kpis"("school_id", "academic_year", "period", "kpi_name");

-- CreateIndex
CREATE INDEX "school_warning_category" ON "early_warnings"("school_id", "category", "urgency_level");

-- CreateIndex
CREATE INDEX "school_recommendation_category" ON "ai_recommendations"("school_id", "category");

-- CreateIndex
CREATE INDEX "user_school_chat" ON "ai_chat_history"("user_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "national_standards_category_standard_name_key" ON "national_standards"("category", "standard_name");

-- CreateIndex
CREATE UNIQUE INDEX "school_benchmarks_school_id_national_standard_id_academic_y_key" ON "school_benchmarks"("school_id", "national_standard_id", "academic_year");

-- CreateIndex
CREATE INDEX "school_report_period" ON "reports"("school_id", "report_type", "report_period", "academic_year");

-- CreateIndex
CREATE INDEX "user_unread" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_preferences_user_id_school_id_key" ON "dashboard_preferences"("user_id", "school_id");

-- CreateIndex
CREATE INDEX "user_activity" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "school_activity" ON "activity_logs"("school_id");

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_records" ADD CONSTRAINT "academic_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_records" ADD CONSTRAINT "academic_records_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_records" ADD CONSTRAINT "academic_records_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_competencies" ADD CONSTRAINT "basic_competencies_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_achievements" ADD CONSTRAINT "competency_achievements_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_achievements" ADD CONSTRAINT "competency_achievements_basic_competency_id_fkey" FOREIGN KEY ("basic_competency_id") REFERENCES "basic_competencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_attendance" ADD CONSTRAINT "teacher_attendance_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_attendance" ADD CONSTRAINT "teacher_attendance_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_performance" ADD CONSTRAINT "teacher_performance_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_performance" ADD CONSTRAINT "teacher_performance_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_performance_details" ADD CONSTRAINT "teacher_performance_details_teacher_performance_id_fkey" FOREIGN KEY ("teacher_performance_id") REFERENCES "teacher_performance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_developments" ADD CONSTRAINT "teacher_developments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_finances" ADD CONSTRAINT "school_finances_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_finances" ADD CONSTRAINT "school_finances_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_school_finance_id_fkey" FOREIGN KEY ("school_finance_id") REFERENCES "school_finances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenance" ADD CONSTRAINT "asset_maintenance_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_usage" ADD CONSTRAINT "facility_usage_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_usage" ADD CONSTRAINT "facility_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_kpis" ADD CONSTRAINT "school_kpis_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "early_warnings" ADD CONSTRAINT "early_warnings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "early_warnings" ADD CONSTRAINT "early_warnings_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_history" ADD CONSTRAINT "ai_chat_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_history" ADD CONSTRAINT "ai_chat_history_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_benchmarks" ADD CONSTRAINT "school_benchmarks_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_benchmarks" ADD CONSTRAINT "school_benchmarks_national_standard_id_fkey" FOREIGN KEY ("national_standard_id") REFERENCES "national_standards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_preferences" ADD CONSTRAINT "dashboard_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_preferences" ADD CONSTRAINT "dashboard_preferences_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
