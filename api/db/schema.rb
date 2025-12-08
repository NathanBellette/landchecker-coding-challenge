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

ActiveRecord::Schema[7.0].define(version: 2025_12_12_000000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "properties", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.integer "price"
    t.integer "bedrooms"
    t.string "property_type"
    t.string "status"
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bedrooms"], name: "index_properties_on_bedrooms"
    t.index ["price"], name: "index_properties_on_price"
    t.index ["property_type"], name: "index_properties_on_property_type"
    t.index ["status"], name: "index_properties_on_status"
  end

  create_table "property_events", force: :cascade do |t|
    t.bigint "property_id", null: false
    t.string "event_type"
    t.jsonb "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_type"], name: "index_property_events_on_event_type"
    t.index ["property_id", "created_at"], name: "index_property_events_on_property_id_and_created_at", order: { created_at: :desc }
    t.index ["property_id"], name: "index_property_events_on_property_id"
  end

  create_table "property_images", force: :cascade do |t|
    t.bigint "property_id", null: false
    t.string "url"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["property_id", "position"], name: "index_property_images_on_property_id_and_position"
    t.index ["property_id"], name: "index_property_images_on_property_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "watch_lists", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "property_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["property_id"], name: "index_watch_lists_on_property_id"
    t.index ["user_id", "property_id"], name: "index_watch_lists_on_user_id_and_property_id", unique: true
    t.index ["user_id"], name: "index_watch_lists_on_user_id"
  end

  add_foreign_key "property_events", "properties"
  add_foreign_key "property_images", "properties"
  add_foreign_key "watch_lists", "properties"
  add_foreign_key "watch_lists", "users"
end
