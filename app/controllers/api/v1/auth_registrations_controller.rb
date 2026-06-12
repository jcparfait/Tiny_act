module Api
  module V1
    class AuthRegistrationsController < BaseController
      skip_before_action :authenticate_api_user!

      def create
        user = User.new(registration_params)

        if user.save
          render json: {
            token: user.issue_mobile_api_token!,
            user: serialize_api_user(user)
          }, status: :created
        else
          render json: {
            error: user.errors.full_messages.to_sentence
          }, status: :unprocessable_entity
        end
      end

      private

      def registration_params
        params.require(:user).permit(
          :first_name,
          :last_name,
          :email,
          :password,
          :password_confirmation
        )
      end
    end
  end
end
