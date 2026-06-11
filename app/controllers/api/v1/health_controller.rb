module Api
  module V1
    class HealthController < ApplicationController
      skip_before_action :authenticate_user!

      def show
        render json: {
          status: "ok",
          app: "Tiny Act",
          version: "v1"
        }
      end
    end
  end
end
