module Api
  module V1
    class ActivitySessionProgressController < BaseController
      before_action :set_activity_session

      def show
        render json: {
          activity_session_id: @activity_session.id,
          progress_data: @activity_session.progress_data || {}
        }
      end

      def update
        merged_progress =
          current_progress.deep_merge(
            progress_params.to_h
          )

        @activity_session.update!(
          progress_data: merged_progress
        )

        render json: {
          activity_session_id: @activity_session.id,
          progress_data: @activity_session.progress_data
        }
      end

      private

      def set_activity_session
        @activity_session =
          current_api_user.activity_sessions.find(
            params[:activity_session_id]
          )
      end

      def current_progress
        @activity_session.progress_data.presence || {}
      end

      def progress_params
        params.require(:progress_data).permit!
      end
    end
  end
end
