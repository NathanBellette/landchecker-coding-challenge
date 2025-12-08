# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class AuthControllerTest < ActionDispatch::IntegrationTest
      test 'should get create' do
        get api_v1_auth_create_url
        assert_response :success
      end

      test 'should get destroy' do
        get api_v1_auth_destroy_url
        assert_response :success
      end
    end
  end
end
