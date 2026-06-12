module Api
  module V1
    class AuthProvidersController < BaseController
      skip_before_action :authenticate_api_user!

      def show
        render json: {
          google:
            Devise.omniauth_configs.key?(:google_oauth2),
          facebook:
            Devise.omniauth_configs.key?(:facebook)
        }
      end
    end
  end
end
