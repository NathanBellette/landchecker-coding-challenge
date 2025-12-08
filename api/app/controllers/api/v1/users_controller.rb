# frozen_string_literal: true

module Api
  module V1
    class UsersController < Api::V1::BaseController
      skip_before_action :authenticate_user, only: [:create]
      before_action :set_user, only: %i[show update destroy]

      # GET /api/v1/users/:id
      def show
        render json: @user.as_json(only: [:id, :email, :created_at, :updated_at])
      end

      # POST /api/v1/users
      def create
        @user = User.new(user_params)
        if @user.save
          render json: @user.as_json(only: [:id, :email, :created_at, :updated_at]), status: :created
        else
          render json: @user.errors, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/users/:id
      def update
        if @user.update(user_params)
          render json: @user.as_json(only: [:id, :email, :created_at, :updated_at])
        else
          render json: @user.errors, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/users/:id
      def destroy
        @user.destroy
        head :no_content
      end

      private

      def set_user
        @user = User.find(params[:id])
      end

      def user_params
        params.require(:user).permit(:email, :password)
      end
    end
  end
end
