# frozen_string_literal: true

class Property < ApplicationRecord
  has_many :property_images, -> { order(:position) }, dependent: :destroy
  has_many :property_events, dependent: :destroy
  has_many :watch_lists, dependent: :destroy
  has_many :watchers, through: :watch_lists, source: :user

  scope :property_type, lambda { |type|
    where(property_type: type) if type.present?
  }

  scope :bedrooms_between, lambda { |min, max|
    if min.present? && max.present?
      where(bedrooms: min..max)
    elsif min.present?
      where(bedrooms: min..)
    elsif max.present?
      where(bedrooms: ..max)
    end
  }

  scope :price_between, lambda { |min, max|
    if min.present? && max.present?
      where(price: min..max)
    elsif min.present?
      where(price: min..)
    elsif max.present?
      where(price: ..max)
    end
  }

  scope :between_bedrooms, ->(min, max) { bedrooms_between(min, max) }
  scope :between_price, ->(min, max) { price_between(min, max) }

  def formatted_price
    "$#{ActiveSupport::NumberHelper.number_to_delimited(price || 0)}"
  end
end
