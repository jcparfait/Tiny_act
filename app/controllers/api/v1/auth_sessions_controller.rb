module Api
  module V1
    class AuthSessionsController < BaseController
      skip_before_action :authenticate_api_user!,
                         only: :create

      def create
        email = params.require(:email).to_s.strip.downcase
        password = params.require(:password).to_s

        user = User.find_for_database_authentication(
          email: email
        )

        unless user&.valid_password?(password)
          render json: {
            error: "Email ou mot de passe incorrect."
          }, status: :unauthorized

          return
        end

        token = user.issue_mobile_api_token!

        render json: {
          token: token,
          user: serialize_user(user)
        }
      end

      def show
        render json: {
          user: serialize_user(current_api_user)
        }
      end

      def destroy
        current_api_user.revoke_mobile_api_token!

        head :no_content
      end

      private

      def serialize_user(user)
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar
        }
      end
    end
  end
end
