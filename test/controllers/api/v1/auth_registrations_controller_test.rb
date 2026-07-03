require "test_helper"

class Api::V1::AuthRegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "registration creates a user and returns a mobile token" do
    assert_difference "User.count", 1 do
      post "/api/v1/auth/register", params: {
        user: {
          first_name: "Ada",
          last_name: "Lovelace",
          email: "ada-mobile@example.com",
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    assert_response :created

    payload = json_response
    created_user = User.find_by!(email: "ada-mobile@example.com")

    assert payload["token"].present?
    assert_equal created_user.id, payload.dig("user", "id")
    assert_equal "Ada", payload.dig("user", "first_name")
    assert_equal "Lovelace", payload.dig("user", "last_name")
    assert_equal false, payload.dig("user", "onboarding_complete")
    assert created_user.room.present?
  end

  test "registration returns validation errors" do
    assert_no_difference "User.count" do
      post "/api/v1/auth/register", params: {
        user: {
          email: "bad-registration@example.com",
          password: "short",
          password_confirmation: "different"
        }
      }
    end

    assert_response :unprocessable_entity
    assert json_response["error"].present?
  end
end
