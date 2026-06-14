  require "csv"

  puts "🧹 Cleaning database..."

  ActivitySession.destroy_all
  UserInterest.destroy_all
  Activity.destroy_all
  LanguageItem.destroy_all
  CultureQuestion.destroy_all if defined?(CultureQuestion)
  RoomFurniture.destroy_all
  Furniture.destroy_all
  User.destroy_all
  Interest.destroy_all
  Mood.destroy_all
  Location.destroy_all
  Duration.destroy_all

  puts "😊 Creating moods..."

  en_forme = Mood.create!(name: "En forme")
  mitige   = Mood.create!(name: "Mitigé")
  a_plat   = Mood.create!(name: "À plat")

  puts "⏱ Creating durations..."

  five_minutes    = Duration.create!(value: 5)
  fifteen_minutes = Duration.create!(value: 15)
  thirty_minutes  = Duration.create!(value: 30)

  puts "📍 Creating locations..."

  home     = Location.create!(name: "Maison")
  outside  = Location.create!(name: "Extérieur")
  office   = Location.create!(name: "Bureau")
  anywhere = Location.create!(name: "N'importe où")

  puts "🎯 Creating interests..."

  sport          = Interest.create!(name: "Sport")
  wellbeing      = Interest.create!(name: "Bien-être")
  photo_interest = Interest.create!(name: "Photo")
  drawing        = Interest.create!(name: "Dessin")
  languages      = Interest.create!(name: "Langues")
  culture        = Interest.create!(name: "Culture")
  productivite   = Interest.create!(name: "Productivité")
  code           = Interest.create!(name: "Code")
  musique        = Interest.create!(name: "Musique")

 puts "🌍 Creating language activities..."

  Activity.create!(
    name: "Apprendre quelques mots",
    content: "Découvre des mots simples dans une langue choisie au hasard. Lis-les, répète-les, puis essaie de retenir leur traduction.",
    mood: a_plat,
    location: anywhere,
    duration: five_minutes,
    interest: languages,
    activity_type: "word_learning",
    active: true
  )

  Activity.create!(
    name: "Apprendre quelques mots",
    content: "Prends un moment calme pour apprendre plusieurs mots dans une langue choisie au hasard.",
    mood: a_plat,
    location: anywhere,
    duration: fifteen_minutes,
    interest: languages,
    activity_type: "word_learning",
    active: true
  )

  Activity.create!(
    name: "Apprendre quelques mots",
    content: "Découvre quelques mots simples dans une langue choisie au hasard.",
    mood: mitige,
    location: anywhere,
    duration: five_minutes,
    interest: languages,
    activity_type: "word_learning",
    active: true
  )

  Activity.create!(
    name: "Compléter des phrases",
    content: "Complète des phrases simples avec le bon mot dans une langue choisie au hasard.",
    mood: mitige,
    location: anywhere,
    duration: fifteen_minutes,
    interest: languages,
    activity_type: "sentence_completion",
    active: true
  )

  Activity.create!(
    name: "Compléter des phrases",
    content: "Prends le temps de compléter plusieurs phrases simples avec les bons mots.",
    mood: mitige,
    location: anywhere,
    duration: thirty_minutes,
    interest: languages,
    activity_type: "sentence_completion",
    active: true
  )

  Activity.create!(
    name: "Dialogue guidé",
    content: "Pratique une courte conversation dans une langue choisie au hasard.",
    mood: en_forme,
    location: anywhere,
    duration: five_minutes,
    interest: languages,
    activity_type: "llm_chat",
    active: false
  )

  Activity.create!(
    name: "Dialogue guidé",
    content: "Pratique une conversation simple avec un assistant dans une langue choisie au hasard.",
    mood: en_forme,
    location: anywhere,
    duration: fifteen_minutes,
    interest: languages,
    activity_type: "llm_chat",
    active: false
  )

  Activity.create!(
    name: "Dialogue guidé",
    content: "Lance une conversation plus longue pour pratiquer une langue avec un assistant.",
    mood: en_forme,
    location: anywhere,
    duration: thirty_minutes,
    interest: languages,
    activity_type: "llm_chat",
    active: false
  )

  puts "🧠 Creating culture quiz activities..."

  [
    {
      mood: a_plat,
      duration: five_minutes,
      content: "Réponds à quelques questions simples pour réveiller doucement ta curiosité."
    },
    {
      mood: a_plat,
      duration: fifteen_minutes,
      content: "Installe-toi tranquillement et teste ta culture générale avec des questions accessibles."
    },
    {
      mood: a_plat,
      duration: thirty_minutes,
      content: "Prends ton temps pour explorer plusieurs questions de culture générale sans pression."
    },
    {
      mood: mitige,
      duration: five_minutes,
      content: "Challenge rapide : quelques questions pour stimuler ton esprit sans te fatiguer."
    },
    {
      mood: mitige,
      duration: fifteen_minutes,
      content: "Teste tes connaissances avec un quiz équilibré, ni trop facile ni trop intense."
    },
    {
      mood: mitige,
      duration: thirty_minutes,
      content: "Plonge dans un quiz plus complet pour entraîner ta mémoire et ta logique."
    },
    {
      mood: en_forme,
      duration: five_minutes,
      content: "Défi express : affronte quelques questions plus exigeantes."
    },
    {
      mood: en_forme,
      duration: fifteen_minutes,
      content: "Teste-toi avec un quiz plus relevé et garde le rythme."
    },
    {
      mood: en_forme,
      duration: thirty_minutes,
      content: "Lance-toi dans une vraie session de culture générale avec des questions plus ambitieuses."
    }
  ].each do |activity_data|
    Activity.create!(
      name: "Quiz culture générale",
      content: activity_data[:content],
      mood: activity_data[:mood],
      location: anywhere,
      duration: activity_data[:duration],
      interest: culture,
      activity_type: "culture_quiz",
      active: true
    )
  end

  puts "💻 Creating code quiz activities..."

  [
    { mood: en_forme, duration: five_minutes },
    { mood: en_forme, duration: fifteen_minutes },
    { mood: en_forme, duration: thirty_minutes },
    { mood: mitige,   duration: five_minutes },
    { mood: mitige,   duration: fifteen_minutes },
    { mood: mitige,   duration: thirty_minutes },
    { mood: a_plat,   duration: five_minutes },
    { mood: a_plat,   duration: fifteen_minutes },
    { mood: a_plat,   duration: thirty_minutes }
  ].each do |data|
    Activity.create!(
      name: "Quiz code",
      content: "Teste tes connaissances en développement web et IA.",
      mood: data[:mood],
      location: anywhere,
      duration: data[:duration],
      interest: code,
      activity_type: "code_quiz",
      active: true
    )
  end

  puts "🎹 Creating melody activities..."
  [
    { mood: en_forme, duration: five_minutes },
    { mood: mitige,   duration: five_minutes },
    { mood: a_plat,   duration: five_minutes }
  ].each do |data|
    Activity.create!(
      name: "Mélodie",
      content: "Apprends et joue une courte mélodie au synthé.",
      mood: data[:mood],
      location: anywhere,
      duration: data[:duration],
      interest: musique,
      activity_type: "melody",
      active: true
    )
  end

  puts "🧘 Creating non-sport demo activities..."

  Activity.create!(
    name: "Photo insolite",
    content: "Prends une photo de quelque chose que tu n'avais jamais remarqué autour de toi.",
    mood: mitige,
    location: outside,
    duration: fifteen_minutes,
    interest: photo_interest,
    activity_type: "standard",
    active: true
  )
#======= Demo users =========#

  puts "👤 Creating demo users..."
featured_users = [
  ["Jc", "DevTeam", "jc.demo@example.com"],
  ["Tibo", "Devteam", "tibo.demo@example.com"],
  ["David", "DevTeam", "david.demo@example.com"],
  ["Dina", "DevTeam", "dina.demo@example.com"],
  ["Emma", "Durand", "emma.demo@example.com"],
  ["Noah", "Leroy", "noah.demo@example.com"],
  ["Lou", "Roux", "lou.demo@example.com"],
  ["Hugo", "Faure", "hugo.demo@example.com"],
  ["Zoé", "Simon", "zoe.demo@example.com"],
  ["Tom", "Laurent", "tom.demo@example.com"]
]

users = featured_users.map do |first_name, last_name, email|
  user = User.find_or_initialize_by(email: email)

  user.update!(
    first_name: first_name,
    last_name: last_name,
    password: "123456",
    avatar: "avatar_01"
  )

  Interest.find_each do |interest|
    UserInterest.find_or_create_by!(user: user, interest: interest)
  end

  room = user.room || user.create_room!(width: 5, height: 5)
  room.update!(width: 5, height: 5)

  user
end

users.each do |liked_user|
  users.each do |liker|
    next if liker == liked_user

    RoomLike.find_or_create_by!(
      user: liker,
      room: liked_user.room
    )
  end
end

puts "✅ Featured users created with max likes"


50.times do |index|
  number = index + 1

  user = User.find_or_initialize_by(
    email: "lambda#{number}.demo@example.com"
  )

  user.update!(
    first_name: "User",
    last_name: "Lambda #{number}",
    password: "123456",
    avatar: "avatar_01"
  )

  room = user.room || user.create_room!(width: 5, height: 5)
  room.update!(width: 5, height: 5)
end

puts "✅ 50 lambda users created without room likes"

  puts "🌍 Importing language items from CSV..."
  Rake::Task["language_activities:import"].invoke

  puts "🏃 Importing sport activities from CSV..."
  Rake::Task["sport_activities:import"].invoke

  puts "🗂  Importing productivité activities from CSV..."
  Rake::Task["productivite_activities:import"].invoke

  puts "#{Activity.where(activity_type: "code_quiz", active: true).count} code quiz activities created"

  puts "📸 Importing photo activities from CSV..."
  Rake::Task["photo_activities:import"].invoke

  puts "🧘 Importing bien-être activities from CSV..."
  Rake::Task["bien_etre_activities:import"].invoke

  puts "🎨 Importing dessin activities from CSV..."
  Rake::Task["dessin_activities:import"].invoke

  if defined?(CultureQuestion)
    puts "🧠 Importing culture questions from CSV..."
    Rake::Task["culture_questions:import_csv"].invoke
  end

  if defined?(CodeQuestion)
    puts "💻 Importing code questions from CSV..."
    Rake::Task["code_questions:import_csv"].invoke
  end

  require_relative "seeds_melodies"

  puts "✅ Seed completed!"

  puts "#{User.count} users created"
  puts "#{Interest.count} interests created"
  puts "#{Location.count} locations created"
  puts "#{Duration.count} durations created"
  puts "#{Activity.count} activities created"
  puts "#{LanguageItem.count} language items created"
  puts "#{CultureQuestion.count} culture questions created" if defined?(CultureQuestion)

  puts "#{Activity.where(interest: sport, active: true).count} active sport activities created"
  puts "#{Activity.where(interest: languages, active: true).count} active language activities created"
  puts "#{Activity.where(interest: culture, active: true).count} active culture activities created"

  puts "#{Activity.where(activity_type: "word_learning", active: true).count} word learning activities created"
  puts "#{Activity.where(activity_type: "sentence_completion", active: true).count} sentence completion activities created"
  puts "#{Activity.where(activity_type: "llm_chat", active: false).count} inactive LLM chat activities created"
  puts "#{Activity.where(activity_type: "culture_quiz", active: true).count} culture quiz activities created"

  puts "Creating furnitures..."
##################CULTURE###################
  Furniture.create!(
    name: "Livres",
    image_url: "furnitures/books.png",
    required_xp: 25,
    width: 1,
    height: 1,
    interest: culture
  )
  Furniture.create!(
    name: "Bibliothéque",
    image_url: "furnitures/Biblio.png",
    interest: culture ,
    required_xp: 150,
    width: 2,
    height: 1
  )
    Furniture.create!(
    name: "Fossile",
    image_url: "furnitures/Dino.png",
    required_xp: 500,
    width: 2,
    height: 1,
    interest: culture
  )
##################SPORT###################
  Furniture.create!(
    name: "Tapis de sport",
    image_url: "furnitures/sport_mat.png",
    width: 2,
    height: 1,
    interest: sport,
    required_xp: 25
  )
  Furniture.create!(
    name: "Punching Ball",
    image_url: "furnitures/punching_ball.png",
    width: 1,
    height: 1,
    interest: sport,
    required_xp: 150
  )
  Furniture.create!(
    name: "mur d'escalade",
    image_url: "furnitures/Escalade.png",
    interest: sport,
    required_xp: 500,
    width: 2,
    height: 1
  )
##################PRODUCTIVITE###################
  Furniture.create!(
    name: "Chaise de salon",
    image_url: "furnitures/chair.png",
    interest: productivite,
    required_xp: 25,
    width: 1,
    height: 1
  )
  Furniture.create!(
    name: "Canapé",
    image_url: "furnitures/Canap.png",
    interest: productivite,
    required_xp: 150,
    width: 1,
    height: 2
  )
  Furniture.create!(
    name: "Lit",
    image_url: "furnitures/Bed.png",
    interest: productivite,
    required_xp: 500,
    width: 2,
    height: 2
  )
##################BIENETRE###################
  Furniture.create!(
    name: "Coussin",
    image_url: "furnitures/Coussin.png",
    width: 1,
    height: 1,
    interest: wellbeing,
    required_xp: 20
  )
  Furniture.create!(
    name: "Pool",
    image_url: "furnitures/pool.png",
    width: 1,
    height: 1,
    interest: wellbeing,
    required_xp: 150
  )
  Furniture.create!(
    name: "Jasky",
    image_url: "furnitures/jasky.gif",
    width: 1,
    height: 1,
    interest: wellbeing,
    required_xp: 500
  )
##################LANGUE###################
  Furniture.create!(
    name: "Sac de voyage",
    image_url: "furnitures/Sacados.png",
    width: 1,
    height: 1,
    interest: languages,
    required_xp: 25
  )
  Furniture.create!(
    name: "etagere à souvenir",
    image_url: "furnitures/Travelshelf.png",
    width: 1,
    height: 1,
    interest: languages,
    required_xp: 150
  )
  Furniture.create!(
    name: "Van",
    image_url: "furnitures/Camping van.png",
    width: 2,
    height: 2,
    interest: languages,
    required_xp: 500
  )
##################CODE###################
  Furniture.create!(
    name: "Chaise de bureau",
    image_url: "furnitures/Chaisebureau.png",
    width: 1,
    height: 1,
    interest: code,
    required_xp: 20
  )
  Furniture.create!(
    name: "Bureau",
    image_url: "furnitures/Bureau.png",
    width: 1,
    height: 2,
    interest: code,
    required_xp: 150
  )
    Furniture.create!(
    name: "Merci Wagon",
    image_url: "furnitures/Wagonrails.gif",
    width: 2,
    height: 2,
    interest: code,
    required_xp: 500
  )
##################DESSIN###################
  Furniture.create!(
    name: "Pot de peinture",
    image_url: "furnitures/Pots.png",
    width: 1,
    height: 1,
    interest: drawing,
    required_xp: 20
  )
  Furniture.create!(
    name: "Toile",
    image_url: "furnitures/Tablo.png",
    width: 1,
    height: 1,
    interest: drawing,
    required_xp: 150
  )
  Furniture.create!(
    name: "Chef d'oeuvre",
    image_url: "furnitures/Joconde.png",
    width: 2,
    height: 1,
    interest: drawing,
    required_xp: 500
  )
##################PHOTO###################
  Furniture.create!(
    name: "Polaroids",
    image_url: "furnitures/Polaroids.png",
    width: 1,
    height: 1,
    interest: photo_interest,
    required_xp: 20
  )
  Furniture.create!(
    name: "Appareil",
    image_url: "furnitures/Photo.png",
    width: 1,
    height: 1,
    interest: photo_interest,
    required_xp: 150
  )
  Furniture.create!(
    name: "Fond photo",
    image_url: "furnitures/Fondphoto.png",
    width: 2,
    height: 1,
    interest: photo_interest,
    required_xp: 500
  )
##################MUSIQUE###################
  Furniture.create!(
    name: "guitare",
    image_url: "furnitures/Guitare.png",
    width: 1,
    height: 1,
    interest: musique,
    required_xp: 20
  )
  Furniture.create!(
    name: "Meuble vynil",
    image_url: "furnitures/Meublvynil.png",
    width: 1,
    height: 2,
    interest: musique,
    required_xp: 150
  )
  Furniture.create!(
    name: "Piano",
    image_url: "furnitures/Piano.png",
    width: 2,
    height: 1,
    interest: musique,
    required_xp: 500
  )

  puts "#{Furniture.count} furnitures created!"

  max_required_xp_by_interest_id = Furniture
    .group(:interest_id)
    .maximum(:required_xp)

  users.each do |user|
    Interest.find_each do |interest|
      UserInterest.find_or_create_by!(user: user, interest: interest)

      max_required_xp = max_required_xp_by_interest_id[interest.id].to_i
      unlock_xp = max_required_xp.positive? ? max_required_xp + 100 : 0

      UserInterestProgress
        .find_or_create_by!(user: user, interest: interest)
        .update!(xp: unlock_xp)

      next unless unlock_xp.positive?

      current_session_xp = XpCalculator.total_for_interest(user, interest)
      xp_to_seed = unlock_xp - current_session_xp
      next unless xp_to_seed.positive?

      activity = Activity.where(interest: interest, active: true).first ||
                 Activity.where(interest: interest).first
      activity ||= Activity.create!(
        name: "Progression démo",
        content: "Progression de démonstration pour débloquer les meubles.",
        mood: mitige,
        location: anywhere,
        duration: five_minutes,
        interest: interest,
        activity_type: "standard",
        active: false
      )

      ActivitySession.create!(
        user: user,
        activity: activity,
        date: Date.current,
        finished: true,
        status: "finished",
        elapsed_seconds: activity.duration.value.to_i * 60,
        xp_earned: xp_to_seed,
        xp_awarded_at: Time.current,
        furniture_unlocks_seen_at: Time.current
      )
    end
  end

  puts "✅ Featured users updated with furniture unlock XP"
