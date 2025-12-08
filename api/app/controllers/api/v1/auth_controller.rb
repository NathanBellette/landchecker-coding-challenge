# frozen_string_literal: true

module Api
  module V1
    class AuthController < Api::V1::BaseController
      skip_before_action :authenticate_user, only: [:login]

      # POST /api/v1/auth/login
      def login
        user = User.find_by(email: params[:email]&.downcase)
        if user&.authenticate(params[:password])
          token = jwt_encode({ user_id: user.id }, exp: 24.hours.from_now)
          render json: { token: token, user: user.as_json(only: %i[id email]) }, status: :ok
        else
          render json: { error: 'Invalid email or password' }, status: :unauthorized
        end
      end

      # DELETE /api/v1/auth/logout
      def logout
        # This basic implementation has logout handled client-side by removing the token
        render json: { message: 'Logged out successfully' }, status: :ok
      end
    end
  end
end
