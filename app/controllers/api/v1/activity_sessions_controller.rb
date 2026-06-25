module Api
  module V1
    class ActivitySessionsController < BaseController
      QUIZ_QUESTIONS_LIMIT = 10
      LANGUAGE_ITEMS_LIMIT = 30

      MOBILE_DISABLED_INTEREST_NAMES = [
        "Productivité",
        "Productivite",
        "Photo",
        "Bien-être",
        "Bien etre",
        "Bien être",
        "Bien-etre",
        "Dessin",
        "Dessins"
      ].freeze

      def index
        user = current_api_user!
        return unless user

        activity_sessions = user
                            .activity_sessions
                            .includes(activity: %i[interest duration location mood])
                            .order(created_at: :desc)
                            .limit(30)

        render json: activity_sessions.map { |activity_session|
          serialize_activity_session_summary(activity_session)
        }
      end

      def create
        user = current_api_user!
        return unless user

        activity = matching_activities_for(user)
                   .order(Arel.sql("RANDOM()"))
                   .first

        unless activity
          render json: {
            error: "Aucune activité trouvée avec ces critères."
          }, status: :not_found

          return
        end

        activity_session = user.activity_sessions.create!(
          activity: activity,
          date: Date.current,
          status: "selecting",
          elapsed_seconds: 0
        )

        recommendations = activity_recommendations_for(user, activity)

        activity_session.update!(
          candidate_activity_ids: recommendations.map(&:id)
        )

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activities: recommendations.map do |recommended_activity|
            serialize_activity(recommended_activity)
          end
        }, status: :created
      end

      def show
        user = current_api_user!
        return unless user

        activity_session = user.activity_sessions.find(params[:id])

        activities =
          if activity_session.candidate_activity_ids.present?
            activities_in_saved_order(
              activity_session.candidate_activity_ids
            )
          else
            [activity_session.activity]
          end

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activities: activities.map do |activity|
            serialize_activity(
              activity,
              activity_session: activity_session,
              include_payload: activity.id == activity_session.activity_id
            )
          end
        }
      end

      def select_activity
        user = current_api_user!
        return unless user

        activity_session = user.activity_sessions.find(params[:id])
        activity = Activity.includes(:interest).find(params.require(:activity_id))

        candidate_ids = Array(
          activity_session.candidate_activity_ids
        ).map(&:to_i)

        unless candidate_ids.include?(activity.id) && mobile_enabled_activity?(activity)
          render json: {
            error: "Cette activité ne fait pas partie des recommandations."
          }, status: :unprocessable_entity

          return
        end

        activity_session.update!(
          activity: activity,
          status: "preview"
        )

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activity: serialize_activity(
            activity,
            activity_session: activity_session,
            include_payload: true
          )
        }
      end

      def start
        user = current_api_user!
        return unless user

        activity_session = user.activity_sessions.find(params[:id])

        if activity_session.finished?
          render json: {
            error: "Cette session est déjà terminée."
          }, status: :unprocessable_entity

          return
        end

        activity_session.update!(
          status: "in_progress",
          timer_started_at: Time.current
        )

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activity: serialize_activity(
            activity_session.activity,
            activity_session: activity_session,
            include_payload: true
          )
        }
      end

      def pause
        user = current_api_user!
        return unless user

        activity_session = user.activity_sessions.find(params[:id])

        if activity_session.finished?
          render json: {
            error: "Cette session est déjà terminée."
          }, status: :unprocessable_entity

          return
        end

        activity_session.update!(
          elapsed_seconds: safe_elapsed_seconds,
          status: "paused"
        )

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activity: serialize_activity(
            activity_session.activity,
            activity_session: activity_session,
            include_payload: true
          )
        }
      end

      def resume
        user = current_api_user!
        return unless user

        activity_session = user.activity_sessions.find(params[:id])

        if activity_session.finished?
          render json: {
            error: "Cette session est déjà terminée."
          }, status: :unprocessable_entity

          return
        end

        activity_session.update!(
          status: "in_progress",
          timer_started_at: Time.current
        )

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activity: serialize_activity(
            activity_session.activity,
            activity_session: activity_session,
            include_payload: true
          )
        }
      end

      def finish
        user = current_api_user!
        return unless user

        activity_session = user.activity_sessions.find(params[:id])
        was_already_finished = activity_session.finished?

        activity_session.update!(
          elapsed_seconds: safe_elapsed_seconds,
          finished: true,
          status: "finished"
        )

        record_new_furniture_unlocks_for(activity_session) unless was_already_finished

        render json: {
          activity_session: serialize_activity_session(activity_session),
          activity: serialize_activity(
            activity_session.activity,
            activity_session: activity_session,
            include_payload: true
          )
        }
      end

      private

      def activity_session_params
        params
          .require(:activity_session)
          .permit(:mood_id, :location_id, :duration_id)
      end

      def matching_activities_for(user)
        interest_ids = mobile_enabled_interest_ids_for(user)

        return Activity.none if interest_ids.empty?

        Activity
          .where(
            active: true,
            interest_id: interest_ids,
            mood_id: activity_session_params[:mood_id],
            duration_id: activity_session_params[:duration_id],
            location_id: allowed_location_ids(
              activity_session_params[:location_id]
            )
          )
      end

      def activity_recommendations_for(user, reference_activity)
        interest_ids = mobile_enabled_interest_ids_for(user)

        return Activity.none if interest_ids.empty?

        Activity
          .where(
            active: true,
            interest_id: interest_ids,
            mood: reference_activity.mood,
            duration: reference_activity.duration,
            location_id: allowed_location_ids(
              reference_activity.location_id
            )
          )
          .includes(:interest, :duration, :location, :mood)
          .group_by(&:interest_id)
          .values
          .map(&:sample)
          .compact
          .sample(3)
      end

      def mobile_enabled_interest_ids_for(user)
        Interest
          .where(id: user.interest_ids)
          .where.not(name: MOBILE_DISABLED_INTEREST_NAMES)
          .pluck(:id)
      end

      def mobile_enabled_activity?(activity)
        activity.interest.present? &&
          MOBILE_DISABLED_INTEREST_NAMES.exclude?(activity.interest.name)
      end

      def activities_in_saved_order(activity_ids)
        ids = activity_ids.map(&:to_i)

        activities_by_id = Activity
                           .includes(
                             :interest,
                             :duration,
                             :location,
                             :mood
                           )
                           .where(id: ids)
                           .index_by(&:id)

        ids.filter_map { |id| activities_by_id[id] }
      end

      def allowed_location_ids(selected_location_id)
        ids = [selected_location_id]

        anywhere = Location.find_by(name: "N'importe où")
        ids << anywhere.id if anywhere.present?

        ids
      end

      def safe_elapsed_seconds
        elapsed_seconds = params[:elapsed_seconds].to_i

        elapsed_seconds.negative? ? 0 : elapsed_seconds
      end

      def serialize_activity_session(activity_session)
        {
          id: activity_session.id,
          status: activity_session.status,
          finished: activity_session.finished,
          elapsed_seconds: activity_session.elapsed_seconds,
          activity_id: activity_session.activity_id,
          timer_started_at: activity_session.timer_started_at,
          language: activity_session.language
        }
      end

      def serialize_activity_session_summary(activity_session)
        {
          id: activity_session.id,
          status: activity_session.status,
          finished: activity_session.finished,
          elapsed_seconds: activity_session.elapsed_seconds,
          activity_id: activity_session.activity_id,
          timer_started_at: activity_session.timer_started_at,
          language: activity_session.language,
          xp_earned: activity_session.xp_earned,
          created_at: activity_session.created_at,
          updated_at: activity_session.updated_at,
          activity: serialize_activity(activity_session.activity)
        }
      end

      def serialize_activity(
        activity,
        activity_session: nil,
        include_payload: false
      )
        serialized = {
          id: activity.id,
          name: activity.name,
          description: activity.description.presence || activity.content,
          content: activity.content,
          activity_type: activity.activity_type,
          interest: {
            id: activity.interest.id,
            name: activity.interest.name
          },
          duration: {
            id: activity.duration.id,
            value: activity.duration.value,
            label: "#{activity.duration.value} min"
          },
          location: {
            id: activity.location.id,
            name: activity.location.name
          },
          mood: {
            id: activity.mood.id,
            name: activity.mood.name
          }
        }

        if include_payload
          serialized[:payload] = serialize_activity_payload(
            activity,
            activity_session
          )
        end

        serialized
      end

      def serialize_activity_payload(activity, activity_session)
        base_payload = {
          duration_seconds: activity.duration.value.to_i * 60,
          activity_session_id: activity_session&.id
        }

        if activity.code_quiz?
          base_payload.merge(
            quiz_kind: "code",
            quiz_questions: serialize_code_quiz_questions(activity)
          )
        elsif activity.culture_activity?
          base_payload.merge(
            quiz_kind: "culture",
            quiz_questions: serialize_culture_quiz_questions(activity)
          )
        elsif activity.language_activity?
          assign_language_if_needed(activity, activity_session)

          base_payload.merge(
            language: activity_session&.language,
            language_label: readable_language(
              activity_session&.language
            ),
            language_mode: language_item_type_for(activity),
            language_items: serialize_language_items(
              activity,
              activity_session
            )
          )
        elsif activity.activity_type == "melody"
          base_payload.merge(
            melody: serialize_melody(activity, activity_session)
          )
        else
          base_payload
        end
      end

      def serialize_code_quiz_questions(activity)
        questions_per_family = 4

        questions = CodeQuestion::FAMILY_NAMES.flat_map do |family|
          CodeQuestion.weighted_pool(
            family: family,
            mood_name: activity.mood.name,
            limit: questions_per_family
          )
        end

        questions
          .sample(quiz_questions_limit_for(activity))
          .map { |question| serialize_quiz_question(question) }
      end

      def serialize_culture_quiz_questions(activity)
        CultureQuestion
          .where(
            difficulty: culture_difficulty_for(activity)
          )
          .order(Arel.sql("RANDOM()"))
          .limit(quiz_questions_limit_for(activity))
          .map { |question| serialize_quiz_question(question) }
      end

      def serialize_quiz_question(question)
        {
          id: question.id,
          question: question.question,
          category: question.try(:category),
          family: if question.respond_to?(:family)
                    question.family
                  else
                    question.try(:category)
                  end,
          difficulty: question.try(:difficulty),
          correct_answer: question.correct_answer,
          answers: question.answers
        }
      end

      def quiz_questions_limit_for(activity)
        duration_value = activity.duration.value.to_i

        [
          [duration_value, 5].max,
          QUIZ_QUESTIONS_LIMIT
        ].min
      end

      def culture_difficulty_for(activity)
        case activity.mood.name
        when "À plat"
          "easy"
        when "Mitigé"
          "medium"
        when "En forme"
          "hard"
        else
          "easy"
        end
      end

      def assign_language_if_needed(activity, activity_session)
        return if activity_session.blank?
        return if activity_session.language.present?

        item_type = language_item_type_for(activity)

        language = LanguageItem
                   .where(item_type: item_type)
                   .distinct
                   .pluck(:language)
                   .sample

        return unless language.present?

        activity_session.update!(language: language)
      end

      def serialize_language_items(activity, activity_session)
        item_type = language_item_type_for(activity)

        return [] if item_type.blank?
        return [] if activity_session.blank?
        return [] if activity_session.language.blank?

        LanguageItem
          .where(
            item_type: item_type,
            language: activity_session.language
          )
          .order(Arel.sql("RANDOM()"))
          .limit(LANGUAGE_ITEMS_LIMIT)
          .map do |item|
            {
              id: item.id,
              prompt: item.prompt,
              answer: item.answer,
              translation: item.translation.presence || item.answer,
              item_type: item.item_type,
              language: item.language
            }
          end
      end

      def language_item_type_for(activity)
        case activity.activity_type
        when "word_learning"
          "word"
        when "sentence_completion"
          "sentence"
        end
      end

      def readable_language(language)
        {
          "english" => "anglais",
          "spanish" => "espagnol"
        }[language] || language
      end

      def serialize_melody(activity, activity_session)
        scope = Melody
                .where(
                  difficulty: preferred_melody_difficulty_for(activity)
                )
                .order(:id)

        scope = Melody.order(:id) if scope.none?

        return nil if scope.none?

        offset =
          if activity_session.present?
            activity_session.id.to_i % scope.count
          else
            rand(scope.count)
          end

        melody = scope.offset(offset).first || scope.first

        {
          name: melody.name,
          notes: melody.notes,
          difficulty: melody.difficulty,
          category: melody.category,
          source: melody.source
        }
      end

      def preferred_melody_difficulty_for(activity)
        case activity.mood.name
        when "À plat"
          "easy"
        when "Mitigé"
          "medium"
        when "En forme"
          "hard"
        else
          "easy"
        end
      end

      def record_new_furniture_unlocks_for(activity_session)
        interest = activity_session.activity.interest

        locked_furnitures_before_reward = locked_furnitures_for(
          activity_session.user,
          interest
        )

        XpCalculator.award!(activity_session)

        current_xp = XpCalculator.total_for_interest(
          activity_session.user,
          interest
        )

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

      def locked_furnitures_for(user, interest)
        current_xp = XpCalculator.total_for_interest(
          user,
          interest
        )

        Furniture
          .where(interest: interest)
          .where("required_xp > ?", current_xp)
          .order(:required_xp, :id)
      end
    end
  end
end
