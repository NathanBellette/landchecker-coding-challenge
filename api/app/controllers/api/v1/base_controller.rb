# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::API
      include Pagy::Backend
      include JwtAuthenticatable

      before_action :authenticate_user

      def authenticate_user
        header = request.headers['Authorization']
        return render json: { error: 'Missing authorization header' }, status: :unauthorized unless header

        token = header.split.last
        return render json: { error: 'Invalid authorization header format' }, status: :unauthorized unless token

        begin
          @decoded = jwt_decode(token)
          @current_user = User.find(@decoded[:user_id])
        rescue JwtAuthenticatable::DecodeError => e
          render json: { error: e.message }, status: :unauthorized
        rescue ActiveRecord::RecordNotFound
          render json: { error: 'User not found' }, status: :unauthorized
        end
      end

      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActionController::ParameterMissing, with: :render_param_missing

      private

      def render_not_found(exception)
        render json: { error: exception.message }, status: :not_found
      end

      def render_param_missing(exception)
        render json: { error: exception.message }, status: :bad_request
      end
    end
  end
end
