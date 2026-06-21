 import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  PanResponder,
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

  const [inventoryOpen, setInventoryOpen] =
    useState(false);

  const [roomDragging, setRoomDragging] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

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
    void refreshRoom();
  }, []);

  async function refreshRoom() {
    setLoading(true);
    setError(null);

    try {
      const response = await loadRoom();

      setRoomData(response);

      setSelectedFurnitureId(
        (currentSelectedId) => {
          const stillExists =
            response.room.furnitures.some(
              (item) =>
                item.id === currentSelectedId
            );

          return stillExists
            ? currentSelectedId
            : null;
        }
      );
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
    if (busyAction) return;

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

          inventory: current.inventory.map(
            (item) =>
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

      setInventoryOpen(false);
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
    if (!selectedFurniture || busyAction) {
      return;
    }

    await moveFurnitureTo(
      selectedFurniture,
      selectedFurniture.x + deltaX,
      selectedFurniture.y + deltaY
    );
  }

  async function handleDrop(
    item: RoomFurnitureItem,
    targetX: number,
    targetY: number
  ) {
    if (busyAction) return;

    await moveFurnitureTo(
      item,
      targetX,
      targetY
    );
  }

  async function moveFurnitureTo(
    item: RoomFurnitureItem,
    targetX: number,
    targetY: number
  ) {
    if (!roomData) return;

    if (
      targetX === item.x &&
      targetY === item.y
    ) {
      return;
    }

    if (
      !canPlaceFurniture(
        roomData.room,
        item,
        targetX,
        targetY
      )
    ) {
      setError(
        "Le meuble ne peut pas être placé ici."
      );

      return;
    }

    const previousItem = { ...item };
    const actionKey = `move-${item.id}`;

    setBusyAction(actionKey);
    setError(null);

    replacePlacedFurniture({
      ...item,
      x: targetX,
      y: targetY,
      z: targetX + targetY,
    });

    try {
      const response =
        await moveRoomFurniture(
          item.id,
          targetX,
          targetY
        );

      replacePlacedFurniture(
        response.room_furniture
      );
    } catch (moveError) {
      replacePlacedFurniture(previousItem);

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
    if (!selectedFurniture || busyAction) {
      return;
    }

    const furnitureToDelete =
      selectedFurniture;

    const actionKey =
      `delete-${furnitureToDelete.id}`;

    setBusyAction(actionKey);
    setError(null);

    try {
      await deleteRoomFurniture(
        furnitureToDelete.id
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
                  item.id !==
                  furnitureToDelete.id
              ),
          },

          inventory: current.inventory.map(
            (item) =>
              item.id ===
              furnitureToDelete.furniture_id
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
            current.room.furnitures.map(
              (item) =>
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
        backgroundColor: "#F4EFE8",
      }}
    >
      <ScrollView
        scrollEnabled={!roomDragging}
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
                  color: "#7C63F2",
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
                  color: "#151B2F",
                  fontSize: 32,
                  lineHeight: 38,
                  fontWeight: "900",
                }}
              >
                La salle de{" "}
                {user?.first_name || "Tiny Act"}
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

          {error && (
            <ErrorBox message={error} />
          )}

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
                  value={
                    `${unlockedFurniture.length}` +
                    `/${roomData.inventory.length}`
                  }
                />
              </View>

              <RoomCanvas
                room={roomData.room}
                avatar={user?.avatar}
                selectedId={selectedFurnitureId}
                disabled={busyAction !== null}
                onSelect={setSelectedFurnitureId}
                onDrop={handleDrop}
                onDraggingChange={setRoomDragging}
              />

              <Text
                style={{
                  color: "rgba(21, 27, 47, 0.58)",
                  fontSize: 14,
                  lineHeight: 21,
                  textAlign: "center",
                }}
              >
                Appuie sur un meuble puis
                fais-le glisser sur une autre case.
              </Text>

              {selectedFurniture && (
                <FurnitureControls
                  furniture={selectedFurniture}
                  busy={busyAction !== null}
                  deleting={
                    busyAction ===
                    `delete-${selectedFurniture.id}`
                  }
                  onMove={handleMove}
                  onDelete={handleDelete}
                />
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
                {roomData.progress.map(
                  (progress) => (
                    <View
                      key={progress.interest.id}
                      style={{
                        flexGrow: 1,
                        minWidth: 145,
                        padding: 14,
                        borderRadius: 18,
                        backgroundColor: "#FFFFFF",
                        borderWidth: 1,
                        borderColor: "rgba(90, 74, 54, 0.16)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#151B2F",
                          fontWeight: "900",
                        }}
                      >
                        {progress.interest.name}
                      </Text>

                      <Text
                        style={{
                          marginTop: 5,
                          color: "#7C63F2",
                          fontSize: 20,
                          fontWeight: "900",
                        }}
                      >
                        {progress.xp} XP
                      </Text>

                      <Text
                        style={{
                          marginTop: 4,
                          color: "rgba(21, 27, 47, 0.58)",
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        {progress.next_required_xp
                          ? `Prochain meuble à ${progress.next_required_xp} XP`
                          : "Tous les meubles sont débloqués"}
                      </Text>
                    </View>
                  )
                )}
              </View>

              <Pressable
                onPress={() =>
                  setInventoryOpen(
                    (current) => !current
                  )
                }
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 18,
                  borderRadius: 24,
                  backgroundColor: "#151B2F",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <View style={{ gap: 3 }}>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      opacity: 0.7,
                      fontSize: 12,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Inventaire
                  </Text>

                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 21,
                      fontWeight: "900",
                    }}
                  >
                    {unlockedFurniture.length} meuble(s)
                    débloqué(s)
                  </Text>
                </View>

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 26,
                    fontWeight: "900",
                  }}
                >
                  {inventoryOpen ? "⌃" : "⌄"}
                </Text>
              </Pressable>

              {inventoryOpen && (
                <View style={{ gap: 20 }}>
                  <SectionTitle
                    kicker="Disponibles"
                    title="Meubles débloqués"
                  />

                  {unlockedFurniture.length === 0 ? (
                    <EmptyCard
                      text="Termine quelques activités pour débloquer ton premier meuble."
                    />
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      {unlockedFurniture.map(
                        (furniture) => (
                          <InventoryCard
                            key={furniture.id}
                            furniture={furniture}
                            busy={
                              busyAction ===
                              `place-${furniture.id}`
                            }
                            disabled={
                              busyAction !== null
                            }
                            onPlace={() =>
                              handlePlace(furniture)
                            }
                          />
                        )
                      )}
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
                        {lockedFurniture.map(
                          (furniture) => (
                            <LockedFurnitureCard
                              key={furniture.id}
                              furniture={furniture}
                            />
                          )
                        )}
                      </View>
                    </>
                  )}
                </View>
              )}
            </>
          )}

          <Pressable
            onPress={refreshRoom}
            disabled={loading}
            style={({ pressed }) => ({
              opacity:
                loading || pressed
                  ? 0.55
                  : 1,
            })}
          >
            <Text
              style={{
                color: "#7C63F2",
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
  disabled,
  onSelect,
  onDrop,
  onDraggingChange,
}: {
  room: MobileRoom;
  avatar?: string | null;
  selectedId: number | null;
  disabled: boolean;
  onSelect: (id: number) => void;
  onDrop: (
    item: RoomFurnitureItem,
    targetX: number,
    targetY: number
  ) => void;
  onDraggingChange: (dragging: boolean) => void;
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
      onLayout={(event) => {
        setCanvasWidth(
          event.nativeEvent.layout.width
        );
      }}
      style={{
        width: "100%",
        height: canvasHeight,
        borderRadius: 26,
        overflow: "hidden",
        backgroundColor: "#E5D8CC",
        borderWidth: 2,
        borderColor: "rgba(90, 74, 54, 0.16)",
      }}
    >
      <ExpoImage
        source={ROOM_BACKGROUND}
        contentFit="contain"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />

      {room.furnitures.map((item) => (
        <DraggableFurniture
          key={item.id}
          item={item}
          scale={scale}
          selected={selectedId === item.id}
          disabled={disabled}
          onSelect={onSelect}
          onDrop={onDrop}
          onDraggingChange={onDraggingChange}
        />
      ))}

      <View
        pointerEvents="none"
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
          borderColor: "#7C63F2",
        }}
      >
        <AvatarImage
          avatar={avatar}
          size={Math.max(
            42,
            52 * scale
          )}
        />
      </View>
    </View>
  );
}

function DraggableFurniture({
  item,
  scale,
  selected,
  disabled,
  onSelect,
  onDrop,
  onDraggingChange,
}: {
  item: RoomFurnitureItem;
  scale: number;
  selected: boolean;
  disabled: boolean;
  onSelect: (id: number) => void;
  onDrop: (
    item: RoomFurnitureItem,
    targetX: number,
    targetY: number
  ) => void;
  onDraggingChange: (dragging: boolean) => void;
}) {
  const pan = useRef(
    new Animated.ValueXY()
  ).current;

  const position = gridToScreen(
    item.x,
    item.y,
    scale
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          false,

        onMoveShouldSetPanResponder: (
          _event,
          gesture
        ) =>
          !disabled &&
          Math.abs(gesture.dx) +
            Math.abs(gesture.dy) >
            6,

        onPanResponderGrant: () => {
          onSelect(item.id);
          onDraggingChange(true);
        },

        onPanResponderMove: (
          _event,
          gesture
        ) => {
          pan.setValue({
            x: gesture.dx,
            y: gesture.dy,
          });
        },

        onPanResponderRelease: (
          _event,
          gesture
        ) => {
          const delta =
            gridDeltaFromDrag(
              gesture.dx,
              gesture.dy,
              scale
            );

          pan.setValue({
            x: 0,
            y: 0,
          });

          onDraggingChange(false);

          if (
            delta.x !== 0 ||
            delta.y !== 0
          ) {
            onDrop(
              item,
              item.x + delta.x,
              item.y + delta.y
            );
          }
        },

        onPanResponderTerminate: () => {
          Animated.spring(pan, {
            toValue: {
              x: 0,
              y: 0,
            },
            useNativeDriver: false,
          }).start();

          onDraggingChange(false);
        },

        onPanResponderTerminationRequest:
          () => false,
      }),
    [
      disabled,
      item,
      onDraggingChange,
      onDrop,
      onSelect,
      pan,
      scale,
    ]
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        width: 170 * scale,
        height: 210 * scale,
        zIndex:
          item.x +
          item.y +
          (selected ? 30 : 10),

        transform:
          pan.getTranslateTransform(),
      }}
    >
      <Pressable
        onPress={() => onSelect(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Sélectionner ${item.name}`}
        style={({ pressed }) => ({
          width: "100%",
          height: "100%",
          borderRadius: 14,
          borderWidth: selected ? 3 : 0,
          borderColor: "#7C63F2",
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
    </Animated.View>
  );
}

function FurnitureControls({
  furniture,
  busy,
  deleting,
  onMove,
  onDelete,
}: {
  furniture: RoomFurnitureItem;
  busy: boolean;
  deleting: boolean;
  onMove: (
    deltaX: number,
    deltaY: number
  ) => void;
  onDelete: () => void;
}) {
  return (
    <View
      style={{
        padding: 18,
        borderRadius: 24,
        backgroundColor: "#151B2F",
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
          {furniture.name}
        </Text>

        <Text
          style={{
            marginTop: 4,
            color: "#FFFFFF",
            opacity: 0.7,
            fontWeight: "700",
          }}
        >
          Position {furniture.x + 1},{" "}
          {furniture.y + 1}
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
          disabled={busy}
          onPress={() => onMove(0, -1)}
        />

        <View
          style={{
            flexDirection: "row",
            gap: 8,
          }}
        >
          <MoveButton
            label="←"
            disabled={busy}
            onPress={() => onMove(-1, 0)}
          />

          <MoveButton
            label="↓"
            disabled={busy}
            onPress={() => onMove(0, 1)}
          />

          <MoveButton
            label="→"
            disabled={busy}
            onPress={() => onMove(1, 0)}
          />
        </View>
      </View>

      <Pressable
        disabled={busy}
        onPress={onDelete}
        style={({ pressed }) => ({
          padding: 13,
          borderRadius: 16,
          backgroundColor: "#FFE1DD",
          opacity:
            pressed || busy ? 0.65 : 1,
        })}
      >
        <Text
          style={{
            color: "#B42318",
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          {deleting
            ? "Suppression..."
            : "Retirer de la salle"}
        </Text>
      </Pressable>
    </View>
  );
}

function canPlaceFurniture(
  room: MobileRoom,
  item: RoomFurnitureItem,
  targetX: number,
  targetY: number
) {
  if (targetX < 0 || targetY < 0) {
    return false;
  }

  if (
    targetX + item.width >
    room.width
  ) {
    return false;
  }

  if (
    targetY + item.height >
    room.height
  ) {
    return false;
  }

  return room.furnitures.every(
    (other) => {
      if (other.id === item.id) {
        return true;
      }

      const overlaps =
        targetX <
          other.x + other.width &&
        targetX + item.width >
          other.x &&
        targetY <
          other.y + other.height &&
        targetY + item.height >
          other.y;

      return !overlaps;
    }
  );
}

function gridDeltaFromDrag(
  dragX: number,
  dragY: number,
  scale: number
) {
  const safeScale =
    Math.max(scale, 0.001);

  const gridX =
    dragX / (85 * safeScale) +
    dragY / (48 * safeScale);

  const gridY =
    -dragX / (85 * safeScale) +
    dragY / (48 * safeScale);

  return {
    x: Math.round(gridX),
    y: Math.round(gridY),
  };
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
        backgroundColor: "#151B2F",
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
          color: "#7C63F2",
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
          color: "#151B2F",
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
          disabled || pressed
            ? 0.55
            : 1,
      })}
    >
      <Text
        style={{
          color: "#151B2F",
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
  disabled,
}: {
  furniture: RoomInventoryItem;
  onPlace: () => void;
  busy: boolean;
  disabled: boolean;
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
        borderColor: "rgba(90, 74, 54, 0.16)",
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
            color: "#151B2F",
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          {furniture.name}
        </Text>

        <Text
          style={{
            marginTop: 3,
            color: "rgba(21, 27, 47, 0.58)",
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
        disabled={disabled}
        style={({ pressed }) => ({
          padding: 12,
          borderRadius: 14,
          backgroundColor: "#7C63F2",
          opacity:
            disabled || pressed
              ? 0.6
              : 1,
        })}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          {busy
            ? "Placement..."
            : "Placer"}
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
          color: "#151B2F",
          fontWeight: "900",
        }}
      >
        🔒 {furniture.name}
      </Text>

      <Text
        style={{
          color: "rgba(21, 27, 47, 0.58)",
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
            backgroundColor: "#7C63F2",
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
        borderColor: "rgba(90, 74, 54, 0.16)",
      }}
    >
      <Text
        style={{
          color: "rgba(21, 27, 47, 0.58)",
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
