# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'password' do
    it 'authenticates with correct password' do
      user = create(:user, password: 'SecurePassword123!')
      expect(user.authenticate('SecurePassword123!')).to eq(user)
    end

    it 'does not authenticate with incorrect password' do
      user = create(:user, password: 'SecurePassword123!')
      expect(user.authenticate('WrongPassword')).to be false
    end
  end

  describe 'associations' do
    it 'has many watch_lists' do
      user = create(:user)
      watchlist1 = create(:watch_list, user: user)
      watchlist2 = create(:watch_list, user: user)

      expect(user.watch_lists).to include(watchlist1, watchlist2)
    end

    it 'destroys watch_lists when user is destroyed' do
      user = create(:user)
      create(:watch_list, user: user)

      expect { user.destroy }.to change { WatchList.count }.by(-1)
    end
  end
end

