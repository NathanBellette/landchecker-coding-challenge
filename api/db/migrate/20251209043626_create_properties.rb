# frozen_string_literal: true

class CreateProperties < ActiveRecord::Migration[7.0]
  def change
    create_table :properties do |t|
      t.string :title
      t.text :description
      t.integer :price
      t.integer :bedrooms
      t.string :property_type
      t.string :status
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.datetime :published_at

      t.timestamps
    end
  end
end
