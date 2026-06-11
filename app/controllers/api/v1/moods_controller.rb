module Api
  module V1
    class MoodsController < ApplicationController
      skip_before_action :authenticate_user!

      def index
        moods = Mood.order(:id)

        render json: moods.map { |mood|
          {
            id: mood.id,
            name: mood.name
          }
        }
      end
    end
  end
end
