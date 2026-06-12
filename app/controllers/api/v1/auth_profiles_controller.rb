module Api
  module V1
    class AuthProfilesController < BaseController
      def update
        if current_api_user.update(profile_params)
          render json: {
            user: serialize_api_user(current_api_user)
          }
        else
          render json: {
            error:
              current_api_user.errors.full_messages.to_sentence
          }, status: :unprocessable_entity
        end
      end

      private

      def profile_params
        params.require(:user).permit(
          :first_name,
          :last_name,
          :avatar
        )
      end
    end
  end
end
