module Api
  module V1
    class ActivitySessionRewardsController < BaseController
      def show
        user = current_api_user!
        return unless user

        activity_session = user.activity_sessions.find(params[:id])

        unless activity_session.finished?
          render json: { error: "Cette session n'est pas encore terminée." }, status: :unprocessable_entity
          return
        end

        render json: serialize_activity_reward(activity_session)
      end

      private

      def serialize_activity_reward(activity_session)
        activity = activity_session.activity
        interest = activity.interest
        user = activity_session.user
        interest_xp = XpCalculator.total_for_interest(user, interest)
        furniture_ids = Array(activity_session.newly_unlocked_furniture_ids).map(&:to_i)

        furnitures_by_id = Furniture.includes(:interest).where(id: furniture_ids).index_by(&:id)

        newly_unlocked_furnitures = furniture_ids.filter_map do |furniture_id|
          furniture = furnitures_by_id[furniture_id]
          serialize_reward_furniture(furniture, interest_xp) if furniture.present?
        end

        next_furniture = Furniture
                         .includes(:interest)
                         .where(interest: interest)
                         .where("required_xp > ?", interest_xp)
                         .order(:required_xp, :id)
                         .first

        duration_minutes = activity.duration.value.to_i

        {
          xp_earned: activity_session.xp_earned.to_i,
          total_xp: XpCalculator.total_for(user),
          interest_xp: interest_xp,
          interest: {
            id: interest.id,
            name: interest.name
          },
          duration_minutes: duration_minutes,
          saved_scroll_minutes: duration_minutes.positive? ? duration_minutes : 15,
          newly_unlocked_furnitures: newly_unlocked_furnitures,
          next_furniture: next_furniture.present? ? serialize_reward_furniture(next_furniture, interest_xp) : nil
        }
      end

      def serialize_reward_furniture(furniture, current_xp)
        required_xp = furniture.required_xp.to_i

        {
          id: furniture.id,
          name: furniture.name,
          image_key: furniture.image_url,
          required_xp: required_xp,
          current_xp: current_xp,
          remaining_xp: [required_xp - current_xp, 0].max,
          interest: {
            id: furniture.interest.id,
            name: furniture.interest.name
          }
        }
      end
    end
  end
end
