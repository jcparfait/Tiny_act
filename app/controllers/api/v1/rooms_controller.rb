module Api
  module V1
    class RoomsController < BaseController
      def show
        room =
          current_api_user.room ||
          current_api_user.create_room!(
            width: Room::GRID_WIDTH,
            height: Room::GRID_HEIGHT
          )

        room.ensure_default_size!

        render json: room_payload(room)
      end

      private

      def room_payload(room)
        selected_interests =
          current_api_user
          .interests
          .order(:name)
          .to_a

        furnitures =
          Furniture
          .includes(:interest)
          .order(
            "interests.name ASC",
            "furnitures.required_xp ASC",
            "furnitures.id ASC"
          )
          .references(:interest)
          .to_a

        total_xp =
          XpCalculator.total_for(current_api_user)

        xp_by_interest_id =
          current_api_user
          .activity_sessions
          .where.not(xp_awarded_at: nil)
          .joins(:activity)
          .group("activities.interest_id")
          .sum(:xp_earned)

        furniture_by_interest_id =
          furnitures.group_by(&:interest_id)

        placed_counts =
          room
          .room_furnitures
          .group(:furniture_id)
          .count

        {
          owner: serialize_api_user(current_api_user),

          total_xp: total_xp,

          room: {
            id: room.id,
            width: room.width,
            height: room.height,

            furnitures:
              room
              .room_furnitures
              .includes(furniture: :interest)
              .order(:z, :id)
              .map do |room_furniture|
                serialize_room_furniture(
                  room_furniture
                )
              end
          },

          inventory: furnitures.map do |furniture|
            required_xp =
              furniture.required_xp.to_i

            {
              id: furniture.id,
              name: furniture.name,
              image_key: furniture.image_url,
              width: furniture.width.to_i,
              height: furniture.height.to_i,
              required_xp: required_xp,
              current_xp: total_xp,
              unlocked: total_xp >= required_xp,

              placed_count:
                placed_counts[furniture.id].to_i,

              interest: {
                id: furniture.interest.id,
                name: furniture.interest.name
              }
            }
          end,

          progress: selected_interests.map do |interest|
            xp =
              xp_by_interest_id[
                interest.id
              ].to_i

            next_required_xp =
              Array(
                furniture_by_interest_id[
                  interest.id
                ]
              )
              .map do |furniture|
                furniture.required_xp.to_i
              end
              .select do |required_xp|
                required_xp > xp
              end
              .min

            {
              interest: {
                id: interest.id,
                name: interest.name
              },

              xp: xp,
              next_required_xp: next_required_xp
            }
          end
        }
      end

      def serialize_room_furniture(
        room_furniture
      )
        furniture = room_furniture.furniture

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
