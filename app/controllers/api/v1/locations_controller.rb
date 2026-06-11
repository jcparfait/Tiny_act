module Api
  module V1
    class LocationsController < ApplicationController
      skip_before_action :authenticate_user!

      def index
        locations = Location.where.not(name: "N'importe où").order(:id)

        render json: locations.map { |location|
          {
            id: location.id,
            name: location.name
          }
        }
      end
    end
  end
end
