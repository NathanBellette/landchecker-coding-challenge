# frozen_string_literal: true

FactoryBot.define do
  factory :property_image do
    association :property
    url { Faker::Internet.url }
    position { Faker::Number.between(from: 1, to: 10) }
  end
end

