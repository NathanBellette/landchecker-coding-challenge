# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password # Provided by bcrypt
  validates :email, uniqueness: true, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  has_many :watch_lists, dependent: :destroy
end
