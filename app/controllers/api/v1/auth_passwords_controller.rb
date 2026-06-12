module Api
  module V1
    class AuthPasswordsController < BaseController
      skip_before_action :authenticate_api_user!

      def create
        email = params.require(:email).to_s.strip.downcase

        User.send_reset_password_instructions(
          email: email
        )

        render json: {
          message:
            "Si cette adresse existe, un email de réinitialisation a été envoyé."
        }
      end

      def update
        user = User.reset_password_by_token(
          reset_password_params
        )

        if user.errors.empty?
          render json: {
            token: user.issue_mobile_api_token!,
            user: serialize_api_user(user)
          }
        else
          render json: {
            error: user.errors.full_messages.to_sentence
          }, status: :unprocessable_entity
        end
      end

      private

      def reset_password_params
        params.permit(
          :reset_password_token,
          :password,
          :password_confirmation
        )
      end
    end
  end
end
