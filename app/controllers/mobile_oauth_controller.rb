class MobileOauthController < ApplicationController
  ALLOWED_PROVIDERS = %w[
    google_oauth2
    facebook
  ].freeze

  skip_before_action :authenticate_user!

  def start
    provider = params[:provider].to_s
    return_to = params[:return_to].to_s

    unless ALLOWED_PROVIDERS.include?(provider)
      head :not_found
      return
    end

    unless Devise.omniauth_configs.key?(provider.to_sym)
      render plain: "Ce fournisseur n'est pas configuré.",
             status: :service_unavailable

      return
    end

    unless valid_return_url?(return_to)
      render plain: "Adresse de retour invalide.",
             status: :unprocessable_entity

      return
    end

    session[:mobile_oauth_return_to] = return_to

    @provider = provider
    @authorization_path =
      public_send(
        "user_#{provider}_omniauth_authorize_path"
      )
  end

  private

  def valid_return_url?(return_to)
    return false if return_to.blank?

    ActiveSupport::SecurityUtils.secure_compare(
      return_to,
      configured_return_url
    )
  end

  def configured_return_url
    ENV["MOBILE_OAUTH_REDIRECT_URL"].presence ||
      Rails.application.credentials.dig(
        :mobile,
        :oauth_redirect_url
      ) ||
      "http://localhost:8081/oauth-callback"
  end
end
