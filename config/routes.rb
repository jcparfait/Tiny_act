Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      get "health", to: "health#show"

      post "auth/login", to: "auth_sessions#create"
      get "auth/me", to: "auth_sessions#show"
      delete "auth/logout", to: "auth_sessions#destroy"

      post "auth/register", to: "auth_registrations#create"

      post "auth/password", to: "auth_passwords#create"
      patch "auth/password", to: "auth_passwords#update"

      patch "auth/profile", to: "auth_profiles#update"

      get "auth/providers", to: "auth_providers#show"

      post "auth/oauth/exchange",
           to: "oauth_exchanges#create"

      get "interests", to: "interests#index"
      patch "interests", to: "interests#update"

      resources :moods, only: [:index]
      resources :locations, only: [:index]
      resources :durations, only: [:index]

      resource :room, only: [:show] do
        resources :furnitures,
                  only: [:create, :update, :destroy],
                  controller: "room_furnitures"
      end

      resources :activity_sessions,
                only: [:index, :create, :show] do
        resource :progress,
                 only: [:show, :update],
                 controller: "activity_session_progress"

        member do
          patch :select_activity
          patch :start
          patch :pause
          patch :resume
          patch :finish
          get :reward, to: "activity_session_rewards#show"
        end
      end
    end
  end

  get "webmanifest" => "pwa#manifest"
  get "service-worker" => "pwa#service_worker"

  get "mobile_oauth/:provider",
      to: "mobile_oauth#start",
      as: :mobile_oauth_start

  devise_for :users,
             controllers: {
               omniauth_callbacks:
                 "users/omniauth_callbacks"
             }

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

  resource :user,
           only: [:show, :edit, :update]

  resource :user_interests,
           only: [:show, :update]

  resources :room_furnitures,
            only: [:create, :update, :destroy]

  resources :rooms, only: [:index, :show] do
    resource :like,
             only: [:create, :destroy],
             controller: "room_likes"
  end
end
