# frozen_string_literal: true

module ControllerHelpers
  def mock_user_find_by(email:, user: nil)
    allow(User).to receive(:find_by).with(hash_including(email: email.downcase)).and_return(user)
  end

  def mock_property_find(id:, property:)
    allow(Property).to receive(:find).with(id.to_s).and_return(property)
    allow(Property).to receive(:find).with(id).and_return(property)
  end

  def mock_property_where(properties:)
    relation = mock_active_record_relation(properties)
    allow(Property).to receive(:where).and_return(relation)
    relation
  end

  def mock_property_includes(properties:)
    relation = mock_active_record_relation(properties)
    allow(Property).to receive(:includes).and_return(relation)
    relation
  end

  def mock_property_scope_chain(properties:, scopes: {})
    relation = mock_active_record_relation(properties)
    allow(Property).to receive(:includes).and_return(relation)
    allow(relation).to receive(:order).and_return(relation)
    
    scopes.each do |scope_name, args|
      allow(relation).to receive(scope_name).with(*args).and_return(relation)
    end
    
    allow(relation).to receive(:where).and_return(relation)
    relation
  end

  def mock_as_json(object, json_hash)
    # Return a mutable copy so controllers can modify it
    # Use with_indifferent_access to allow both symbol and string keys
    mutable_hash = json_hash.dup.with_indifferent_access
    allow(object).to receive(:as_json).and_return(mutable_hash.dup)
    allow(object).to receive(:as_json).with(any_args).and_return(mutable_hash.dup)
  end

  def mock_pagy(relation, items:, page: 1)
    pagy = double('Pagy')
    allow(pagy).to receive(:page).and_return(page)
    allow(pagy).to receive(:items).and_return(items)
    allow(pagy).to receive(:count).and_return(relation.to_a.length)
    allow(pagy).to receive(:offset).and_return((page - 1) * items)
    allow(pagy).to receive(:from).and_return((page - 1) * items + 1)
    allow(pagy).to receive(:to).and_return([page * items, relation.to_a.length].min)
    allow(pagy).to receive(:prev).and_return(page > 1 ? page - 1 : nil)
    allow(pagy).to receive(:next).and_return(nil)
    allow(pagy).to receive(:last).and_return(1)
    allow(pagy).to receive(:vars).and_return({})
    properties = relation.to_a
    allow(Pagy).to receive(:new).and_return(pagy)
    [pagy, properties]
  end

  def mock_property_index_chain(properties:, filters: {}, cursor: nil, limit: 25)
    limited_properties = properties.first(limit)
    relation = mock_active_record_relation(limited_properties)
    
    # Mock the chain: Property.includes(:property_images).order(:id)
    base_relation = double('ActiveRecord::Relation')
    allow(Property).to receive(:includes).with(:property_images).and_return(base_relation)
    allow(base_relation).to receive(:order).with(:id).and_return(relation)
    
    # Mock scopes
    if filters[:property_type]
      allow(relation).to receive(:property_type).with(filters[:property_type]).and_return(relation)
    else
      allow(relation).to receive(:property_type).with(nil).and_return(relation)
    end
    
    # Mock between_bedrooms - controller passes params as strings
    if filters[:min_bedrooms] || filters[:max_bedrooms]
      min_bed = filters[:min_bedrooms]&.to_s
      max_bed = filters[:max_bedrooms]&.to_s
      allow(relation).to receive(:between_bedrooms).with(min_bed, max_bed).and_return(relation)
      allow(relation).to receive(:between_bedrooms).with(filters[:min_bedrooms], filters[:max_bedrooms]).and_return(relation)
    else
      allow(relation).to receive(:between_bedrooms).with(nil, nil).and_return(relation)
    end
    
    # Mock between_price - controller passes params as strings
    if filters[:min_price] || filters[:max_price]
      min_price = filters[:min_price]&.to_s
      max_price = filters[:max_price]&.to_s
      allow(relation).to receive(:between_price).with(min_price, max_price).and_return(relation)
      allow(relation).to receive(:between_price).with(filters[:min_price], filters[:max_price]).and_return(relation)
    else
      allow(relation).to receive(:between_price).with(nil, nil).and_return(relation)
    end
    
    # Mock cursor filtering
    if cursor
      allow(relation).to receive(:where).with('id > ?', cursor).and_return(relation)
    end
    
    # Mock pagy - it returns [pagy_instance, records_array]
    pagy = double('Pagy')
    allow(pagy).to receive(:page).and_return(1)
    allow(pagy).to receive(:items).and_return(limit)
    allow(pagy).to receive(:count).and_return(limited_properties.length)
    allow(pagy).to receive(:offset).and_return(0)
    allow(pagy).to receive(:from).and_return(1)
    allow(pagy).to receive(:to).and_return([limit, limited_properties.length].min)
    allow(pagy).to receive(:prev).and_return(nil)
    allow(pagy).to receive(:next).and_return(nil)
    allow(pagy).to receive(:last).and_return(1)
    allow(pagy).to receive(:vars).and_return({})
    
    # Stub the pagy method on controllers to return [pagy, records]
    allow_any_instance_of(Api::V1::PropertiesController).to receive(:pagy).and_return([pagy, limited_properties])
    
    # Mock exists? for next_cursor
    if limited_properties.length == limit && limited_properties.any?
      allow(relation).to receive(:exists?).with(['id > ?', limited_properties.last.id]).and_return(true)
    else
      allow(relation).to receive(:exists?).and_return(false)
    end
    
    relation
  end

  def mock_user_new(user:, valid: true)
    errors = double('ActiveModel::Errors')
    allow(errors).to receive(:full_messages).and_return([])
    allow(errors).to receive(:[]).and_return([])
    allow(errors).to receive(:empty?).and_return(valid)
    allow(errors).to receive(:present?).and_return(!valid)
    allow(errors).to receive(:any?).and_return(!valid)
    
    allow(user).to receive(:errors).and_return(errors)
    allow(user).to receive(:save).and_return(valid)
    allow(user).to receive(:valid?).and_return(valid)
    allow(User).to receive(:new).and_return(user)
    user
  end

  def mock_user_errors(user, errors_hash)
    errors = double('ActiveModel::Errors')
    allow(errors).to receive(:full_messages).and_return(errors_hash.values.flatten)
    allow(errors).to receive(:[]) do |key|
      errors_hash[key.to_sym] || []
    end
    allow(errors).to receive(:empty?).and_return(errors_hash.empty?)
    allow(errors).to receive(:present?).and_return(!errors_hash.empty?)
    allow(errors).to receive(:any?).and_return(!errors_hash.empty?)
    # Make errors respond to as_json/to_json to return the errors hash
    allow(errors).to receive(:as_json).and_return(errors_hash.stringify_keys)
    allow(errors).to receive(:to_json).and_return(errors_hash.stringify_keys.to_json)
    allow(user).to receive(:errors).and_return(errors)
    errors
  end

  def mock_property_with_images(property, images: [])
    allow(property).to receive(:property_images).and_return(images)
    formatted_price = "$#{ActiveSupport::NumberHelper.number_to_delimited(property.price || 0)}"
    property_json = {
      'id' => property.id.to_s,  # Convert to string to match JSON API format
      'title' => property.title,
      'description' => property.description,
      'price' => property.price,
      'bedrooms' => property.bedrooms,
      'property_type' => property.property_type,
      'status' => property.status,
      'latitude' => property.latitude,
      'longitude' => property.longitude,
      'published_at' => property.published_at&.iso8601,
      'formatted_price' => formatted_price,
      'property_images' => images.map { |img| { 'id' => img.id, 'url' => img.url, 'position' => img.position } }
    }
    # Use with_indifferent_access and ensure it's mutable
    mutable_hash = property_json.dup.with_indifferent_access
    allow(property).to receive(:as_json).and_return(mutable_hash.dup)
    allow(property).to receive(:as_json).with(any_args).and_return(mutable_hash.dup)
    property
  end

  def mock_watchlist_chain(user, watchlists: [])
    relation = double('ActiveRecord::Relation')
    allow(user).to receive(:watch_lists).and_return(relation)
    allow(relation).to receive(:includes).with(:property, property: :property_images).and_return(relation)
    # Make the relation respond to map by executing the block on each watchlist
    allow(relation).to receive(:map) do |&block|
      if block
        watchlists.map(&block)
      else
        watchlists
      end
    end
    allow(relation).to receive(:each).and_yield(*watchlists) if watchlists.any?
    allow(relation).to receive(:to_a).and_return(watchlists)
    allow(relation).to receive(:find_by).and_return(nil)
    allow(relation).to receive(:build).and_return(build_mock_watch_list)
    allow(relation).to receive(:find).and_return(watchlists.first) if watchlists.any?
    allow(relation).to receive(:count).and_return(watchlists.length)
    allow(relation).to receive(:length).and_return(watchlists.length)
    allow(relation).to receive(:empty?).and_return(watchlists.empty?)
    relation
  end
end

RSpec.configure do |config|
  config.include ControllerHelpers, type: :request
end

