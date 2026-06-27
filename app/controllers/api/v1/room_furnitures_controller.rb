module Api
  module V1
    class RoomFurnituresController < BaseController
      before_action :set_room

      before_action :set_room_furniture,
                    only: %i[update destroy]

      def create
        furniture =
          available_furniture_scope.find(
            params.require(:furniture_id)
          )

        unless furniture_unlocked?(furniture)
          render json: {
            error:
              "Tu n’as pas encore assez d’XP pour ce meuble."
          }, status: :unprocessable_entity

          return
        end

        position =
          first_free_position(
            @room,
            furniture
          )

        unless position
          render json: {
            error:
              "Il n’y a plus assez de place dans la salle."
          }, status: :unprocessable_entity

          return
        end

        room_furniture =
          @room.room_furnitures.create!(
            furniture: furniture,
            x: position[:x],
            y: position[:y],
            z: position[:x] + position[:y],
            rotation: 0
          )

        render json: {
          room_furniture:
            serialize_room_furniture(
              room_furniture
            )
        }, status: :created
      end

      def update
        new_x =
          position_params
          .fetch(:x, @room_furniture.x)
          .to_i

        new_y =
          position_params
          .fetch(:y, @room_furniture.y)
          .to_i

        unless can_place?(
          @room_furniture,
          new_x,
          new_y
        )
          render json: {
            error:
              "Le meuble ne peut pas être placé ici."
          }, status: :unprocessable_entity

          return
        end

        @room_furniture.update!(
          x: new_x,
          y: new_y,
          z: new_x + new_y
        )

        render json: {
          room_furniture:
            serialize_room_furniture(
              @room_furniture
            )
        }
      end

      def destroy
        @room_furniture.destroy!

        head :no_content
      end

      private

      def set_room
        @room =
          current_api_user.room ||
          current_api_user.create_room!(
            width: Room::GRID_WIDTH,
            height: Room::GRID_HEIGHT
          )

        @room.ensure_default_size!
      end

      def set_room_furniture
        @room_furniture =
          @room
          .room_furnitures
          .find(params[:id])
      end

      def available_furniture_scope
        Furniture.includes(:interest)
      end

      def furniture_unlocked?(furniture)
        user_xp =
          XpCalculator.total_for(
            current_api_user
          )

        user_xp >= furniture.required_xp.to_i
      end

      def position_params
        @position_params ||=
          params
          .require(:room_furniture)
          .permit(:x, :y)
      end

      def can_place?(item, new_x, new_y)
        width =
          item.furniture.width.to_i

        height =
          item.furniture.height.to_i

        return false if new_x.negative?
        return false if new_y.negative?

        return false if new_x + width >
                        @room.width.to_i

        return false if new_y + height >
                        @room.height.to_i

        @room
          .room_furnitures
          .where.not(id: item.id)
          .includes(:furniture)
          .none? do |other|
            other_width =
              other.furniture.width.to_i

            other_height =
              other.furniture.height.to_i

            new_x <
              other.x.to_i + other_width &&
              new_x + width >
                other.x.to_i &&
              new_y <
                other.y.to_i + other_height &&
              new_y + height >
                other.y.to_i
          end
      end

      def first_free_position(
        room,
        furniture
      )
        maximum_x =
          room.width.to_i -
          furniture.width.to_i

        maximum_y =
          room.height.to_i -
          furniture.height.to_i

        return nil if maximum_x.negative?
        return nil if maximum_y.negative?

        (0..maximum_y).each do |y|
          (0..maximum_x).each do |x|
            if free_position?(
              room,
              furniture,
              x,
              y
            )
              return {
                x: x,
                y: y
              }
            end
          end
        end

        nil
      end

      def free_position?(
        room,
        furniture,
        x,
        y
      )
        width =
          furniture.width.to_i

        height =
          furniture.height.to_i

        room
          .room_furnitures
          .includes(:furniture)
          .none? do |item|
            item_width =
              item.furniture.width.to_i

            item_height =
              item.furniture.height.to_i

            x <
              item.x.to_i + item_width &&
              x + width >
                item.x.to_i &&
              y <
                item.y.to_i + item_height &&
              y + height >
                item.y.to_i
          end
      end

      def serialize_room_furniture(
        room_furniture
      )
        furniture =
          room_furniture.furniture

        {
          id: room_furniture.id,
          furniture_id: furniture.id,
          name: furniture.name,
          image_key: furniture.image_url,
          width: furniture.width.to_i,
          height: furniture.height.to_i,
          x: room_furniture.x.to_i,
          y: room_furniture.y.to_i,
          z: room_furniture.z.to_i,
          rotation: room_furniture.rotation.to_i,

          interest: {
            id: furniture.interest.id,
            name: furniture.interest.name
          }
        }
      end
    end
  end
end
