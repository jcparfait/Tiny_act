# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_12_124539) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "activities", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "activity_type", default: "standard", null: false
    t.text "content"
    t.datetime "created_at", null: false
    t.text "description"
    t.bigint "duration_id", null: false
    t.jsonb "execution_plan", default: {}, null: false
    t.bigint "interest_id", null: false
    t.bigint "location_id", null: false
    t.bigint "mood_id", null: false
    t.string "name"
    t.integer "preparation_seconds", default: 30, null: false
    t.text "steps"
    t.datetime "updated_at", null: false
    t.index ["duration_id"], name: "index_activities_on_duration_id"
    t.index ["interest_id"], name: "index_activities_on_interest_id"
    t.index ["location_id"], name: "index_activities_on_location_id"
    t.index ["mood_id"], name: "index_activities_on_mood_id"
  end

  create_table "activity_sessions", force: :cascade do |t|
    t.bigint "activity_id", null: false
    t.jsonb "candidate_activity_ids", default: [], null: false
    t.datetime "created_at", null: false
    t.date "date"
    t.integer "elapsed_seconds", default: 0, null: false
    t.boolean "finished", default: false, null: false
    t.datetime "furniture_unlocks_seen_at"
    t.string "language"
    t.jsonb "newly_unlocked_furniture_ids", default: [], null: false
    t.jsonb "progress_data", default: {}, null: false
    t.integer "rating"
    t.string "status", default: "selecting", null: false
    t.datetime "timer_started_at"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.datetime "xp_awarded_at"
    t.integer "xp_earned", default: 0, null: false
    t.index ["activity_id"], name: "index_activity_sessions_on_activity_id"
    t.index ["status"], name: "index_activity_sessions_on_status"
    t.index ["user_id"], name: "index_activity_sessions_on_user_id"
  end

  create_table "code_questions", force: :cascade do |t|
    t.string "category", null: false
    t.string "correct_answer", null: false
    t.datetime "created_at", null: false
    t.string "difficulty", null: false
    t.string "family"
    t.string "question", null: false
    t.string "source"
    t.string "topic"
    t.datetime "updated_at", null: false
    t.string "wrong_answer_1", null: false
    t.string "wrong_answer_2", null: false
    t.string "wrong_answer_3", null: false
    t.index ["difficulty"], name: "index_code_questions_on_difficulty"
    t.index ["family"], name: "index_code_questions_on_family"
    t.index ["question"], name: "index_code_questions_on_question", unique: true
  end

  create_table "culture_questions", force: :cascade do |t|
    t.string "category"
    t.string "correct_answer"
    t.datetime "created_at", null: false
    t.string "difficulty"
    t.text "question"
    t.string "source"
    t.datetime "updated_at", null: false
    t.string "wrong_answer_1"
    t.string "wrong_answer_2"
    t.string "wrong_answer_3"
  end

  create_table "durations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "value"
  end

  create_table "furnitures", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "height"
    t.string "image_url"
    t.bigint "interest_id", null: false
    t.string "name"
    t.integer "required_xp"
    t.datetime "updated_at", null: false
    t.integer "width"
    t.index ["interest_id"], name: "index_furnitures_on_interest_id"
  end

  create_table "interests", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "language_items", force: :cascade do |t|
    t.string "answer"
    t.datetime "created_at", null: false
    t.string "item_type"
    t.string "language"
    t.text "prompt"
    t.text "translation"
    t.datetime "updated_at", null: false
  end

  create_table "locations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "melodies", force: :cascade do |t|
    t.string "category", null: false
    t.datetime "created_at", null: false
    t.string "difficulty", null: false
    t.string "family"
    t.string "name", null: false
    t.jsonb "notes", default: [], null: false
    t.string "source"
    t.string "topic"
    t.datetime "updated_at", null: false
    t.index ["difficulty"], name: "index_melodies_on_difficulty"
    t.index ["family"], name: "index_melodies_on_family"
    t.index ["name"], name: "index_melodies_on_name", unique: true
  end

  create_table "mobile_oauth_codes", force: :cascade do |t|
    t.string "code_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "used_at"
    t.bigint "user_id", null: false
    t.index ["code_digest"], name: "index_mobile_oauth_codes_on_code_digest", unique: true
    t.index ["user_id"], name: "index_mobile_oauth_codes_on_user_id"
  end

  create_table "moods", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "oauth_identities", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "provider", null: false
    t.string "uid", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["provider", "uid"], name: "index_oauth_identities_on_provider_and_uid", unique: true
    t.index ["user_id"], name: "index_oauth_identities_on_user_id"
  end

  create_table "room_furnitures", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "furniture_id", null: false
    t.bigint "room_id", null: false
    t.integer "rotation"
    t.datetime "updated_at", null: false
    t.integer "x"
    t.integer "y"
    t.integer "z"
    t.index ["furniture_id"], name: "index_room_furnitures_on_furniture_id"
    t.index ["room_id"], name: "index_room_furnitures_on_room_id"
  end

  create_table "room_likes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "room_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["room_id"], name: "index_room_likes_on_room_id"
    t.index ["user_id"], name: "index_room_likes_on_user_id"
  end

  create_table "rooms", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "height"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.integer "width"
    t.index ["user_id"], name: "index_rooms_on_user_id"
  end

  create_table "solid_cable_messages", force: :cascade do |t|
    t.binary "channel", null: false
    t.bigint "channel_hash", null: false
    t.datetime "created_at", null: false
    t.binary "payload", null: false
    t.index ["channel"], name: "index_solid_cable_messages_on_channel"
    t.index ["channel_hash"], name: "index_solid_cable_messages_on_channel_hash"
    t.index ["created_at"], name: "index_solid_cable_messages_on_created_at"
  end

  create_table "solid_cache_entries", force: :cascade do |t|
    t.integer "byte_size", null: false
    t.datetime "created_at", null: false
    t.binary "key", null: false
    t.bigint "key_hash", null: false
    t.binary "value", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.string "concurrency_key", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error"
    t.bigint "job_id", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "active_job_id"
    t.text "arguments"
    t.string "class_name", null: false
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "finished_at"
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at"
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "queue_name", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "hostname"
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.text "metadata"
    t.string "name", null: false
    t.integer "pid", null: false
    t.bigint "supervisor_id"
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.datetime "run_at", null: false
    t.string "task_key", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.text "arguments"
    t.string "class_name"
    t.string "command", limit: 2048
    t.datetime "created_at", null: false
    t.text "description"
    t.string "key", null: false
    t.integer "priority", default: 0
    t.string "queue_name"
    t.string "schedule", null: false
    t.boolean "static", default: true, null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.integer "value", default: 1, null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "user_interest_progresses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "interest_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.integer "xp"
    t.index ["interest_id"], name: "index_user_interest_progresses_on_interest_id"
    t.index ["user_id"], name: "index_user_interest_progresses_on_user_id"
  end

  create_table "user_interests", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "interest_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["interest_id"], name: "index_user_interests_on_interest_id"
    t.index ["user_id", "interest_id"], name: "index_user_interests_on_user_id_and_interest_id", unique: true
    t.index ["user_id"], name: "index_user_interests_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name"
    t.string "last_name"
    t.string "mobile_api_token_digest"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["mobile_api_token_digest"], name: "index_users_on_mobile_api_token_digest", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "activities", "durations"
  add_foreign_key "activities", "interests"
  add_foreign_key "activities", "locations"
  add_foreign_key "activities", "moods"
  add_foreign_key "activity_sessions", "activities"
  add_foreign_key "activity_sessions", "users"
  add_foreign_key "furnitures", "interests"
  add_foreign_key "mobile_oauth_codes", "users"
  add_foreign_key "oauth_identities", "users"
  add_foreign_key "room_furnitures", "furnitures"
  add_foreign_key "room_furnitures", "rooms"
  add_foreign_key "room_likes", "rooms"
  add_foreign_key "room_likes", "users"
  add_foreign_key "rooms", "users"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "user_interest_progresses", "interests"
  add_foreign_key "user_interest_progresses", "users"
  add_foreign_key "user_interests", "interests"
  add_foreign_key "user_interests", "users"
end
