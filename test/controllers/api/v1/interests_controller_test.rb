require "test_helper"

class Api::V1::InterestsControllerTest < ActionDispatch::IntegrationTest
  test "index returns only mobile enabled interests" do
    user = create_user!
    code = Interest.create!(name: "Code")
    photo = Interest.create!(name: "Photo")

    user.user_interests.create!(interest: code)
    user.user_interests.create!(interest: photo)

    get "/api/v1/interests", headers: api_headers_for(user)

    assert_response :success

    payload = json_response
    interest_names = payload["interests"].map { |interest| interest["name"] }

    assert_includes interest_names, "Code"
    assert_not_includes interest_names, "Photo"
    assert_equal [code.id], payload["selected_interest_ids"]
  end

  test "update stores only valid mobile enabled interests" do
    user = create_user!
    code = Interest.create!(name: "Code")
    photo = Interest.create!(name: "Photo")

    patch "/api/v1/interests",
          params: { interest_ids: [code.id, photo.id, 999_999, code.id] },
          headers: api_headers_for(user)

    assert_response :success

    payload = json_response

    assert_equal [code.id], payload["selected_interest_ids"]
    assert_equal [code.id], payload.dig("user", "interest_ids")
    assert_equal [code.id], user.reload.interest_ids
  end

  test "update rejects an empty mobile selection" do
    user = create_user!
    Interest.create!(name: "Photo")

    patch "/api/v1/interests",
          params: { interest_ids: [] },
          headers: api_headers_for(user)

    assert_response :unprocessable_entity
    assert_equal "Choisis au moins un centre d’intérêt.", json_response["error"]
  end
end
