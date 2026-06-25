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

import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";

import {
  getFurnitureSource,
  ROOM_BACKGROUND,
} from "../constants/furnitureAssets";

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

import { TA } from "../theme/tinyActTheme";

function remainingFurnitureXp(
  furniture: RoomInventoryItem
) {
  return Math.max(
    furniture.required_xp - furniture.current_xp,
    0
  );
}

export default function RoomScreen() {
  const [roomData, setRoomData] =
    useState<RoomResponse | null>(null);

  const [selectedFurnitureId, setSelectedFurnitureId] =
    useState<number | null>(null);

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

  const unlockedFurniture = useMemo(
    () =>
      roomData?.inventory.filter(
        (item) => item.unlocked
      ) || [],
    [roomData]
  );

  const nextLockedFurniture = useMemo(
    () =>
      (
        roomData?.inventory.filter(
          (item) => !item.unlocked
        ) || []
      )
        .sort(
          (firstItem, secondItem) =>
            remainingFurnitureXp(firstItem) -
            remainingFurnitureXp(secondItem)
        )
        .slice(0, 6),
    [roomData]
  );

  useEffect(() => {
    void refreshRoom();
  }, []);

  async function refreshRoom() {
    setLoading(true);
    setError(null);

    try {
      const response = await loadRoom();

      setRoomData(response);

      setSelectedFurnitureId((currentSelectedId) => {
        const stillExists =
          response.room.furnitures.some(
            (item) => item.id === currentSelectedId
          );

        return stillExists
          ? currentSelectedId
          : null;
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger la room."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePlace(
    furniture: RoomInventoryItem
  ) {
    if (busyAction || !furniture.unlocked) return;

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

          inventory: current.inventory.map((item) =>
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
        backgroundColor: TA.colors.bgStart,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 131,
          zIndex: 80,
          backgroundColor: TA.colors.bgStart,
        }}
      />

      <MobileNav active="room" />

      <ScrollView
        scrollEnabled={!roomDragging}
        style={{
          flex: 1,
          backgroundColor: TA.colors.bgStart,
        }}
        contentContainerStyle={{
          alignItems: "center",
          paddingTop: 125,
          paddingHorizontal: 18,
          paddingBottom: 34,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            gap: 18,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text
              style={{
                color: TA.colors.inkLight,
                fontSize: 13,
                fontFamily: TA.fonts.black,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Ta room
            </Text>

            <Text
              style={{
                color: TA.colors.ink,
                fontSize: 44,
                lineHeight: 45,
                fontFamily: TA.fonts.black,
                letterSpacing: -2,
              }}
            >
              Décore ton espace
            </Text>
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
              <RoomCanvas
                room={roomData.room}
                selectedId={selectedFurnitureId}
                disabled={busyAction !== null}
                onSelect={setSelectedFurnitureId}
                onDrop={handleDrop}
                onDraggingChange={setRoomDragging}
              />

              <Text
                style={{
                  color: TA.colors.inkMuted,
                  fontSize: 13,
                  lineHeight: 18,
                  fontFamily: TA.fonts.bold,
                  textAlign: "center",
                }}
              >
                Appuie sur un meuble puis fais-le glisser
                pour le déplacer.
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

              <FurnitureShelf
                unlockedFurniture={unlockedFurniture}
                nextLockedFurniture={
                  nextLockedFurniture
                }
                busyAction={busyAction}
                onPlace={handlePlace}
              />

              <Pressable
                onPress={refreshRoom}
                disabled={loading}
                style={({ pressed }) => ({
                  opacity:
                    loading || pressed ? 0.55 : 1,
                })}
              >
                <Text
                  style={{
                    color: TA.colors.purple,
                    textAlign: "center",
                    fontFamily: TA.fonts.black,
                  }}
                >
                  Actualiser la room
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RoomCanvas({
  room,
  selectedId,
  disabled,
  onSelect,
  onDrop,
  onDraggingChange,
}: {
  room: MobileRoom;
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

  const canvasHeight =
    canvasWidth > 0 ? canvasWidth : 360;

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
        overflow: "hidden",
        backgroundColor: TA.colors.bgStart,
      }}
    >
      <ExpoImage
        source={ROOM_BACKGROUND}
        contentFit="contain"
        contentPosition="top center"
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
          borderColor: TA.colors.purple,
          backgroundColor: selected
            ? "rgba(124, 99, 242, 0.12)"
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

function FurnitureShelf({
  unlockedFurniture,
  nextLockedFurniture,
  busyAction,
  onPlace,
}: {
  unlockedFurniture: RoomInventoryItem[];
  nextLockedFurniture: RoomInventoryItem[];
  busyAction: string | null;
  onPlace: (furniture: RoomInventoryItem) => void;
}) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 30,
        backgroundColor: TA.colors.surface,
        borderWidth: 1.5,
        borderColor: TA.colors.borderMedium,
        gap: 14,
        ...TA.shadow.soft,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text
          style={{
            color: TA.colors.purple,
            fontSize: 12,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          Inventaire
        </Text>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 26,
            lineHeight: 30,
            fontFamily: TA.fonts.black,
            letterSpacing: -1,
          }}
        >
          Objets à placer
        </Text>

        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 13,
            lineHeight: 18,
            fontFamily: TA.fonts.bold,
          }}
        >
          Les objets disponibles sont actifs. Les prochains
          objets apparaissent grisés avec l’XP restant.
        </Text>
      </View>

      {unlockedFurniture.length === 0 ? (
        <EmptyCard text="Termine quelques activités pour débloquer ton premier meuble." />
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
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
              disabled={busyAction !== null}
              onPlace={() => onPlace(furniture)}
            />
          ))}

          {nextLockedFurniture.map((furniture) => (
            <LockedFurnitureCard
              key={furniture.id}
              furniture={furniture}
            />
          ))}
        </View>
      )}
    </View>
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
    <Pressable
      onPress={onPlace}
      disabled={disabled}
      style={({ pressed }) => ({
        width: "48%",
        minWidth: 142,
        flexGrow: 1,
        minHeight: 128,
        padding: 10,
        borderRadius: 22,
        backgroundColor: TA.colors.surface,
        borderWidth: 1.5,
        borderColor: TA.colors.borderMedium,
        opacity:
          disabled || pressed ? 0.68 : 1,
        ...TA.shadow.soft,
      })}
    >
      <ExpoImage
        source={getFurnitureSource(
          furniture.image_key
        )}
        contentFit="contain"
        style={{
          width: "100%",
          height: 74,
        }}
      />

      <Text
        numberOfLines={1}
        style={{
          marginTop: 6,
          color: TA.colors.ink,
          fontSize: 14,
          lineHeight: 17,
          fontFamily: TA.fonts.black,
        }}
      >
        {furniture.name}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          marginTop: 2,
          color: TA.colors.purple,
          fontSize: 12,
          lineHeight: 15,
          fontFamily: TA.fonts.black,
        }}
      >
        {busy ? "Placement..." : "Placer"}
      </Text>
    </Pressable>
  );
}

function LockedFurnitureCard({
  furniture,
}: {
  furniture: RoomInventoryItem;
}) {
  const remainingXp =
    remainingFurnitureXp(furniture);

  return (
    <View
      style={{
        width: "48%",
        minWidth: 142,
        flexGrow: 1,
        minHeight: 128,
        padding: 10,
        borderRadius: 22,
        backgroundColor: "#E7E0D8",
        borderWidth: 1.5,
        borderColor: "rgba(90, 74, 54, 0.12)",
        opacity: 0.72,
      }}
    >
      <ExpoImage
        source={getFurnitureSource(
          furniture.image_key
        )}
        contentFit="contain"
        style={{
          width: "100%",
          height: 74,
          opacity: 0.42,
        }}
      />

      <Text
        numberOfLines={1}
        style={{
          marginTop: 6,
          color: TA.colors.ink,
          fontSize: 14,
          lineHeight: 17,
          fontFamily: TA.fonts.black,
        }}
      >
        {furniture.name}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          marginTop: 2,
          color: TA.colors.inkMuted,
          fontSize: 12,
          lineHeight: 15,
          fontFamily: TA.fonts.black,
        }}
      >
        Encore {remainingXp} XP
      </Text>
    </View>
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
        padding: 16,
        borderRadius: 26,
        backgroundColor: TA.colors.surface,
        borderWidth: 1.5,
        borderColor: TA.colors.borderMedium,
        gap: 14,
        ...TA.shadow.soft,
      }}
    >
      <View>
        <Text
          numberOfLines={1}
          style={{
            color: TA.colors.ink,
            fontSize: 20,
            fontFamily: TA.fonts.black,
          }}
        >
          {furniture.name}
        </Text>

        <Text
          style={{
            marginTop: 4,
            color: TA.colors.inkMuted,
            fontFamily: TA.fonts.bold,
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
          backgroundColor: TA.colors.dangerBg,
          borderWidth: 1.5,
          borderColor: TA.colors.dangerBorder,
          opacity:
            pressed || busy ? 0.65 : 1,
        })}
      >
        <Text
          style={{
            color: TA.colors.dangerText,
            fontFamily: TA.fonts.black,
            textAlign: "center",
          }}
        >
          {deleting
            ? "Suppression..."
            : "Retirer de la room"}
        </Text>
      </Pressable>
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
        backgroundColor: TA.colors.bgMiddle,
        borderWidth: 1.5,
        borderColor: TA.colors.borderMedium,
        opacity:
          disabled || pressed ? 0.55 : 1,
      })}
    >
      <Text
        style={{
          color: TA.colors.ink,
          fontSize: 22,
          fontFamily: TA.fonts.black,
        }}
      >
        {label}
      </Text>
    </Pressable>
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

  return room.furnitures.every((other) => {
    if (other.id === item.id) {
      return true;
    }

    const overlaps =
      targetX < other.x + other.width &&
      targetX + item.width > other.x &&
      targetY < other.y + other.height &&
      targetY + item.height > other.y;

    return !overlaps;
  });
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
        backgroundColor: TA.colors.surface,
        borderWidth: 1,
        borderColor: TA.colors.borderMedium,
      }}
    >
      <Text
        style={{
          color: TA.colors.inkMuted,
          lineHeight: 22,
          fontFamily: TA.fonts.bold,
          textAlign: "center",
        }}
      >
        {text}
      </Text>
    </View>
  );
}
