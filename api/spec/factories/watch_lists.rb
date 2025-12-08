# frozen_string_literal: true

FactoryBot.define do
  factory :watch_list do
    association :user
    association :property
  end
end

