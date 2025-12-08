# frozen_string_literal: true

class WatchList < ApplicationRecord
  belongs_to :user
  belongs_to :property
end
