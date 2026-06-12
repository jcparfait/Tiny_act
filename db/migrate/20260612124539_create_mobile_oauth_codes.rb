class CreateMobileOauthCodes < ActiveRecord::Migration[8.1]
  def change
    create_table :mobile_oauth_codes do |t|
      t.references :user, null: false, foreign_key: true
      t.string :code_digest, null: false
      t.datetime :expires_at, null: false
      t.datetime :used_at

      t.timestamps
    end

    add_index :mobile_oauth_codes,
              :code_digest,
              unique: true
  end
end
