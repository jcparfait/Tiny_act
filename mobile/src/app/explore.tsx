import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Image as ExpoImage } from "expo-image";

import { AvatarImage } from "../components/AvatarPicker";
import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";

import {
  getFurnitureSource,
  ROOM_BACKGROUND,
} from "../constants/furnitureAssets";

import { useAuth } from "../context/AuthContext";

import {
  deleteRoomFurniture,
  loadRoom,
  moveRoomFurniture,
  placeFurniture,
} from "../services/roomApi";

import {
  MobileRoom,
  RoomFurnitureItem,
  RoomInventoryItem,
  RoomResponse,
} from "../types/tinyAct";

export default function RoomScreen() {
  const { user } = useAuth();

  const [roomData, setRoomData] =
    useState<RoomResponse | null>(null);

  const [selectedFurnitureId, setSelectedFurnitureId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [busyAction, setBusyAction] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const selectedFurniture = useMemo(
    () =>
      roomData?.room.furnitures.find(
        (item) => item.id === selectedFurnitureId
      ) || null,
    [roomData, selectedFurnitureId]
  );

  const unlockedFurniture =
    roomData?.inventory.filter(
      (item) => item.unlocked
    ) || [];

  const lockedFurniture =
    roomData?.inventory.filter(
      (item) => !item.unlocked
    ) || [];

  useEffect(() => {
    refreshRoom();
  }, []);

  async function refreshRoom() {
    setLoading(true);
    setError(null);

    try {
      setRoomData(await loadRoom());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger la salle."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePlace(
    furniture: RoomInventoryItem
  ) {
    const actionKey = `place-${furniture.id}`;

    setBusyAction(actionKey);
    setError(null);

    try {
      const response =
        await placeFurniture(furniture.id);

      setRoomData((current) => {
        if (!current) return current;

        return {
          ...current,
          room: {
            ...current.room,
            furnitures: [
              ...current.room.furnitures,
              response.room_furniture,
            ],
          },
          inventory: current.inventory.map((item) =>
            item.id === furniture.id
              ? {
                  ...item,
                  placed_count:
                    item.placed_count + 1,
                }
              : item
          ),
        };
      });

      setSelectedFurnitureId(
        response.room_furniture.id
      );
    } catch (placeError) {
      setError(
        placeError instanceof Error
          ? placeError.message
          : "Impossible de placer ce meuble."
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleMove(
    deltaX: number,
    deltaY: number
  ) {
    if (!selectedFurniture) return;

    const actionKey =
      `move-${selectedFurniture.id}`;

    setBusyAction(actionKey);
    setError(null);

    try {
      const response =
        await moveRoomFurniture(
          selectedFurniture.id,
          selectedFurniture.x + deltaX,
          selectedFurniture.y + deltaY
        );

      replacePlacedFurniture(
        response.room_furniture
      );
    } catch (moveError) {
      setError(
        moveError instanceof Error
          ? moveError.message
          : "Impossible de déplacer ce meuble."
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDelete() {
    if (!selectedFurniture) return;

    const actionKey =
      `delete-${selectedFurniture.id}`;

    setBusyAction(actionKey);
    setError(null);

    try {
      await deleteRoomFurniture(
        selectedFurniture.id
      );

      setRoomData((current) => {
        if (!current) return current;

        return {
          ...current,
          room: {
            ...current.room,
            furnitures:
              current.room.furnitures.filter(
                (item) =>
                  item.id !== selectedFurniture.id
              ),
          },
          inventory: current.inventory.map((item) =>
            item.id ===
            selectedFurniture.furniture_id
              ? {
                  ...item,
                  placed_count: Math.max(
                    item.placed_count - 1,
                    0
                  ),
                }
              : item
          ),
        };
      });

      setSelectedFurnitureId(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de retirer ce meuble."
      );
    } finally {
      setBusyAction(null);
    }
  }

  function replacePlacedFurniture(
    replacement: RoomFurnitureItem
  ) {
    setRoomData((current) => {
      if (!current) return current;

      return {
        ...current,
        room: {
          ...current.room,
          furnitures:
            current.room.furnitures.map((item) =>
              item.id === replacement.id
                ? replacement
                : item
            ),
        },
      };
    });
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#FFF4EA",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          padding: 18,
          paddingBottom: 40,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 720,
            gap: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <AvatarImage
              avatar={user?.avatar}
              size={64}
            />

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#FF4B2B",
                  fontSize: 13,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Ton espace
              </Text>

              <Text
                style={{
                  color: "#17152F",
                  fontSize: 32,
                  lineHeight: 38,
                  fontWeight: "900",
                }}
              >
                La salle de {user?.first_name || "Tiny Act"}
              </Text>
            </View>
          </View>

          {loading && (
            <View
              style={{
                padding: 40,
                alignItems: "center",
              }}
            >
              <ActivityIndicator />
            </View>
          )}

          {error && <ErrorBox message={error} />}

          {!loading && roomData && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <StatCard
                  label="XP total"
                  value={`${roomData.total_xp}`}
                />

                <StatCard
                  label="Meubles placés"
                  value={`${roomData.room.furnitures.length}`}
                />

                <StatCard
                  label="Débloqués"
                  value={`${unlockedFurniture.length}/${roomData.inventory.length}`}
                />
              </View>

              <RoomCanvas
                room={roomData.room}
                avatar={user?.avatar}
                selectedId={selectedFurnitureId}
                onSelect={setSelectedFurnitureId}
              />

              <Text
                style={{
                  color: "#5D5A70",
                  fontSize: 14,
                  lineHeight: 21,
                  textAlign: "center",
                }}
              >
                Sélectionne un meuble dans la salle
                pour le déplacer ou le retirer.
              </Text>

              {selectedFurniture && (
                <View
                  style={{
                    padding: 18,
                    borderRadius: 24,
                    backgroundColor: "#17152F",
                    gap: 14,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 20,
                        fontWeight: "900",
                      }}
                    >
                      {selectedFurniture.name}
                    </Text>

                    <Text
                      style={{
                        marginTop: 4,
                        color: "#FFFFFF",
                        opacity: 0.7,
                        fontWeight: "700",
                      }}
                    >
                      Position {selectedFurniture.x + 1},
                      {" "}
                      {selectedFurniture.y + 1}
                    </Text>
                  </View>

                  <View
                    style={{
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <MoveButton
                      label="↑"
                      disabled={busyAction !== null}
                      onPress={() => handleMove(0, -1)}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                      }}
                    >
                      <MoveButton
                        label="←"
                        disabled={busyAction !== null}
                        onPress={() =>
                          handleMove(-1, 0)
                        }
                      />

                      <MoveButton
                        label="↓"
                        disabled={busyAction !== null}
                        onPress={() =>
                          handleMove(0, 1)
                        }
                      />

                      <MoveButton
                        label="→"
                        disabled={busyAction !== null}
                        onPress={() =>
                          handleMove(1, 0)
                        }
                      />
                    </View>
                  </View>

                  <Pressable
                    disabled={busyAction !== null}
                    onPress={handleDelete}
                    style={({ pressed }) => ({
                      padding: 13,
                      borderRadius: 16,
                      backgroundColor: "#FFE1DD",
                      opacity:
                        pressed || busyAction !== null
                          ? 0.65
                          : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: "#B42318",
                        fontWeight: "900",
                        textAlign: "center",
                      }}
                    >
                      {busyAction?.startsWith("delete-")
                        ? "Suppression..."
                        : "Retirer de la salle"}
                    </Text>
                  </Pressable>
                </View>
              )}

              <SectionTitle
                kicker="Progression"
                title="Ton XP par catégorie"
              />

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {roomData.progress.map((progress) => (
                  <View
                    key={progress.interest.id}
                    style={{
                      flexGrow: 1,
                      minWidth: 145,
                      padding: 14,
                      borderRadius: 18,
                      backgroundColor: "#FFFFFF",
                      borderWidth: 1,
                      borderColor: "#F2D7C8",
                    }}
                  >
                    <Text
                      style={{
                        color: "#17152F",
                        fontWeight: "900",
                      }}
                    >
                      {progress.interest.name}
                    </Text>

                    <Text
                      style={{
                        marginTop: 5,
                        color: "#FF4B2B",
                        fontSize: 20,
                        fontWeight: "900",
                      }}
                    >
                      {progress.xp} XP
                    </Text>

                    <Text
                      style={{
                        marginTop: 4,
                        color: "#5D5A70",
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {progress.next_required_xp
                        ? `Prochain meuble à ${progress.next_required_xp} XP`
                        : "Tous les meubles sont débloqués"}
                    </Text>
                  </View>
                ))}
              </View>

              <SectionTitle
                kicker="Inventaire"
                title="Meubles débloqués"
              />

              {unlockedFurniture.length === 0 ? (
                <EmptyCard text="Termine quelques activités pour débloquer ton premier meuble." />
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {unlockedFurniture.map((furniture) => (
                    <InventoryCard
                      key={furniture.id}
                      furniture={furniture}
                      busy={
                        busyAction ===
                        `place-${furniture.id}`
                      }
                      onPlace={() =>
                        handlePlace(furniture)
                      }
                    />
                  ))}
                </View>
              )}

              {lockedFurniture.length > 0 && (
                <>
                  <SectionTitle
                    kicker="À débloquer"
                    title="Prochains meubles"
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    {lockedFurniture.map((furniture) => (
                      <LockedFurnitureCard
                        key={furniture.id}
                        furniture={furniture}
                      />
                    ))}
                  </View>
                </>
              )}
            </>
          )}

          <Pressable
            onPress={refreshRoom}
            disabled={loading}
          >
            <Text
              style={{
                color: "#FF4B2B",
                textAlign: "center",
                fontWeight: "900",
              }}
            >
              Actualiser la salle
            </Text>
          </Pressable>

          <MobileNav active="room" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RoomCanvas({
  room,
  avatar,
  selectedId,
  onSelect,
}: {
  room: MobileRoom;
  avatar?: string | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const [canvasWidth, setCanvasWidth] =
    useState(0);

  const aspectRatio = 920 / 620;

  const canvasHeight =
    canvasWidth > 0
      ? canvasWidth / aspectRatio
      : 320;

  const scale =
    canvasWidth > 0
      ? canvasWidth / 920
      : 1;

  return (
    <View
      onLayout={(event) =>
        setCanvasWidth(
          event.nativeEvent.layout.width
        )
      }
      style={{
        width: "100%",
        height: canvasHeight,
        borderRadius: 26,
        overflow: "hidden",
        backgroundColor: "#E5D8CC",
        borderWidth: 2,
        borderColor: "#F2D7C8",
      }}
    >
      <ExpoImage
        source={ROOM_BACKGROUND}
        contentFit="contain"
        style={{
          position: "absolute",
          inset: 0,
        }}
      />

      {room.furnitures.map((item) => {
        const position = gridToScreen(
          item.x,
          item.y,
          scale
        );

        const selected =
          selectedId === item.id;

        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={({ pressed }) => ({
              position: "absolute",
              left: position.left,
              top: position.top,
              width: 170 * scale,
              height: 210 * scale,
              zIndex: item.x + item.y + 10,
              borderRadius: 14,
              borderWidth: selected ? 3 : 0,
              borderColor: "#FF4B2B",
              backgroundColor: selected
                ? "rgba(255, 75, 43, 0.12)"
                : "transparent",
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <ExpoImage
              source={getFurnitureSource(
                item.image_key
              )}
              contentFit="contain"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </Pressable>
        );
      })}

      <View
        style={{
          position: "absolute",
          left: Math.max(
            canvasWidth / 2 - 26,
            0
          ),
          bottom: 18 * scale,
          zIndex: 100,
          padding: 3,
          borderRadius: 999,
          backgroundColor: "#FFFFFF",
          borderWidth: 3,
          borderColor: "#FF4B2B",
        }}
      >
        <AvatarImage
          avatar={avatar}
          size={Math.max(42, 52 * scale)}
        />
      </View>
    </View>
  );
}

function gridToScreen(
  x: number,
  y: number,
  scale: number
) {
  const tileWidth = 85;
  const tileHeight = 48;
  const offsetX = 460;
  const offsetY = 260;
  const visualWidth = 170;
  const visualHeight = 192;
  const furnitureOffsetX = 25;
  const furnitureOffsetY = 115;

  const isoX =
    offsetX +
    ((x - y) * tileWidth) / 2;

  const isoY =
    offsetY +
    ((x + y) * tileHeight) / 2;

  return {
    left:
      (
        isoX -
        visualWidth / 2 +
        furnitureOffsetX
      ) * scale,

    top:
      (
        isoY -
        visualHeight +
        furnitureOffsetY
      ) * scale,
  };
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexGrow: 1,
        minWidth: 130,
        padding: 14,
        borderRadius: 18,
        backgroundColor: "#17152F",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          opacity: 0.7,
          fontSize: 12,
          fontWeight: "800",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          marginTop: 5,
          color: "#FFFFFF",
          fontSize: 22,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function SectionTitle({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <View style={{ gap: 3 }}>
      <Text
        style={{
          color: "#FF4B2B",
          fontSize: 12,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {kicker}
      </Text>

      <Text
        style={{
          color: "#17152F",
          fontSize: 25,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function MoveButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        width: 58,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        opacity:
          disabled || pressed ? 0.55 : 1,
      })}
    >
      <Text
        style={{
          color: "#17152F",
          fontSize: 22,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function InventoryCard({
  furniture,
  onPlace,
  busy,
}: {
  furniture: RoomInventoryItem;
  onPlace: () => void;
  busy: boolean;
}) {
  return (
    <View
      style={{
        width: "48%",
        minWidth: 155,
        flexGrow: 1,
        padding: 14,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#F2D7C8",
        gap: 10,
      }}
    >
      <ExpoImage
        source={getFurnitureSource(
          furniture.image_key
        )}
        contentFit="contain"
        style={{
          width: "100%",
          height: 110,
        }}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#17152F",
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          {furniture.name}
        </Text>

        <Text
          style={{
            marginTop: 3,
            color: "#5D5A70",
            fontSize: 12,
            fontWeight: "700",
          }}
        >
          {furniture.interest.name}
          {" · "}
          {furniture.placed_count} placé(s)
        </Text>
      </View>

      <Pressable
        onPress={onPlace}
        disabled={busy}
        style={({ pressed }) => ({
          padding: 12,
          borderRadius: 14,
          backgroundColor: "#FF4B2B",
          opacity: busy || pressed ? 0.6 : 1,
        })}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          {busy ? "Placement..." : "Placer"}
        </Text>
      </Pressable>
    </View>
  );
}

function LockedFurnitureCard({
  furniture,
}: {
  furniture: RoomInventoryItem;
}) {
  const remainingXp = Math.max(
    furniture.required_xp -
      furniture.current_xp,
    0
  );

  const progress =
    furniture.required_xp > 0
      ? Math.min(
          furniture.current_xp /
            furniture.required_xp,
          1
        )
      : 0;

  return (
    <View
      style={{
        width: "48%",
        minWidth: 155,
        flexGrow: 1,
        padding: 14,
        borderRadius: 22,
        backgroundColor: "#E7E0D8",
        gap: 10,
        opacity: 0.82,
      }}
    >
      <ExpoImage
        source={getFurnitureSource(
          furniture.image_key
        )}
        contentFit="contain"
        style={{
          width: "100%",
          height: 100,
          opacity: 0.45,
        }}
      />

      <Text
        style={{
          color: "#17152F",
          fontWeight: "900",
        }}
      >
        🔒 {furniture.name}
      </Text>

      <Text
        style={{
          color: "#5D5A70",
          fontSize: 12,
          fontWeight: "700",
        }}
      >
        Encore {remainingXp} XP en{" "}
        {furniture.interest.name}
      </Text>

      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: "#CFC6BD",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            backgroundColor: "#FF4B2B",
          }}
        />
      </View>
    </View>
  );
}

function EmptyCard({
  text,
}: {
  text: string;
}) {
  return (
    <View
      style={{
        padding: 18,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#F2D7C8",
      }}
    >
      <Text
        style={{
          color: "#5D5A70",
          lineHeight: 22,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {text}
      </Text>
    </View>
  );
}
