class OauthIdentity < ApplicationRecord
  belongs_to :user

  validates :provider, presence: true
  validates :uid,
            presence: true,
            uniqueness: { scope: :provider }

  def self.user_from_omniauth!(auth)
    transaction do
      identity = find_by(
        provider: auth.provider,
        uid: auth.uid
      )

      return identity.user if identity.present?

      email = auth.info.email.to_s.strip.downcase

      if email.blank?
        raise ArgumentError,
              "Le fournisseur n'a pas transmis d'adresse email."
      end

      user = User.find_or_initialize_by(email: email)

      first_name =
        auth.info.first_name.presence ||
        auth.info.name.to_s.split.first

      last_name =
        auth.info.last_name.presence ||
        auth.info.name.to_s.split.drop(1).join(" ")

      if user.new_record?
        random_password = Devise.friendly_token.first(32)

        user.assign_attributes(
          first_name: first_name,
          last_name: last_name,
          password: random_password,
          password_confirmation: random_password
        )

        user.save!
      else
        updates = {}

        updates[:first_name] = first_name if user.first_name.blank? && first_name.present?

        updates[:last_name] = last_name if user.last_name.blank? && last_name.present?

        user.update!(updates) if updates.any?
      end

      create!(
        user: user,
        provider: auth.provider,
        uid: auth.uid
      )

      user
    end
  end
end
