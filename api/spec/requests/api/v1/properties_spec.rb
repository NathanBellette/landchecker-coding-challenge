# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Properties', type: :request do
  describe 'GET /api/v1/properties' do
    context 'without authentication' do
      it 'returns all properties by default' do
        create_list(:property, 3)

        get '/api/v1/properties'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(3)
      end

      it 'includes property images in response' do
        property = create(:property)
        create(:property_image, property: property, url: 'https://example.com/image1.jpg')

        get '/api/v1/properties'

        json = JSON.parse(response.body)
        prop_json = json['properties'].find { |p| p['id'].to_i == property.id }
        expect(prop_json['property_images']).to be_an(Array)
        expect(prop_json['property_images'].first['url']).to eq('https://example.com/image1.jpg')
      end
    end

    context 'with filters' do
      it 'filters by property_type' do
        create_list(:property, 2, property_type: 'house')
        create(:property, property_type: 'apartment')

        get '/api/v1/properties', params: { property_type: 'house' }

        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(2)
        expect(json['properties'].all? { |p| p['property_type'] == 'house' }).to be true
      end

      it 'filters by min_bedrooms' do
        create(:property, bedrooms: 2)
        create(:property, bedrooms: 3)
        create(:property, bedrooms: 4)

        get '/api/v1/properties', params: { min_bedrooms: 3 }

        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(2)
        expect(json['properties'].all? { |p| p['bedrooms'] >= 3 }).to be true
      end

      it 'filters by max_bedrooms' do
        create(:property, bedrooms: 2)
        create(:property, bedrooms: 3)
        create(:property, bedrooms: 4)

        get '/api/v1/properties', params: { max_bedrooms: 3 }

        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(2)
        expect(json['properties'].all? { |p| p['bedrooms'] <= 3 }).to be true
      end

      it 'filters by min_price' do
        create(:property, price: 300_000)
        create(:property, price: 500_000)
        create(:property, price: 700_000)

        get '/api/v1/properties', params: { min_price: 500_000 }

        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(2)
        expect(json['properties'].all? { |p| p['price'] >= 500_000 }).to be true
      end

      it 'filters by max_price' do
        create(:property, price: 300_000)
        create(:property, price: 500_000)
        create(:property, price: 700_000)

        get '/api/v1/properties', params: { max_price: 500_000 }

        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(2)
        expect(json['properties'].all? { |p| p['price'] <= 500_000 }).to be true
      end

      it 'filters by multiple parameters' do
        matching = create(:property, property_type: 'house', bedrooms: 3, price: 550_000)
        create(:property, property_type: 'house', bedrooms: 4, price: 700_000)
        create(:property, property_type: 'apartment', bedrooms: 2, price: 400_000)

        get '/api/v1/properties', params: {
          property_type: 'house',
          min_bedrooms: 3,
          max_price: 600_000
        }

        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(1)
        expect(json['properties'].first['id'].to_i).to eq(matching.id)
      end
    end

    context 'with pagination' do
      let!(:many_properties) { create_list(:property, 30) }

      it 'returns default limit of 25 properties' do
        get '/api/v1/properties'

        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(25)
        expect(json['metadata']['limit']).to eq(25)
      end

      it 'respects custom limit parameter' do
        get '/api/v1/properties', params: { limit: 10 }

        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(10)
        expect(json['metadata']['limit']).to eq(10)
      end

      it 'enforces maximum limit of 100' do
        get '/api/v1/properties', params: { limit: 200 }

        json = JSON.parse(response.body)
        expect(json['properties'].length).to be <= 100
        expect(json['metadata']['limit']).to eq(100)
      end

      it 'ignores invalid limit values' do
        get '/api/v1/properties', params: { limit: -5 }

        json = JSON.parse(response.body)
        expect(json['metadata']['limit']).to eq(25)
      end

      it 'returns next_cursor when more properties exist' do
        get '/api/v1/properties', params: { limit: 25 }

        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(25)
        expect(json['metadata']).to have_key('next_cursor')
        expect(json['metadata']['next_cursor']).to be_present
      end

      it 'uses cursor for pagination' do
        get '/api/v1/properties', params: { limit: 10 }
        first = JSON.parse(response.body)
        next_cursor = first['metadata']['next_cursor']
        expect(next_cursor).to be_present

        get '/api/v1/properties', params: { limit: 10, cursor: next_cursor }
        second = JSON.parse(response.body)
        expect(second['properties'].first['id'].to_i).to be > next_cursor.to_i
      end
    end
  end

  describe 'GET /api/v1/properties/:id' do
    let!(:property) { create(:property, title: 'Beautiful House', description: 'A lovely property') }
    let!(:image1) { create(:property_image, property: property, url: 'https://example.com/image1.jpg', position: 1) }
    let!(:image2) { create(:property_image, property: property, url: 'https://example.com/image2.jpg', position: 2) }

    context 'without authentication' do
      it 'returns property details with images' do
        get "/api/v1/properties/#{property.id}"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['id'].to_i).to eq(property.id)
        expect(json['title']).to eq('Beautiful House')
        expect(json['description']).to eq('A lovely property')
        expect(json['property_images']).to be_an(Array)
        expect(json['property_images'].length).to eq(2)
      end

      it 'returns 404 for non-existent property' do
        get '/api/v1/properties/99999'

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json).to have_key('error')
      end
    end
  end
end

