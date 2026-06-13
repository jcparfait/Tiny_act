module Api
  module V1
    class BaseController < ApplicationController
      skip_before_action :authenticate_user!
      skip_forgery_protection

      before_action :authenticate_api_user!

      attr_reader :current_api_user

      rescue_from ActiveRecord::RecordNotFound do
        render json: {
          error: "Ressource introuvable."
        }, status: :not_found
      end

      private

      def authenticate_api_user!
        @current_api_user =
          User.find_by_mobile_api_token(bearer_token)

        return if @current_api_user.present?

        render json: {
          error: "Authentification requise."
        }, status: :unauthorized
      end

      def current_api_user!
        current_api_user
      end

      def bearer_token
        scheme, token =
          request.authorization.to_s.split(" ", 2)

        return nil if scheme.blank?
        return nil if token.blank?
        return nil unless scheme.casecmp("Bearer").zero?

        token
      end

      def serialize_api_user(user)
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar,
          interest_ids: user.interest_ids,
          onboarding_complete:
            user.interests.exists? && user.avatar.present?
        }
      end
    end
  end
end
