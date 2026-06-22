module Api
  module V1
    class AuthProfilesController < BaseController
      def update
        password_update =
          profile_params[:password].present?

        if current_api_user.update(profile_params)
          keep_current_mobile_token! if password_update

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

      def destroy
        if current_api_user.destroy
          head :no_content
        else
          render json: {
            error:
              current_api_user.errors.full_messages.to_sentence
          }, status: :unprocessable_entity
        end
      end

      private

      def profile_params
        permitted_params = params.require(:user).permit(
          :first_name,
          :last_name,
          :avatar,
          :password,
          :password_confirmation
        )

        if permitted_params[:password].blank?
          permitted_params.delete(:password)
          permitted_params.delete(:password_confirmation)
        end

        permitted_params
      end

      def keep_current_mobile_token!
        current_api_user.update_column(
          :mobile_api_token_digest,
          User.digest_mobile_api_token(bearer_token)
        )
      end
    end
  end
end
