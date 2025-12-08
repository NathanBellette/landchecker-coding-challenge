# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Users', type: :request do
  describe 'POST /api/v1/users' do
    context 'with valid parameters' do
      let(:valid_params) do
        {
          user: {
            email: 'newuser@example.com',
            password: 'SecurePassword123!'
          }
        }
      end

      it 'creates a new user and allows login' do
        post '/api/v1/users', params: valid_params

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['email']).to eq('newuser@example.com')
        expect(json).not_to have_key('password')
        expect(json).not_to have_key('password_digest')

        post '/api/v1/auth/login', params: { email: 'newuser@example.com', password: 'SecurePassword123!' }
        expect(response).to have_http_status(:ok)
      end
    end

    context 'with invalid parameters' do
      it 'returns error for duplicate email' do
        create(:user, email: 'existing@example.com')

        post '/api/v1/users', params: {
          user: { email: 'existing@example.com', password: 'Password123!' }
        }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json).to have_key('email')
      end

      it 'returns error for invalid email format' do
        post '/api/v1/users', params: {
          user: { email: 'invalid-email', password: 'Password123!' }
        }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json).to have_key('email')
      end

      it 'returns error for missing email' do
        post '/api/v1/users', params: {
          user: { password: 'Password123!' }
        }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json).to have_key('email')
      end

      it 'returns error for missing password' do
        post '/api/v1/users', params: {
          user: { email: 'test@example.com' }
        }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json).to have_key('password')
      end

      it 'returns error for missing user parameter' do
        post '/api/v1/users', params: {
          email: 'test@example.com',
          password: 'Password123!'
        }

        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end

