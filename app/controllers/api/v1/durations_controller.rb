module Api
  module V1
    class DurationsController < ApplicationController
      skip_before_action :authenticate_user!

      def index
        durations = Duration.order(:value)

        render json: durations.map { |duration|
          {
            id: duration.id,
            value: duration.value,
            label: "#{duration.value} min"
          }
        }
      end
    end
  end
end
