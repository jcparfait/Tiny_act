class ActivitySessionsController < ApplicationController
  ROOM_REWARD_XP = 120

  include TopbarDatas

  def index
    @activity_sessions = current_user.activity_sessions.where(finished: true).includes(activity: :interest).order(updated_at: :desc)
  end

  def new
    @moods = Mood.all

    prepare_room_progress

    @home_notifications = build_home_notifications
  end

  def location
    if params[:mood_id].blank?
      redirect_to new_activity_session_path, alert: "Choisis d'abord ton mood."
      return
    end

    @mood_id = params[:mood_id]
    @locations = Location.where.not(name: "N'importe où")
  end

  def duration
    if params[:mood_id].blank? || params[:location_id].blank?
      redirect_to new_activity_session_path, alert: "Recommence tes choix."
      return
    end

    @mood_id = params[:mood_id]
    @location_id = params[:location_id]
    @durations = Duration.order(:value)
  end

  def create
    activity = matching_activities.order(Arel.sql("RANDOM()")).first

    if activity
      @activity_session = current_user.activity_sessions.create!(
        activity: activity,
        date: Date.current,
        status: "selecting",
        elapsed_seconds: 0
      )

      redirect_to activity_session_path(@activity_session)
    else
      redirect_to new_activity_session_path, alert: "Aucune activité trouvée."
    end
  end

  def show
    @activity_session = current_user.activity_sessions.find(params[:id])

    if @activity_session.finished?
      prepare_finished_summary
      return
    end

    reference_activity = @activity_session.activity

    @activities = activity_recommendations_for(
      @activity_session,
      reference_activity
    )

    assign_language_if_needed
    @language_label = readable_language(@activity_session.language)
  end

  def update
    @activity_session = current_user.activity_sessions.find(params[:id])

    if params[:activity_session].present?
      @activity_session.update!(activity_session_params)

      redirect_back fallback_location: activity_path(
        @activity_session.activity,
        activity_session_id: @activity_session.id
      )
    else
      was_already_finished = @activity_session.finished?

      @activity_session.update!(
        finished: true,
        status: "finished"
      )

      record_new_furniture_unlocks_for(@activity_session) unless was_already_finished

      redirect_to activity_session_path(@activity_session)
    end
  end

  def start
    @activity_session = current_user.activity_sessions.find(params[:id])

    return redirect_to activity_session_path(@activity_session) if @activity_session.finished?

    @activity_session.update!(
      status: "in_progress",
      timer_started_at: Time.current
    )

    head :ok
  end

  def progress
    @activity_session = current_user.activity_sessions.find(params[:id])

    return head :not_found if @activity_session.finished?

    # Important : si l'activité est en pause, un vieux timer JS ne doit pas
    # remettre automatiquement la session en "in_progress".
    return head :ok if @activity_session.paused?

    elapsed_seconds = safe_elapsed_seconds

    @activity_session.update!(
      elapsed_seconds: elapsed_seconds,
      status: "in_progress"
    )

    head :ok
  end

  def pause
    @activity_session = current_user.activity_sessions.find(params[:id])

    return head :not_found if @activity_session.finished?

    @activity_session.update!(
      elapsed_seconds: safe_elapsed_seconds,
      status: "paused"
    )

    head :ok
  end

  def resume
    @activity_session = current_user.activity_sessions.find(params[:id])

    return head :not_found if @activity_session.finished?

    @activity_session.update!(
      status: "in_progress",
      timer_started_at: Time.current
    )

    head :ok
  end

  def abandon
    @activity_session = current_user.activity_sessions.find(params[:id])

    return redirect_to new_activity_session_path if @activity_session.finished?

    @activity_session.update!(
      status: "paused"
    )

    redirect_to new_activity_session_path
  end

  private

  def safe_elapsed_seconds
    elapsed_seconds = params[:elapsed_seconds].to_i
    elapsed_seconds = 0 if elapsed_seconds.negative?
    elapsed_seconds
  end

  def activity_recommendations_for(activity_session, reference_activity)
    if activity_session.candidate_activity_ids.present?
      return activities_in_saved_order(activity_session.candidate_activity_ids)
    end

    activities = generate_activity_recommendations(reference_activity)

    activity_session.update!(
      candidate_activity_ids: activities.map(&:id)
    )

    activities
  end

  def activities_in_saved_order(activity_ids)
    ids = activity_ids.map(&:to_i)

    activities_by_id = Activity
                       .includes(:interest)
                       .where(id: ids)
                       .index_by(&:id)

    ids.filter_map { |id| activities_by_id[id] }
  end

  def generate_activity_recommendations(reference_activity)
    matching_activities = Activity.where(
      active: true,
      mood: reference_activity.mood,
      duration: reference_activity.duration,
      interest_id: current_user.interests.ids,
      location_id: allowed_location_ids(reference_activity.location_id)
    )

    matching_activities
      .includes(:interest)
      .group_by(&:interest_id)
      .values
      .map(&:sample)
      .compact
      .sample(3)
  end

  def matching_activities
    scope = Activity.where(
      active: true,
      mood_id: params[:mood_id],
      duration_id: params[:duration_id],
      interest_id: current_user.interest_ids,
      location_id: allowed_location_ids(params[:location_id])
    )

    apply_temporary_activity_rules(scope, params[:duration_id])
  end

  def apply_temporary_activity_rules(scope, duration_id)
    duration_value = Duration.find_by(id: duration_id)&.value.to_i

    case duration_value
    when 5
      scope.where.not(activity_type: ["sentence_completion", "llm_chat"])
    when 15
      scope.where.not(activity_type: ["word_learning", "llm_chat"])
    when 30
      scope.where.not(activity_type: ["word_learning", "sentence_completion", "llm_chat", "code_quiz"])
    else
      scope
    end
  end

  def allowed_location_ids(selected_location_id)
    ids = [selected_location_id]

    anywhere = Location.find_by(name: "N'importe où")
    ids << anywhere.id if anywhere.present?

    ids
  end

  def load_language_items(activity)
    case activity.activity_type
    when "word_learning"
      load_random_language_items("word")
    when "sentence_completion"
      load_random_language_items("sentence")
    else
      []
    end
  end

  def assign_language_if_needed
    return unless @activity_session.activity.language_activity?
    return if @activity_session.language.present?

    language = LanguageItem
               .where(item_type: language_item_type)
               .distinct
               .pluck(:language)
               .sample

    @activity_session.update!(language: language) if language.present?
  end

  def language_items_for(activity)
    return [] unless activity.language_activity?
    return [] if @activity_session.language.blank?

    LanguageItem
      .where(
        item_type: language_item_type,
        language: @activity_session.language
      )
      .order(Arel.sql("RANDOM()"))
      .limit(30)
  end

  def language_item_type
    case @activity_session.activity.activity_type
    when "word_learning"
      "word"
    when "sentence_completion"
      "sentence"
    end
  end

  def load_random_language_items(item_type)
    LanguageItem
      .where(item_type: item_type)
      .order(Arel.sql("RANDOM()"))
      .limit(30)
  end

  def readable_language(language)
    {
      "english" => "anglais",
      "spanish" => "espagnol"
    }[language] || language
  end

  def activity_session_params
    params.require(:activity_session).permit(:activity_id)
  end

  def prepare_finished_summary
    @earned_xp = XpCalculator.awarded_xp_for(@activity_session)
    @total_xp = XpCalculator.total_for(current_user)
    @interest_xp = XpCalculator.total_for_interest(
      current_user,
      @activity_session.activity.interest
    )

    @newly_unlocked_furnitures = newly_unlocked_furnitures_for(@activity_session)
    @next_furniture = next_furniture_for(@activity_session.activity.interest)

    mark_furniture_unlocks_as_seen if @newly_unlocked_furnitures.any?
  end

  def record_new_furniture_unlocks_for(activity_session)
    interest = activity_session.activity.interest

    locked_furnitures_before_reward = locked_furnitures_for(interest)

    XpCalculator.award!(activity_session)

    current_xp = XpCalculator.total_for_interest(current_user, interest)

    newly_unlocked_furniture_ids =
      locked_furnitures_before_reward
      .select do |furniture|
        furniture.required_xp.to_i <= current_xp
      end
      .map(&:id)

    activity_session.update!(
      newly_unlocked_furniture_ids: newly_unlocked_furniture_ids,
      furniture_unlocks_seen_at: nil
    )
  end

  def newly_unlocked_furnitures_for(activity_session)
    return [] if activity_session.furniture_unlocks_seen_at.present?

    Furniture
      .where(id: Array(activity_session.newly_unlocked_furniture_ids))
      .order(:required_xp, :id)
  end

  def mark_furniture_unlocks_as_seen
    @activity_session.update!(furniture_unlocks_seen_at: Time.current)
  end

  def next_furniture_for(interest)
    current_xp = XpCalculator.total_for_interest(current_user, interest)

    Furniture
      .where(interest: interest)
      .where("required_xp > ?", current_xp)
      .order(:required_xp, :id)
      .first
  end

  def locked_furnitures_for(interest)
    current_xp = XpCalculator.total_for_interest(current_user, interest)

    Furniture
      .where(interest: interest)
      .where("required_xp > ?", current_xp)
      .order(:required_xp, :id)
  end

  def prepare_room_progress
    selected_interests = current_user.interests.to_a
    return if selected_interests.empty?

    @room_total_xp = XpCalculator.total_for(current_user)
    @next_room_furniture = closest_next_room_furniture_for(selected_interests)
  end

  def closest_next_room_furniture_for(interests)
    interests
      .filter_map do |interest|
        next_furniture = next_furniture_for(interest)
        next unless next_furniture

        current_xp = XpCalculator.total_for_interest(current_user, interest)

        {
          furniture: next_furniture,
          interest: interest,
          remaining_xp: [next_furniture.required_xp.to_i - current_xp, 0].max
        }
      end
      .min_by { |item| [item[:remaining_xp], item[:furniture].required_xp.to_i] }
  end

  def build_home_notifications
    notifications = []

    if @next_room_furniture.present?
      notifications << {
        title: "Prochain déblocage",
        body: "Plus que #{@next_room_furniture[:remaining_xp]} XP en #{@next_room_furniture[:interest].name} pour débloquer #{@next_room_furniture[:furniture].name}."
      }
    end

    notifications
  end
end
