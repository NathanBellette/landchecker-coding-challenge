# frozen_string_literal: true

FactoryBot.define do
  factory :property_event do
    association :property
    event_type { %w[price_changed sold].sample }
    data { {} }
    created_at { Faker::Time.between(from: 1.month.ago, to: Time.current) }

    trait :price_changed do
      event_type { 'price_changed' }
      data { { old_price: 450_000, new_price: 500_000 } }
    end

    trait :sold do
      event_type { 'sold' }
      data { { sold_price: 500_000, sold_date: Time.current.iso8601 } }
    end
  end
end

