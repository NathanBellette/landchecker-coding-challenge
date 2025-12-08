# frozen_string_literal: true

class AddIndexesForQueryPerformance < ActiveRecord::Migration[7.0]
  def change
    # Properties table indexes for filtering and sorting
    # These columns are used in WHERE clauses and range queries
    add_index :properties, :property_type, name: 'index_properties_on_property_type'
    add_index :properties, :bedrooms, name: 'index_properties_on_bedrooms'
    add_index :properties, :price, name: 'index_properties_on_price'
    add_index :properties, :status, name: 'index_properties_on_status'
    
    # Note: id is already indexed as primary key, but we use it for cursor pagination
    # The existing primary key index is sufficient for order(:id) and where('id > ?', cursor_id)

    # Watch_lists table: composite unique index to prevent duplicates
    add_index :watch_lists, [:user_id, :property_id], 
              unique: true, 
              name: 'index_watch_lists_on_user_id_and_property_id'

    # Property_events table: composite index for efficient event queries per property
    add_index :property_events, [:property_id, :created_at], 
              order: { created_at: :desc },
              name: 'index_property_events_on_property_id_and_created_at'
    
    # Property_events: index on event_type if filtering by type becomes common
    add_index :property_events, :event_type, name: 'index_property_events_on_event_type'

    # Property_images table: composite index for ordering images by position
    # Used in has_many :property_images, -> { order(:position) }
    add_index :property_images, [:property_id, :position], 
              name: 'index_property_images_on_property_id_and_position'
  end
end

