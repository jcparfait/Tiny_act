require "test_helper"

class Api::V1::RoomsControllerTest < ActionDispatch::IntegrationTest
  test "show returns the current user's room inventory and progress" do
    user = create_user!
    interest = Interest.create!(name: "Room interest #{SecureRandom.hex(4)}")
    user.user_interests.create!(interest: interest)

    furniture = Furniture.create!(
      interest: interest,
      name: "Plant #{SecureRandom.hex(4)}",
      image_url: "plant",
      required_xp: 0,
      width: 1,
      height: 1
    )

    get "/api/v1/room", headers: api_headers_for(user)

    assert_response :success

    payload = json_response
    inventory_item = payload["inventory"].find { |item| item["id"] == furniture.id }

    assert_equal user.id, payload.dig("owner", "id")
    assert_equal Room::GRID_WIDTH, payload.dig("room", "width")
    assert_equal Room::GRID_HEIGHT, payload.dig("room", "height")
    assert_equal 0, payload["total_xp"]
    assert inventory_item["unlocked"]
    assert_equal 0, inventory_item["placed_count"]
    assert_equal [interest.id], payload["progress"].map { |item| item.dig("interest", "id") }
  end

  test "user can place move and delete an unlocked furniture" do
    user = create_user!
    interest = Interest.create!(name: "Decor #{SecureRandom.hex(4)}")

    furniture = Furniture.create!(
      interest: interest,
      name: "Chair #{SecureRandom.hex(4)}",
      image_url: "chair",
      required_xp: 0,
      width: 1,
      height: 1
    )

    headers = api_headers_for(user)

    post "/api/v1/room/furnitures",
         params: { furniture_id: furniture.id },
         headers: headers

    assert_response :created

    room_furniture_id = json_response.dig("room_furniture", "id")

    assert_equal furniture.id, json_response.dig("room_furniture", "furniture_id")
    assert_equal 0, json_response.dig("room_furniture", "x")
    assert_equal 0, json_response.dig("room_furniture", "y")

    patch "/api/v1/room/furnitures/#{room_furniture_id}",
          params: { room_furniture: { x: 1, y: 1 } },
          headers: headers

    assert_response :success
    assert_equal 1, json_response.dig("room_furniture", "x")
    assert_equal 1, json_response.dig("room_furniture", "y")
    assert_equal 2, json_response.dig("room_furniture", "z")

    delete "/api/v1/room/furnitures/#{room_furniture_id}", headers: headers

    assert_response :no_content
    assert_equal 0, user.room.room_furnitures.count
  end

  test "user cannot place locked furniture" do
    user = create_user!
    interest = Interest.create!(name: "Locked #{SecureRandom.hex(4)}")

    furniture = Furniture.create!(
      interest: interest,
      name: "Sofa #{SecureRandom.hex(4)}",
      image_url: "sofa",
      required_xp: 999,
      width: 1,
      height: 1
    )

    post "/api/v1/room/furnitures",
         params: { furniture_id: furniture.id },
         headers: api_headers_for(user)

    assert_response :unprocessable_entity
    assert_equal "Tu n’as pas encore assez d’XP pour ce meuble.", json_response["error"]
    assert_equal 0, user.room.room_furnitures.count
  end
end
