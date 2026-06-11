module Api
  module V1
    class ActivitySessionsController < ApplicationController
      skip_before_action :authenticate_user!
      skip_forgery_protection

      def create
        user = current_api_user

        unless user
          render json: { error: "Aucun utilisateur disponible pour le test API." }, status: :unprocessable_entity
          return
        end

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
        activity_session = current_api_user.activity_sessions.find(params[:id])

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

      private

      # TEMPORAIRE POUR APPRENDRE.
      # Plus tard, on remplacera ça par une vraie auth mobile avec token.
      def current_api_user
        User.first
      end

      def activity_session_params
        params.require(:activity_session).permit(:mood_id, :location_id, :duration_id)
      end

      def matching_activities_for(user)
        Activity.where(
          active: true,
          mood_id: activity_session_params[:mood_id],
          duration_id: activity_session_params[:duration_id],
          interest_id: user.interest_ids,
          location_id: allowed_location_ids(activity_session_params[:location_id])
        )
      end

      def activity_recommendations_for(user, reference_activity)
        Activity.where(
          active: true,
          mood: reference_activity.mood,
          duration: reference_activity.duration,
          interest_id: user.interest_ids,
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

      def serialize_activity_session(activity_session)
        {
          id: activity_session.id,
          status: activity_session.status,
          finished: activity_session.finished,
          elapsed_seconds: activity_session.elapsed_seconds,
          activity_id: activity_session.activity_id
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
    end
  end
end
