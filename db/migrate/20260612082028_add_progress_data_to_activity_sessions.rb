class AddProgressDataToActivitySessions < ActiveRecord::Migration[8.1]
  def change
    add_column :activity_sessions,
               :progress_data,
               :jsonb,
               null: false,
               default: {}
  end
end
