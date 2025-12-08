# frozen_string_literal: true

module ModelHelpers
  def build_mock_property(attributes = {})
    defaults = {
      id: 1,
      title: 'Test Property',
      description: 'Test Description',
      price: 500_000,
      bedrooms: 3,
      property_type: 'house',
      status: 'available',
      latitude: -37.8136,
      longitude: 144.9631,
      published_at: Time.current,
      property_images: [],
      property_events: [],
      watch_lists: [],
      watchers: []
    }
    double('Property', defaults.merge(attributes))
  end

  def build_mock_user(attributes = {})
    defaults = {
      id: 1,
      email: 'test@example.com',
      password_digest: 'hashed_password',
      watch_lists: []
    }
    user = double('User', defaults.merge(attributes))
    allow(user).to receive(:authenticate).and_return(user) if attributes[:password]
    allow(user).to receive(:authenticate).and_return(false) unless attributes[:password]
    user
  end

  def build_mock_property_image(attributes = {})
    defaults = {
      id: 1,
      url: 'https://example.com/image.jpg',
      position: 1,
      property_id: 1
    }
    double('PropertyImage', defaults.merge(attributes))
  end

  def build_mock_property_event(attributes = {})
    defaults = {
      id: 1,
      event_type: 'price_changed',
      data: {},
      created_at: Time.current,
      property_id: 1
    }
    double('PropertyEvent', defaults.merge(attributes))
  end

  def build_mock_watch_list(attributes = {})
    defaults = {
      id: 1,
      user_id: 1,
      property_id: 1,
      property: build_mock_property,
      user: build_mock_user
    }
    double('WatchList', defaults.merge(attributes))
  end

  def mock_property_scope(scope_name, properties, *args)
    relation = double('ActiveRecord::Relation')
    allow(relation).to receive(:includes).and_return(relation)
    allow(relation).to receive(:order).and_return(relation)
    allow(relation).to receive(:limit).and_return(relation)
    allow(relation).to receive(:offset).and_return(relation)
    allow(relation).to receive(:where).and_return(relation)
    allow(relation).to receive(:exists?).and_return(false)
    allow(relation).to receive(:count).and_return(properties.length)
    allow(relation).to receive(:to_a).and_return(properties)
    allow(relation).to receive(:empty?).and_return(properties.empty?)
    allow(relation).to receive(:any?).and_return(!properties.empty?)
    allow(relation).to receive(:last).and_return(properties.last) if properties.any?
    allow(Property).to receive(scope_name).with(*args).and_return(relation)
    relation
  end

  def mock_active_record_relation(properties = [])
    relation = double('ActiveRecord::Relation')
    allow(relation).to receive(:includes).and_return(relation)
    allow(relation).to receive(:order).and_return(relation)
    allow(relation).to receive(:limit).and_return(relation)
    allow(relation).to receive(:offset).and_return(relation)
    allow(relation).to receive(:where).and_return(relation)
    allow(relation).to receive(:exists?).and_return(false)
    allow(relation).to receive(:count).and_return(properties.length)
    allow(relation).to receive(:to_a).and_return(properties)
    allow(relation).to receive(:empty?).and_return(properties.empty?)
    allow(relation).to receive(:any?).and_return(!properties.empty?)
    allow(relation).to receive(:last).and_return(properties.last) if properties.any?
    relation
  end
end

RSpec.configure do |config|
  config.include ModelHelpers
end

