module Api
  module V1
    class InterestsController < BaseController
      def index
        render json: interests_payload
      end

      def update
        interest_ids = normalized_interest_ids

        if interest_ids.empty?
          render json: {
            error: "Choisis au moins un centre d’intérêt."
          }, status: :unprocessable_entity

          return
        end

        current_api_user.transaction do
          current_api_user
            .user_interests
            .where.not(interest_id: interest_ids)
            .delete_all

          interest_ids.each do |interest_id|
            current_api_user.user_interests.find_or_create_by!(
              interest_id: interest_id
            )
          end
        end

        current_api_user.reload

        render json: interests_payload.merge(
          user: serialize_api_user(current_api_user)
        )
      end

      private

      def normalized_interest_ids
        requested_ids =
          Array(params[:interest_ids])
          .filter_map do |value|
            Integer(value, exception: false)
          end
          .uniq

        Interest.where(id: requested_ids).pluck(:id)
      end

      def interests_payload
        {
          interests: Interest.order(:name).map do |interest|
            {
              id: interest.id,
              name: interest.name
            }
          end,
          selected_interest_ids: current_api_user.interest_ids
        }
      end
    end
  end
end
