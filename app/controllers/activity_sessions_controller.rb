class ActivitySessionsController < BaseController
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
    end
  end

  def load_random_language_items(item_type)
    language = LanguageItem
               .where(item_type: item_type)
               .distinct
               .pluck(:language)
               .sample

    return if language.blank?

    @language = language

    @language_items = LanguageItem
                      .where(item_type: item_type, language: language)
                      .order(Arel.sql("RANDOM()"))
                      .limit(5)
  end

  def assign_language_if_needed
    return unless @activities.any?(&:language_activity?)
    return if @activity_session.language.present?

    language = LanguageItem.distinct.pluck(:language).sample
    @activity_session.update!(language: language) if language.present?
  end

  def readable_language(language)
    {
      "english" => "anglais",
      "spanish" => "espagnol"
    }[language]
  end

  def activity_session_params
    params.require(:activity_session).permit(:culture_category)
  end

  def record_new_furniture_unlocks_for(activity_session)
    interest = activity_session.activity.interest
    locked_furnitures_before_reward = locked_furnitures_for(activity_session.user, interest)

    XpCalculator.award!(activity_session)

    current_xp = XpCalculator.total_for_interest(activity_session.user, interest)
    newly_unlocked_furniture_ids = locked_furnitures_before_reward
                                   .select { |furniture| furniture.required_xp.to_i <= current_xp }
                                   .map(&:id)

    activity_session.update!(
      newly_unlocked_furniture_ids: newly_unlocked_furniture_ids,
      furniture_unlocks_seen_at: nil
    )
  end

  def locked_furnitures_for(user, interest)
    current_xp = XpCalculator.total_for_interest(user, interest)

    Furniture
      .where(interest: interest)
      .where("required_xp > ?", current_xp)
      .order(:required_xp, :id)
  end

  def prepare_finished_summary
    @activity = @activity_session.activity
    @summary_interest_name = @activity&.interest&.name.presence || "Activité"

    @summary_duration_minutes = @activity&.duration&.value.to_i
    @summary_duration_label = if @summary_duration_minutes.positive?
                                "#{@summary_duration_minutes} min"
                              else
                                "Durée non renseignée"
                              end

    @summary_saved_scroll_minutes = @summary_duration_minutes.positive? ? @summary_duration_minutes : 15
    @summary_xp_gained = @activity_session.awarded_xp
    @newly_unlocked_furnitures = newly_unlocked_furnitures_for_summary
  end

  def newly_unlocked_furnitures_for_summary
    return Furniture.none if @activity_session.furniture_unlocks_seen_at.present?

    furniture_ids = @activity_session.newly_unlocked_furniture_ids.map(&:to_i)
    return Furniture.none if furniture_ids.empty?

    furnitures = Furniture
                 .includes(:interest)
                 .where(id: furniture_ids)
                 .sort_by { |furniture| furniture_ids.index(furniture.id) || furniture_ids.size }

    @activity_session.update!(furniture_unlocks_seen_at: Time.current)

    furnitures
  end

  # =========================
  # HOME NOTIFICATIONS
  # =========================

  def build_home_notifications
    notifications = [
      pending_activity_notification,
      room_progress_notification,
      daily_streak_notification
    ].compact

    add_notification_counters(notifications)
  end

  def add_notification_counters(notifications)
    total = notifications.size

    notifications.each_with_index.map do |notification, index|
      notification.merge(counter: "#{index + 1}/#{total}")
    end
  end

  def pending_activity_notification
    pending_activity_session = latest_pending_activity_session

    return if pending_activity_session.blank?

    activity = pending_activity_session.activity

    {
      kind: :pending,
      priority: 1,
      label: "REPRENDRE",
      title: activity.name.presence || "Activité en cours",
      subtitle: pending_activity_subtitle(pending_activity_session),
      icon_type: :play,
      url: activity_path(
        activity,
        activity_session_id: pending_activity_session.id
      ),
      tab_class: "tab-purple",
      decoration_class: nil
    }
  end

  def room_progress_notification
    next_unlock = closest_next_furniture_unlock

    return if next_unlock.blank?

    {
      kind: :room,
      priority: 2,
      label: "PROGRESSION",
      title: "Ta room progresse",
      subtitle: room_progress_subtitle(next_unlock),
      icon_type: :room,
      url: room_path(current_user.room),
      tab_class: "tab-gold",
      decoration_class: nil
    }
  end

  def room_progress_subtitle(next_unlock)
    "Plus que #{next_unlock[:remaining_xp]} XP en #{next_unlock[:interest].name} " \
      "pour débloquer #{next_unlock[:furniture].name}."
  end

  def closest_next_furniture_unlock
    interests = current_user.interests.to_a
    return if interests.empty?

    xp_by_interest_id = interests.index_with do |interest|
      XpCalculator.total_for_interest(current_user, interest)
    end.transform_keys(&:id)

    Furniture
      .includes(:interest)
      .where(interest: interests)
      .filter_map do |furniture|
        current_xp = xp_by_interest_id[furniture.interest_id].to_i
        remaining_xp = furniture.required_xp.to_i - current_xp

        next if remaining_xp <= 0

        {
          furniture: furniture,
          interest: furniture.interest,
          remaining_xp: remaining_xp
        }
      end
      .min_by do |unlock|
        [
          unlock[:remaining_xp],
          unlock[:furniture].required_xp.to_i,
          unlock[:furniture].id
        ]
      end
  end

  def daily_streak_notification
    today_count = finished_sessions_today_count

    return if today_count.zero?

    {
      kind: :streak,
      priority: 3,
      label: "SÉRIE",
      title: current_streak_title,
      subtitle: "#{today_count}/#{daily_bonus_goal} actions faites aujourd’hui",
      icon_type: :star_mascot,
      url: new_activity_session_path,
      tab_class: "tab-green",
      decoration_class: nil
    }
  end

  def latest_pending_activity_session
    current_user
      .activity_sessions
      .includes(activity: %i[interest duration])
      .where(finished: false, status: ["in_progress", "paused"])
      .order(updated_at: :desc)
      .first
  end

  def pending_activity_subtitle(activity_session)
    activity = activity_session.activity

    interest_name = activity_interest_name(activity)
    duration_label = activity_duration_label(activity)
    elapsed_label = elapsed_activity_label(activity_session)

    [interest_name, duration_label, elapsed_label].compact.join(" • ")
  end

  def elapsed_activity_label(activity_session)
    elapsed_seconds = activity_session.elapsed_seconds.to_i

    return if elapsed_seconds <= 0

    minutes = elapsed_seconds / 60
    seconds = elapsed_seconds % 60

    if minutes.positive?
      "#{minutes} min #{seconds.to_s.rjust(2, '0')} déjà faites"
    else
      "#{seconds}s déjà faites"
    end
  end

  def prepare_room_progress
    @room_reward_threshold_xp = ROOM_REWARD_XP
    @room_total_xp = current_user_total_xp
    @room_rewards_unlocked = @room_total_xp / ROOM_REWARD_XP

    current_cycle_xp = @room_total_xp % ROOM_REWARD_XP

    if current_cycle_xp.zero? && @room_total_xp.positive?
      @room_progress_percent = 100
      @room_xp_before_reward = 0
    else
      @room_progress_percent = ((current_cycle_xp.to_f / ROOM_REWARD_XP) * 100).round
      @room_xp_before_reward = ROOM_REWARD_XP - current_cycle_xp
    end
  end

  def current_user_total_xp
    XpCalculator.total_for(current_user)
  end

  def finished_sessions_count
    return @finished_sessions_count if defined?(@finished_sessions_count) && @finished_sessions_count.present?

    @finished_sessions_count = current_user
                               .activity_sessions
                               .where(finished: true)
                               .count
  end

  def actions_needed_for_reward
    3
  end

  def daily_bonus_goal
    3
  end

  def finished_sessions_today_count
    current_user
      .activity_sessions
      .where(finished: true, date: Date.current)
      .count
  end

  def current_streak_title
    streak_days = current_streak_days

    if streak_days > 1
      "#{streak_days} jours de suite"
    else
      "Belle action aujourd’hui"
    end
  end

  def current_streak_days
    finished_dates = current_user
                     .activity_sessions
                     .where(finished: true)
                     .where.not(date: nil)
                     .distinct
                     .order(date: :desc)
                     .pluck(:date)

    return 0 if finished_dates.empty?

    streak = 0
    expected_date = Date.current

    finished_dates.each do |date|
      if date == expected_date
        streak += 1
        expected_date -= 1.day
      elsif date < expected_date
        break
      end
    end

    streak
  end

  def activity_interest_name(activity)
    activity&.interest&.name.presence
  end

  def activity_duration_label(activity)
    minutes = activity&.duration&.value.to_i

    return if minutes <= 0

    "#{minutes} min"
  end
end
