ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "securerandom"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all
    include ActiveSupport::Testing::TimeHelpers

    # Add more helper methods to be used by all tests here...
    def create_user!(email: nil, password: "password", **attributes)
      User.create!(
        {
          email: email || "user-#{SecureRandom.hex(8)}@example.com",
          password: password
        }.merge(attributes)
      )
    end

    def create_activity!(interest: nil, mood_name: "En forme", duration_value: 15, location_name: "Maison", **attributes)
      interest ||= Interest.create!(name: "Interest #{SecureRandom.hex(4)}")
      mood = Mood.find_or_create_by!(name: mood_name)
      duration = ::Duration.find_or_create_by!(value: duration_value)
      location = Location.find_or_create_by!(name: location_name)

      Activity.create!(
        {
          name: "Activity #{SecureRandom.hex(4)}",
          content: "A test activity",
          interest: interest,
          mood: mood,
          duration: duration,
          location: location
        }.merge(attributes)
      )
    end

    def create_finished_session!(user:, activity:, xp_earned: 0, xp_awarded_at: Time.current, **attributes)
      ActivitySession.create!(
        {
          user: user,
          activity: activity,
          date: Date.current,
          finished: true,
          status: "finished",
          xp_earned: xp_earned,
          xp_awarded_at: xp_awarded_at
        }.merge(attributes)
      )
    end
  end
end

class ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  def json_response
    JSON.parse(response.body)
  end

  def bearer_token_for(user)
    user.issue_mobile_api_token!
  end

  def api_headers_for(user)
    {
      "Authorization" => "Bearer #{bearer_token_for(user)}"
    }
  end
end
