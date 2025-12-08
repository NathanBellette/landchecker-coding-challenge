# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :properties do
        resources :property_events, only: [:index], controller: 'properties/events'
      end
      resources :users, only: [:create]
      resources :watchlists, only: %i[index create destroy]
      post 'auth/login', to: 'auth#login'
      delete 'auth/logout', to: 'auth#logout'
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
