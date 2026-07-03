require "test_helper"

class Api::V1::ActivitySessionsControllerTest < ActionDispatch::IntegrationTest
  test "create recommends mobile enabled activities for the selected criteria" do
    user = create_user!
    interest = Interest.create!(name: "Code #{SecureRandom.hex(4)}")
    user.user_interests.create!(interest: interest)

    activity = create_activity!(
      interest: interest,
      mood_name: "En forme",
      duration_value: 15,
      location_name: "Maison"
    )

    post "/api/v1/activity_sessions",
         params: {
           activity_session: {
             mood_id: activity.mood_id,
             location_id: activity.location_id,
             duration_id: activity.duration_id
           }
         },
         headers: api_headers_for(user)

    assert_response :created

    payload = json_response
    created_session = user.activity_sessions.last

    assert_equal created_session.id, payload.dig("activity_session", "id")
    assert_equal "selecting", payload.dig("activity_session", "status")
    assert_equal false, payload.dig("activity_session", "finished")
    assert_includes payload["activities"].map { |item| item["id"] }, activity.id
    assert_includes created_session.candidate_activity_ids.map(&:to_i), activity.id
  end

  test "create returns not found when the user has no matching mobile activity" do
    user = create_user!
    mood = Mood.create!(name: "À plat")
    duration = Duration.create!(value: 5)
    location = Location.create!(name: "Maison")

    post "/api/v1/activity_sessions",
         params: {
           activity_session: {
             mood_id: mood.id,
             location_id: location.id,
             duration_id: duration.id
           }
         },
         headers: api_headers_for(user)

    assert_response :not_found
    assert_equal "Aucune activité trouvée avec ces critères.", json_response["error"]
  end

  test "mobile session can be selected started paused resumed finished and rewarded" do
    user = create_user!
    interest = Interest.create!(name: "Culture #{SecureRandom.hex(4)}")
    user.user_interests.create!(interest: interest)

    activity = create_activity!(
      interest: interest,
      mood_name: "En forme",
      duration_value: 15,
      location_name: "Maison"
    )

    furniture = Furniture.create!(
      interest: interest,
      name: "Tiny desk #{SecureRandom.hex(4)}",
      image_url: "tiny_desk",
      required_xp: 1,
      width: 1,
      height: 1
    )

    activity_session = user.activity_sessions.create!(
      activity: activity,
      candidate_activity_ids: [activity.id],
      date: Date.current,
      elapsed_seconds: 0,
      status: "selecting"
    )

    headers = api_headers_for(user)

    patch "/api/v1/activity_sessions/#{activity_session.id}/select_activity",
          params: { activity_id: activity.id },
          headers: headers

    assert_response :success
    assert_equal "preview", json_response.dig("activity_session", "status")

    patch "/api/v1/activity_sessions/#{activity_session.id}/start", headers: headers

    assert_response :success
    assert_equal "in_progress", json_response.dig("activity_session", "status")
    assert json_response.dig("activity_session", "timer_started_at").present?

    patch "/api/v1/activity_sessions/#{activity_session.id}/pause",
          params: { elapsed_seconds: 42 },
          headers: headers

    assert_response :success
    assert_equal "paused", json_response.dig("activity_session", "status")
    assert_equal 42, json_response.dig("activity_session", "elapsed_seconds")

    patch "/api/v1/activity_sessions/#{activity_session.id}/resume", headers: headers

    assert_response :success
    assert_equal "in_progress", json_response.dig("activity_session", "status")

    patch "/api/v1/activity_sessions/#{activity_session.id}/finish",
          params: { elapsed_seconds: 120 },
          headers: headers

    assert_response :success
    assert_equal "finished", json_response.dig("activity_session", "status")
    assert_equal true, json_response.dig("activity_session", "finished")

    activity_session.reload

    assert_equal 22, activity_session.xp_earned
    assert activity_session.xp_awarded_at.present?
    assert_includes activity_session.newly_unlocked_furniture_ids.map(&:to_i), furniture.id

    get "/api/v1/activity_sessions/#{activity_session.id}/reward", headers: headers

    assert_response :success

    reward = json_response

    assert_equal 22, reward["xp_earned"]
    assert_equal 22, reward["total_xp"]
    assert_equal interest.id, reward.dig("interest", "id")
    assert_includes reward["newly_unlocked_furnitures"].map { |item| item["id"] }, furniture.id
  end
end
