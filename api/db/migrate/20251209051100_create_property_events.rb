# frozen_string_literal: true

class CreatePropertyEvents < ActiveRecord::Migration[7.0]
  def change
    create_table :property_events do |t|
      t.references :property, null: false, foreign_key: true
      t.string :event_type
      t.jsonb :data

      t.timestamps
    end
  end
end
