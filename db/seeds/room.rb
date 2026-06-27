puts "Creating or updating furnitures..."

def room_interest_for(*names)
  names.each do |name|
    interest = Interest.find_by(name: name)
    return interest if interest.present?
  end

  Interest.first || raise("Create interests before room furnitures.")
end

furnitures = [
  {
    name: "Books",
    image_url: "furnitures/books.png",
    required_xp: 10,
    width: 1,
    height: 1,
    interest: room_interest_for("Culture")
  },
  {
    name: "Bibliothèque",
    image_url: "furnitures/Biblio.png",
    required_xp: 120,
    width: 1,
    height: 2,
    interest: room_interest_for("Culture")
  },
  {
    name: "Dino",
    image_url: "furnitures/Dino.png",
    required_xp: 260,
    width: 1,
    height: 1,
    interest: room_interest_for("Culture")
  },
  {
    name: "Sport Mat",
    image_url: "furnitures/sport_mat.png",
    required_xp: 5,
    width: 2,
    height: 1,
    interest: room_interest_for("Sport")
  },
  {
    name: "Punching Ball",
    image_url: "furnitures/punching_ball.png",
    required_xp: 30,
    width: 1,
    height: 1,
    interest: room_interest_for("Sport")
  },
  {
    name: "Escalade",
    image_url: "furnitures/Escalade.png",
    required_xp: 50,
    width: 2,
    height: 1,
    interest: room_interest_for("Sport")
  },
  {
    name: "Chaise orange",
    image_url: "furnitures/chair.png",
    required_xp: 80,
    width: 1,
    height: 1,
    interest: room_interest_for("Culture")
  },
  {
    name: "Canapé",
    image_url: "furnitures/Canap.png",
    required_xp: 180,
    width: 2,
    height: 1,
    interest: room_interest_for("Bien-être", "Bien etre", "Culture")
  },
  {
    name: "Lit",
    image_url: "furnitures/Bed.png",
    required_xp: 320,
    width: 2,
    height: 2,
    interest: room_interest_for("Bien-être", "Bien etre", "Culture")
  },
  {
    name: "Coussin",
    image_url: "furnitures/Coussin.png",
    required_xp: 70,
    width: 1,
    height: 1,
    interest: room_interest_for("Bien-être", "Bien etre", "Culture")
  },
  {
    name: "Piscine",
    image_url: "furnitures/pool.png",
    required_xp: 450,
    width: 2,
    height: 2,
    interest: room_interest_for("Bien-être", "Bien etre", "Sport")
  },
  {
    name: "Jasky",
    image_url: "furnitures/jasky.gif",
    required_xp: 700,
    width: 1,
    height: 1,
    interest: room_interest_for("Bien-être", "Bien etre", "Culture")
  },
  {
    name: "Sac à dos",
    image_url: "furnitures/Sacados.png",
    required_xp: 90,
    width: 1,
    height: 1,
    interest: room_interest_for("Langues", "Culture")
  },
  {
    name: "Travel shelf",
    image_url: "furnitures/Travelshelf.png",
    required_xp: 240,
    width: 1,
    height: 2,
    interest: room_interest_for("Langues", "Culture")
  },
  {
    name: "Camping van",
    image_url: "furnitures/Camping van.png",
    required_xp: 520,
    width: 2,
    height: 1,
    interest: room_interest_for("Langues", "Sport", "Culture")
  },
  {
    name: "Chaise de bureau",
    image_url: "furnitures/Chaisebureau.png",
    required_xp: 120,
    width: 1,
    height: 1,
    interest: room_interest_for("Code")
  },
  {
    name: "Bureau",
    image_url: "furnitures/Bureau.png",
    required_xp: 260,
    width: 2,
    height: 1,
    interest: room_interest_for("Code")
  },
  {
    name: "Wagon Rails",
    image_url: "furnitures/Wagonrails.gif",
    required_xp: 600,
    width: 2,
    height: 1,
    interest: room_interest_for("Code")
  },
  {
    name: "Pots",
    image_url: "furnitures/Pots.png",
    required_xp: 75,
    width: 1,
    height: 1,
    interest: room_interest_for("Créativité", "Creativite", "Culture")
  },
  {
    name: "Tableau",
    image_url: "furnitures/Tablo.png",
    required_xp: 160,
    width: 1,
    height: 1,
    interest: room_interest_for("Dessin", "Créativité", "Creativite", "Culture")
  },
  {
    name: "Joconde",
    image_url: "furnitures/Joconde.png",
    required_xp: 380,
    width: 1,
    height: 1,
    interest: room_interest_for("Culture")
  },
  {
    name: "Polaroids",
    image_url: "furnitures/Polaroids.png",
    required_xp: 110,
    width: 1,
    height: 1,
    interest: room_interest_for("Photo", "Créativité", "Creativite", "Culture")
  },
  {
    name: "Photo",
    image_url: "furnitures/Photo.png",
    required_xp: 220,
    width: 1,
    height: 1,
    interest: room_interest_for("Photo", "Créativité", "Creativite", "Culture")
  },
  {
    name: "Fond photo",
    image_url: "furnitures/Fondphoto.png",
    required_xp: 420,
    width: 2,
    height: 1,
    interest: room_interest_for("Photo", "Créativité", "Creativite", "Culture")
  },
  {
    name: "Guitare",
    image_url: "furnitures/Guitare.png",
    required_xp: 90,
    width: 1,
    height: 1,
    interest: room_interest_for("Musique", "Music")
  },
  {
    name: "Meuble vinyle",
    image_url: "furnitures/Meublvynil.png",
    required_xp: 220,
    width: 1,
    height: 1,
    interest: room_interest_for("Musique", "Music")
  },
  {
    name: "Piano",
    image_url: "furnitures/Piano.png",
    required_xp: 480,
    width: 2,
    height: 1,
    interest: room_interest_for("Musique", "Music")
  }
]

furnitures.each do |attributes|
  furniture =
    Furniture.find_or_initialize_by(
      image_url: attributes.fetch(:image_url)
    )

  furniture.assign_attributes(attributes)
  furniture.save!
end

puts "#{Furniture.count} furnitures available."
