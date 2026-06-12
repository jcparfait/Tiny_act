require "digest"

class User < ApplicationRecord
  AVATARS = (1..24).map { |number| "avatar_#{number.to_s.rjust(2, '0')}" }

  validates :avatar, inclusion: { in: AVATARS }, allow_blank: true

  has_one :room, dependent: :destroy
  has_many :user_interest_progresses, dependent: :destroy
  has_many :activity_sessions, dependent: :destroy
  has_many :user_interests, dependent: :destroy
  has_many :interests, through: :user_interests
  has_many :room_likes, dependent: :destroy
  has_many :liked_rooms, through: :room_likes, source: :room

  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :rememberable,
         :validatable

  after_create :create_default_room
  before_update :revoke_mobile_token_when_password_changes

  def issue_mobile_api_token!
    raw_token = SecureRandom.hex(32)

    update!(
      mobile_api_token_digest: self.class.digest_mobile_api_token(raw_token)
    )

    raw_token
  end

  def revoke_mobile_api_token!
    update!(mobile_api_token_digest: nil)
  end

  def self.find_by_mobile_api_token(raw_token)
    return nil if raw_token.blank?

    find_by(
      mobile_api_token_digest: digest_mobile_api_token(raw_token)
    )
  end

  def self.digest_mobile_api_token(raw_token)
    Digest::SHA256.hexdigest(raw_token)
  end

  private

  def revoke_mobile_token_when_password_changes
    return unless will_save_change_to_encrypted_password?

    self.mobile_api_token_digest = nil
  end

  def create_default_room
    create_room!(
      width: Room::GRID_WIDTH,
      height: Room::GRID_HEIGHT
    )
  end
end
