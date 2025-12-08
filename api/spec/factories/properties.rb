# frozen_string_literal: true

FactoryBot.define do
  factory :property do
    title { Faker::Lorem.sentence(word_count: 3) }
    description { Faker::Lorem.paragraph }
    price { Faker::Number.between(from: 200_000, to: 2_000_000) }
    bedrooms { Faker::Number.between(from: 1, to: 5) }
    property_type { %w[house apartment townhouse unit].sample }
    status { %w[available sold under_offer].sample }
    latitude { Faker::Address.latitude }
    longitude { Faker::Address.longitude }
    published_at { Faker::Time.between(from: 1.year.ago, to: Time.current) }
  end
end

