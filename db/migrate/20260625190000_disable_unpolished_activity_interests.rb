class DisableUnpolishedActivityInterests < ActiveRecord::Migration[8.1]
  DISABLED_INTEREST_NAMES = [
    "Productivité",
    "Photo",
    "Bien-être",
    "Dessin"
  ].freeze

  def up
    Activity
      .joins(:interest)
      .where(interests: { name: DISABLED_INTEREST_NAMES })
      .update_all(active: false, updated_at: Time.current)
  end

  def down
    Activity
      .joins(:interest)
      .where(interests: { name: DISABLED_INTEREST_NAMES })
      .update_all(active: true, updated_at: Time.current)
  end
end
