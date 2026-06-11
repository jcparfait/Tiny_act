module Api
  module V1
    class ActivitySessionsController < ApplicationController
      skip_before_action :authenticate_user!
      skip_forgery_protection

      def create
        user = current_api_user!

        return unless user

        activity = matching_activities_for(user).order(Arel.sql("RANDOM()")).first

        unless activity
          render json: { error: "Aucune activité trouvée avec ces critères." }, status: :not_found
          return
        end

        activity_session = user.activity_sessions.create!(
          activity: activity,
          date: Date.current,
          status: "selecting",
          elapsed_seconds: 0
        )

        recommendations = activity_recommendations_for(user, activity)

        activity_session.update!(
          candidate_activity_ids: recommendations.map(&:id)
        )

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activities: recommendations.map { |recommended_activity| serialize_activity(recommended_activity) }
        }, status: :created
      end

      def show
        user = current_api_user!

        return unless user

        activity_session = user.activity_sessions.find(params[:id])

        activities = if activity_session.candidate_activity_ids.present?
                       activities_in_saved_order(activity_session.candidate_activity_ids)
                     else
                       [activity_session.activity]
                     end

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activities: activities.map { |activity| serialize_activity(activity) }
        }
      end

      def select_activity
        user = current_api_user!

        return unless user

        activity_session = user.activity_sessions.find(params[:id])
        activity = Activity.find(params.require(:activity_id))

        candidate_ids = Array(activity_session.candidate_activity_ids).map(&:to_i)

        unless candidate_ids.include?(activity.id)
          render json: { error: "Cette activité ne fait pas partie des recommandations." },
                 status: :unprocessable_entity
          return
        end

        activity_session.update!(
          activity: activity,
          status: "preview"
        )

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activity: serialize_activity(activity)
        }
      end

      def start
        user = current_api_user!

        return unless user

        activity_session = user.activity_sessions.find(params[:id])

        if activity_session.finished?
          render json: { error: "Cette session est déjà terminée." }, status: :unprocessable_entity
          return
        end

        activity_session.update!(
          status: "in_progress",
          timer_started_at: Time.current
        )

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activity: serialize_activity(activity_session.activity)
        }
      end

      def pause
        user = current_api_user!

        return unless user

        activity_session = user.activity_sessions.find(params[:id])

        if activity_session.finished?
          render json: { error: "Cette session est déjà terminée." }, status: :unprocessable_entity
          return
        end

        activity_session.update!(
          elapsed_seconds: safe_elapsed_seconds,
          status: "paused"
        )

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activity: serialize_activity(activity_session.activity)
        }
      end

      def resume
        user = current_api_user!

        return unless user

        activity_session = user.activity_sessions.find(params[:id])

        if activity_session.finished?
          render json: { error: "Cette session est déjà terminée." }, status: :unprocessable_entity
          return
        end

        activity_session.update!(
          status: "in_progress",
          timer_started_at: Time.current
        )

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activity: serialize_activity(activity_session.activity)
        }
      end

      def finish
        user = current_api_user!

        return unless user

        activity_session = user.activity_sessions.find(params[:id])
        was_already_finished = activity_session.finished?

        activity_session.update!(
          elapsed_seconds: safe_elapsed_seconds,
          finished: true,
          status: "finished"
        )

        record_new_furniture_unlocks_for(activity_session) unless was_already_finished

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activity: serialize_activity(activity_session.activity)
        }
      end

      private

      # TEMPORAIRE POUR APPRENDRE.
      # Plus tard, on remplacera ça par une vraie authentification mobile.
      def current_api_user
        User.joins(:user_interests).distinct.first || User.first
      end

      def current_api_user!
        user = current_api_user

        unless user
          render json: { error: "Aucun utilisateur disponible pour le test API." }, status: :unprocessable_entity
          return nil
        end

        user
      end

      def activity_session_params
        params.require(:activity_session).permit(:mood_id, :location_id, :duration_id)
      end

      def matching_activities_for(_user)
        Activity.where(
          active: true,
          mood_id: activity_session_params[:mood_id],
          duration_id: activity_session_params[:duration_id],
          location_id: allowed_location_ids(activity_session_params[:location_id])
        )
      end

      def activity_recommendations_for(_user, reference_activity)
        Activity.where(
          active: true,
          mood: reference_activity.mood,
          duration: reference_activity.duration,
          location_id: allowed_location_ids(reference_activity.location_id)
        )
                .includes(:interest, :duration, :location, :mood)
                .group_by(&:interest_id)
                .values
                .map(&:sample)
                .compact
                .sample(3)
      end

      def activities_in_saved_order(activity_ids)
        ids = activity_ids.map(&:to_i)

        activities_by_id = Activity
                           .includes(:interest, :duration, :location, :mood)
                           .where(id: ids)
                           .index_by(&:id)

        ids.filter_map { |id| activities_by_id[id] }
      end

      def allowed_location_ids(selected_location_id)
        ids = [selected_location_id]

        anywhere = Location.find_by(name: "N'importe où")
        ids << anywhere.id if anywhere.present?

        ids
      end

      def safe_elapsed_seconds
        elapsed_seconds = params[:elapsed_seconds].to_i
        elapsed_seconds.negative? ? 0 : elapsed_seconds
      end

      def serialize_activity_session(activity_session)
        {
          id: activity_session.id,
          status: activity_session.status,
          finished: activity_session.finished,
          elapsed_seconds: activity_session.elapsed_seconds,
          activity_id: activity_session.activity_id,
          timer_started_at: activity_session.timer_started_at
        }
      end

      def serialize_activity(activity)
        {
          id: activity.id,
          name: activity.name,
          description: activity.description.presence || activity.content,
          content: activity.content,
          activity_type: activity.activity_type,
          interest: {
            id: activity.interest.id,
            name: activity.interest.name
          },
          duration: {
            id: activity.duration.id,
            value: activity.duration.value,
            label: "#{activity.duration.value} min"
          },
          location: {
            id: activity.location.id,
            name: activity.location.name
          },
          mood: {
            id: activity.mood.id,
            name: activity.mood.name
          }
        }
      end

      def record_new_furniture_unlocks_for(activity_session)
        interest = activity_session.activity.interest
        locked_furnitures_before_reward = locked_furnitures_for(activity_session.user, interest)

        XpCalculator.award!(activity_session)

        current_xp = XpCalculator.total_for_interest(activity_session.user, interest)
        newly_unlocked_furniture_ids = locked_furnitures_before_reward
                                       .select { |furniture| furniture.required_xp.to_i <= current_xp }
                                       .map(&:id)

        activity_session.update!(
          newly_unlocked_furniture_ids: newly_unlocked_furniture_ids,
          furniture_unlocks_seen_at: nil
        )
      end

      def locked_furnitures_for(user, interest)
        current_xp = XpCalculator.total_for_interest(user, interest)

        Furniture
          .where(interest: interest)
          .where("required_xp > ?", current_xp)
          .order(:required_xp, :id)
      end
    end
  end
end
