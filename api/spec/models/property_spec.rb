# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Property, type: :model do
  describe 'associations' do
    it 'has many property_images, property_events, and watch_lists' do
      property = create(:property)
      image1 = create(:property_image, property: property)
      image2 = create(:property_image, property: property)
      event1 = create(:property_event, property: property)
      event2 = create(:property_event, property: property)
      watchlist1 = create(:watch_list, property: property)
      watchlist2 = create(:watch_list, property: property)

      expect(property.property_images).to include(image1, image2)
      expect(property.property_events).to include(event1, event2)
      expect(property.watch_lists).to include(watchlist1, watchlist2)
    end

    it 'has many watchers through watch_lists' do
      user1 = create(:user)
      user2 = create(:user)
      property = create(:property)
      create(:watch_list, user: user1, property: property)
      create(:watch_list, user: user2, property: property)

      expect(property.watchers).to include(user1, user2)
    end

    it 'destroys associated records when property is destroyed' do
      property = create(:property)
      create(:property_image, property: property)
      create(:property_event, property: property)
      create(:watch_list, property: property)

      expect { property.destroy }.to change { PropertyImage.count }.by(-1)
        .and change { PropertyEvent.count }.by(-1)
        .and change { WatchList.count }.by(-1)
    end
  end

  describe 'scopes' do
    let!(:house1) { create(:property, property_type: 'house', bedrooms: 3, price: 500_000) }
    let!(:house2) { create(:property, property_type: 'house', bedrooms: 4, price: 700_000) }
    let!(:apartment) { create(:property, property_type: 'apartment', bedrooms: 2, price: 300_000) }

    describe '.property_type' do
      it 'filters by property type' do
        results = Property.property_type('house')
        expect(results).to include(house1, house2)
        expect(results).not_to include(apartment)
      end

      it 'returns all properties when type is nil' do
        results = Property.property_type(nil)
        expect(results.count).to eq(3)
      end
    end

    describe '.bedrooms_between' do
      it 'filters by min and max bedrooms' do
        results = Property.bedrooms_between(3, 4)
        expect(results).to include(house1, house2)
        expect(results).not_to include(apartment)
      end

      it 'filters by min bedrooms only' do
        results = Property.bedrooms_between(3, nil)
        expect(results).to include(house1, house2)
        expect(results).not_to include(apartment)
      end

      it 'filters by max bedrooms only' do
        results = Property.bedrooms_between(nil, 3)
        expect(results).to include(house1, apartment)
        expect(results).not_to include(house2)
      end
    end

    describe '.price_between' do
      it 'filters by min and max price' do
        results = Property.price_between(400_000, 600_000)
        expect(results).to include(house1)
        expect(results).not_to include(house2, apartment)
      end

      it 'filters by min price only' do
        results = Property.price_between(500_000, nil)
        expect(results).to include(house1, house2)
        expect(results).not_to include(apartment)
      end

      it 'filters by max price only' do
        results = Property.price_between(nil, 500_000)
        expect(results).to include(house1, apartment)
        expect(results).not_to include(house2)
      end
    end
  end

  describe '#formatted_price' do
    it 'formats price with delimiters and dollar sign' do
      property = create(:property, price: 1_650_000)
      expect(property.formatted_price).to eq('$1,650,000')
    end
  end
end

