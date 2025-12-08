# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Watchlists', type: :request do
  def auth_header(user)
    { 'Authorization' => "Bearer #{generate_jwt_token(user)}" }
  end

  describe 'GET /api/v1/watchlists' do
    let(:user) { create(:user) }
    let(:other_user) { create(:user) }

    context 'with authentication' do
      it "returns user's watchlist properties with watchlist_id and images" do
        property1 = create(:property)
        property2 = create(:property)
        watchlist1 = create(:watch_list, user: user, property: property1)
        create(:watch_list, user: user, property: property2)
        create(:property_image, property: property1, url: 'https://example.com/image1.jpg')

        get '/api/v1/watchlists', headers: auth_header(user)

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(2)
        property = json['properties'].find { |p| p['id'].to_i == property1.id }
        expect(property['watchlist_id']).to eq(watchlist1.id)
        expect(property['property_images'].first['url']).to eq('https://example.com/image1.jpg')
      end

      it 'returns empty array when user has no watchlist items' do
        get '/api/v1/watchlists', headers: auth_header(user)

        json = JSON.parse(response.body)
        expect(json['properties']).to eq([])
        expect(json['count']).to eq(0)
      end

      it 'ignores user_id param and returns current user watchlist' do
        property = create(:property)
        create(:watch_list, user: user, property: property)
        other_property = create(:property)
        create(:watch_list, user: other_user, property: other_property)

        get '/api/v1/watchlists', params: { user_id: other_user.id }, headers: auth_header(user)

        json = JSON.parse(response.body)
        expect(json['properties'].length).to eq(1)
        expect(json['properties'].first['id'].to_i).to eq(property.id)
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        get '/api/v1/watchlists'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST /api/v1/watchlists' do
    let(:user) { create(:user) }

    context 'with authentication' do
      it 'adds property to user watchlist' do
        property = create(:property)

        post '/api/v1/watchlists',
             params: { watchlist: { property_id: property.id } },
             headers: auth_header(user)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['property']['id'].to_i).to eq(property.id)
        expect(json['message']).to eq('Property added to watchlist')
      end

      it 'returns error when property is already in watchlist' do
        property = create(:property)
        create(:watch_list, user: user, property: property)

        post '/api/v1/watchlists',
             params: { watchlist: { property_id: property.id } },
             headers: auth_header(user)

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Property is already in your watchlist')
      end

      it 'returns error for non-existent property' do
        post '/api/v1/watchlists',
             params: { watchlist: { property_id: 99999 } },
             headers: auth_header(user)

        expect(response).to have_http_status(:not_found)
      end

      it 'returns error for missing property_id' do
        post '/api/v1/watchlists',
             params: { watchlist: {} },
             headers: auth_header(user)

        expect(response).to have_http_status(:bad_request)
      end

      it 'returns error for missing watchlist parameter' do
        property = create(:property)

        post '/api/v1/watchlists',
             params: { property_id: property.id },
             headers: auth_header(user)

        expect(response).to have_http_status(:bad_request)
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        property = create(:property)

        post '/api/v1/watchlists', params: { watchlist: { property_id: property.id } }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/watchlists/:id' do
    let(:user) { create(:user) }
    let(:other_user) { create(:user) }

    context 'with authentication' do
      it 'removes property from user watchlist' do
        watchlist = create(:watch_list, user: user)

        delete "/api/v1/watchlists/#{watchlist.id}", headers: auth_header(user)

        expect(response).to have_http_status(:no_content)
      end

      it "prevents deleting another user's watchlist item" do
        other_watchlist = create(:watch_list, user: other_user)

        delete "/api/v1/watchlists/#{other_watchlist.id}", headers: auth_header(user)

        expect(response).to have_http_status(:not_found)
      end

      it 'returns 404 for non-existent watchlist item' do
        delete '/api/v1/watchlists/99999', headers: auth_header(user)

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        watchlist = create(:watch_list, user: user)

        delete "/api/v1/watchlists/#{watchlist.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end

