# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Auth', type: :request do
  describe 'POST /api/v1/auth/login' do
    let!(:user) { create(:user, email: 'test@example.com', password: 'password123') }

    context 'with valid credentials' do
      it 'returns a JWT token and user data' do
        post '/api/v1/auth/login', params: { email: 'test@example.com', password: 'password123' }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json).to have_key('token')
        expect(json['user']['email']).to eq('test@example.com')
      end

      it 'is case-insensitive for email' do
        post '/api/v1/auth/login', params: { email: 'TEST@EXAMPLE.COM', password: 'password123' }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['user']['email']).to eq('test@example.com')
      end
    end

    context 'with invalid credentials' do
      it 'returns unauthorized for wrong password' do
        post '/api/v1/auth/login', params: { email: 'test@example.com', password: 'wrongpassword' }

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Invalid email or password')
      end

      it 'returns unauthorized for non-existent email' do
        post '/api/v1/auth/login', params: { email: 'nonexistent@example.com', password: 'password123' }

        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns unauthorized for missing email' do
        post '/api/v1/auth/login', params: { password: 'password123' }

        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns unauthorized for missing password' do
        post '/api/v1/auth/login', params: { email: 'test@example.com' }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/auth/logout' do
    let!(:user) { create(:user) }
    let(:token) { generate_jwt_token(user) }

    context 'with valid authentication' do
      it 'returns success message' do
        delete '/api/v1/auth/logout', headers: { 'Authorization' => "Bearer #{token}" }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['message']).to eq('Logged out successfully')
      end
    end

    context 'without authentication' do
      it 'returns unauthorized' do
        delete '/api/v1/auth/logout'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end

