require "digest"

class MobileOauthCode < ApplicationRecord
  EXPIRATION_DELAY = 5.minutes

  belongs_to :user

  validates :code_digest, presence: true, uniqueness: true
  validates :expires_at, presence: true

  def self.issue_for!(user)
    raw_code = SecureRandom.urlsafe_base64(32)

    create!(
      user: user,
      code_digest: digest(raw_code),
      expires_at: EXPIRATION_DELAY.from_now
    )

    raw_code
  end

  def self.consume(raw_code)
    return nil if raw_code.blank?

    transaction do
      oauth_code = lock.find_by(
        code_digest: digest(raw_code)
      )

      return nil if oauth_code.blank?
      return nil if oauth_code.used_at.present?
      return nil if oauth_code.expires_at <= Time.current

      oauth_code.update!(used_at: Time.current)

      oauth_code.user
    end
  end

  def self.digest(raw_code)
    Digest::SHA256.hexdigest(raw_code)
  end
end
