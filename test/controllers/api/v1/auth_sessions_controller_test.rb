require "test_helper"

class Api::V1::AuthSessionsControllerTest < ActionDispatch::IntegrationTest
  test "login returns a bearer token and serialized user" do
    user = create_user!(
      email: "mobile-login@example.com",
      password: "secret123"
    )

    post "/api/v1/auth/login", params: {
      email: " mobile-login@example.com ",
      password: "secret123"
    }

    assert_response :success

    payload = json_response

    assert payload["token"].present?
    assert_equal user.id, payload.dig("user", "id")
    assert_equal "mobile-login@example.com", payload.dig("user", "email")
    assert_equal [], payload.dig("user", "interest_ids")
    assert_equal false, payload.dig("user", "onboarding_complete")
  end

  test "login rejects invalid credentials" do
    create_user!(
      email: "wrong-password@example.com",
      password: "secret123"
    )

    post "/api/v1/auth/login", params: {
      email: "wrong-password@example.com",
      password: "bad-password"
    }

    assert_response :unauthorized
    assert_equal "Email ou mot de passe incorrect.", json_response["error"]
  end

  test "protected endpoints require a bearer token" do
    get "/api/v1/auth/me"

    assert_response :unauthorized
    assert_equal "Authentification requise.", json_response["error"]
  end

  test "logout revokes the current mobile token" do
    user = create_user!(email: "logout@example.com")
    token = bearer_token_for(user)
    headers = { "Authorization" => "Bearer #{token}" }

    get "/api/v1/auth/me", headers: headers

    assert_response :success
    assert_equal user.id, json_response.dig("user", "id")

    delete "/api/v1/auth/logout", headers: headers

    assert_response :no_content

    get "/api/v1/auth/me", headers: headers

    assert_response :unauthorized
  end
end
