Rails.application.routes.draw do
  get "webmanifest"    => "pwa#manifest"
  get "service-worker" => "pwa#service_worker"

  get "rooms/show"
  get "activities/show"

  devise_for :users

  root to: "activity_sessions#new"

  resources :activity_sessions, only: [:index, :new, :create, :show, :update] do
    collection do
      get :location
      get :duration
    end

    member do
      patch :start
      patch :progress
      patch :pause
      patch :resume
      patch :abandon
    end
  end

  resources :activities, only: [:show]

  resource :user, only: [:show, :edit, :update]

  resource :user_interests, only: [:show, :update]

  resources :room_furnitures, only: [:create, :update, :destroy]

  resources :rooms, only: [:index, :show] do
    resource :like, only: [:create, :destroy], controller: "room_likes"
  end

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      get "health", to: "health#show"

      resources :moods, only: [:index]
      resources :locations, only: [:index]
      resources :durations, only: [:index]

      resources :activity_sessions, only: [:create, :show] do
        member do
          patch :select_activity
        end
      end
    end
  end
end
