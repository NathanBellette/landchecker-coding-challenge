# frozen_string_literal: true

require 'jwt'

module JwtAuthenticatable
  extend ActiveSupport::Concern

  SECRET_KEY = ENV['SECRET_KEY_BASE'] || Rails.application.secret_key_base || Rails.application.credentials.secret_key_base

  class DecodeError < StandardError; end

  def jwt_encode(payload, exp: 7.days.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def jwt_decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })[0]
    ActiveSupport::HashWithIndifferentAccess.new(decoded)
  rescue JWT::ExpiredSignature
    raise DecodeError, 'Token has expired'
  rescue JWT::DecodeError => e
    raise DecodeError, "Invalid token: #{e.message}"
  end
end
