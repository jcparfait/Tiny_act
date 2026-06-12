module Api
  module V1
    class OauthExchangesController < BaseController
      skip_before_action :authenticate_api_user!

      def create
        user = MobileOauthCode.consume(
          params.require(:code)
        )

        unless user
          render json: {
            error:
              "Le code de connexion est invalide ou expiré."
          }, status: :unauthorized

          return
        end

        render json: {
          token: user.issue_mobile_api_token!,
          user: serialize_api_user(user)
        }
      end
    end
  end
end
