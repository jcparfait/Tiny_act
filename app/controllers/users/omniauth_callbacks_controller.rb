require "uri"

class Users::OmniauthCallbacksController <
      Devise::OmniauthCallbacksController
  skip_before_action :verify_authenticity_token,
                     only: %i[
                       google_oauth2
                       facebook
                     ]

  def google_oauth2
    complete_oauth
  end

  def facebook
    complete_oauth
  end

  def failure
    redirect_to(
      url_with_query(
        oauth_return_url,
        error: "La connexion a été annulée."
      ),
      allow_other_host: true
    )
  end

  private

  def complete_oauth
    return_url = oauth_return_url

    user = OauthIdentity.user_from_omniauth!(
      request.env.fetch("omniauth.auth")
    )

    code = MobileOauthCode.issue_for!(user)

    redirect_to(
      url_with_query(return_url, code: code),
      allow_other_host: true
    )
  rescue StandardError => e
    Rails.logger.error(
      "Erreur OAuth : #{e.class} - #{e.message}"
    )

    redirect_to(
      url_with_query(
        return_url || configured_return_url,
        error: "Impossible de terminer la connexion."
      ),
      allow_other_host: true
    )
  end

  def oauth_return_url
    session.delete(:mobile_oauth_return_to).presence ||
      configured_return_url
  end

  def configured_return_url
    ENV["MOBILE_OAUTH_REDIRECT_URL"].presence ||
      Rails.application.credentials.dig(
        :mobile,
        :oauth_redirect_url
      ) ||
      "http://localhost:8081/oauth-callback"
  end

  def url_with_query(url, values)
    uri = URI.parse(url)

    existing_query =
      Rack::Utils.parse_nested_query(uri.query)

    uri.query =
      Rack::Utils.build_query(
        existing_query.merge(values.stringify_keys)
      )

    uri.to_s
  end
end
