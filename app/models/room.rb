class Room < ApplicationRecord
  GRID_WIDTH = 7
  GRID_HEIGHT = 7

  belongs_to :user
  has_many :room_furnitures, dependent: :destroy
  has_many :room_likes, dependent: :destroy

  def ensure_default_size!
    return if width == GRID_WIDTH && height == GRID_HEIGHT

    update!(
      width: GRID_WIDTH,
      height: GRID_HEIGHT
    )
  end
end
