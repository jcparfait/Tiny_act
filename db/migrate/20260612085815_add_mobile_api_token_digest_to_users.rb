class AddMobileApiTokenDigestToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :mobile_api_token_digest, :string

    add_index :users,
              :mobile_api_token_digest,
              unique: true
  end
end
