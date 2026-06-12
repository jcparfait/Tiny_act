Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      get "health", to: "health#show"

      post "auth/login", to: "auth_sessions#create"
      get "auth/me", to: "auth_sessions#show"
      delete "auth/logout", to: "auth_sessions#destroy"

      resources :moods, only: [:index]
      resources :locations, only: [:index]
      resources :durations, only: [:index]

      resources :activity_sessions, only: [:index, :create, :show] do
        resource :progress,
                 only: [:show, :update],
                 controller: "activity_session_progress"

        member do
          patch :select_activity
          patch :start
          patch :pause
          patch :resume
          patch :finish
        end
      end
    end
  end

  get "webmanifest" => "pwa#manifest"
  get "service-worker" => "pwa#service_worker"

  devise_for :users

  root to: "activity_sessions#new"

  resources :activity_sessions,
            only: [:index, :new, :create, :show, :update] do
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
    resource :like,
             only: [:create, :destroy],
             controller: "room_likes"
  end
end
