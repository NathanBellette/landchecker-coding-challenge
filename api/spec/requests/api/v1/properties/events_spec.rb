# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Properties::Events', type: :request do
  describe 'GET /api/v1/properties/:property_id/property_events' do
    let!(:property) { create(:property) }

    it 'returns property events ordered by created_at descending' do
      older = create(:property_event, property: property, created_at: 3.days.ago, event_type: 'price_changed', data: { old_price: 450_000, new_price: 500_000 })
      newer = create(:property_event, property: property, created_at: 1.day.ago, event_type: 'sold', data: { sold_price: 500_000, sold_date: 1.day.ago.iso8601 })

      get "/api/v1/properties/#{property.id}/property_events"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['events'].length).to eq(2)
      expect(json['count']).to eq(2)
      expect(json['events'].first['id']).to eq(newer.id)
      expect(json['events'].last['id']).to eq(older.id)
      expect { Time.iso8601(json['events'].first['created_at']) }.not_to raise_error
    end

    it 'returns empty array when property has no events' do
      get "/api/v1/properties/#{property.id}/property_events"

      json = JSON.parse(response.body)
      expect(json['events']).to eq([])
      expect(json['count']).to eq(0)
    end

    it 'returns 404 for non-existent property' do
      get '/api/v1/properties/99999/property_events'

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json).to have_key('error')
    end
  end
end

