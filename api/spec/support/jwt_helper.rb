# frozen_string_literal: true

module JwtHelper
  def generate_jwt_token(user, exp: 24.hours.from_now)
    payload = { user_id: user.id, exp: exp.to_i }
    secret_key = ENV['SECRET_KEY_BASE'] || Rails.application.secret_key_base || Rails.application.credentials.secret_key_base
    JWT.encode(payload, secret_key)
  end
end

RSpec.configure do |config|
  config.include JwtHelper
end

