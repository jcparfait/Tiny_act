import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "expo-router";

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

const ROOM_IMAGE_SIZE = 920;

const ISO_TILE_WIDTH = 96;
const ISO_TILE_HEIGHT = 54;

const ISO_ORIGIN_X = 490;
const ISO_ORIGIN_Y = 472;

const GRID_LINE_COLOR = "#FF1F14";
const SHOW_PLACEMENT_GRID = false;

const MIN_ZOOM = 0.78;
const MAX_ZOOM = 2.8;
const DEFAULT_ZOOM = 0.88;
const ZOOM_STEP = 0.28;
const FOOTER_HEIGHT = 86;
const INVENTORY_RAIL_HEIGHT = 218;

type ViewOffset = {
  x: number;
  y: number;
};

function remainingFurnitureXp(
  furniture: RoomInventoryItem
) {
  return Math.max(
    furniture.required_xp - furniture.current_xp,
    0
  );
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function distanceBetweenTouches(
  touches: Array<{
    pageX: number;
    pageY: number;
  }>
) {
  if (touches.length < 2) return 0;

  const firstTouch = touches[0];
  const secondTouch = touches[1];

  const deltaX =
    secondTouch.pageX - firstTouch.pageX;

  const deltaY =
    secondTouch.pageY - firstTouch.pageY;

  return Math.sqrt(
    deltaX * deltaX + deltaY * deltaY
  );
}

function clampViewOffset(
  offset: ViewOffset,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number
): ViewOffset {
  if (canvasWidth <= 0 || canvasHeight <= 0) {
    return {
      x: 0,
      y: 0,
    };
  }

  const worldSize = canvasWidth * zoom;

  const clampedX =
    worldSize <= canvasWidth
      ? (canvasWidth - worldSize) / 2
      : clamp(
          offset.x,
          canvasWidth - worldSize,
          0
        );

  const clampedY =
    worldSize <= canvasHeight
      ? (canvasHeight - worldSize) / 2
      : clamp(
          offset.y,
          canvasHeight - worldSize,
          0
        );

  return {
    x: clampedX,
    y: clampedY,
  };
}

export default function RoomScreen() {
  const router = useRouter();

  const [roomData, setRoomData] =
    useState<RoomResponse | null>(null);

  const [
    selectedFurnitureId,
    setSelectedFurnitureId,
  ] = useState<number | null>(null);

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

      console.warn(
        "Impossible de déplacer ce meuble",
        moveError
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
          : "Impossible de retirer de la room."
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

      <View
        style={{
          flex: 1,
          paddingTop: 125,
          backgroundColor: TA.colors.bgStart,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            paddingHorizontal: 18,
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: TA.colors.ink,
                fontSize: 34,
                lineHeight: 36,
                fontFamily: TA.fonts.black,
                letterSpacing: -1.6,
              }}
            >
              Room
            </Text>

            <Text
              style={{
                marginTop: 2,
                color: TA.colors.inkMuted,
                fontSize: 13,
                lineHeight: 17,
                fontFamily: TA.fonts.bold,
              }}
            >
              {roomData?.room.furnitures.length || 0} objet(s) placé(s)
            </Text>
          </View>
        </View>

        {loading && (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 40,
            }}
          >
            <ActivityIndicator />
          </View>
        )}

        {!loading && roomData && (
          <>
            <View
              style={{
                width: "100%",
                maxWidth: 760,
                alignSelf: "center",
                marginTop: 4,
              }}
            >
              <RoomCanvas
                room={roomData.room}
                selectedFurniture={selectedFurniture}
                selectedId={selectedFurnitureId}
                disabled={busyAction !== null}
                deleteBusy={
                  selectedFurniture
                    ? busyAction ===
                      `delete-${selectedFurniture.id}`
                    : false
                }
                onSelect={setSelectedFurnitureId}
                onDrop={handleDrop}
                onDelete={handleDelete}
              />
            </View>

            {error && (
              <View
                style={{
                  width: "100%",
                  maxWidth: 520,
                  paddingHorizontal: 18,
                  alignSelf: "center",
                  marginTop: 8,
                }}
              >
                <ErrorBox message={error} />
              </View>
            )}

            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: FOOTER_HEIGHT,
                paddingHorizontal: 18,
                paddingBottom: 10,
                backgroundColor: TA.colors.bgStart,
              }}
            >
              <View
                style={{
                  width: "100%",
                  maxWidth: 520,
                  alignSelf: "center",
                }}
              >
                <FurnitureShelf
                  unlockedFurniture={unlockedFurniture}
                  nextLockedFurniture={
                    nextLockedFurniture
                  }
                  busyAction={busyAction}
                  onPlace={handlePlace}
                />
              </View>
            </View>
          </>
        )}

        {!loading && !roomData && error && (
          <View
            style={{
              width: "100%",
              maxWidth: 520,
              paddingHorizontal: 18,
              alignSelf: "center",
              marginTop: 16,
            }}
          >
            <ErrorBox message={error} />
          </View>
        )}
      </View>

      <RoomFooterActions
        onBack={() => router.back()}
        onNewActivity={() => router.replace("/")}
      />
    </SafeAreaView>
  );
}

function RoomCanvas({
  room,
  selectedFurniture,
  selectedId,
  disabled,
  deleteBusy,
  onSelect,
  onDrop,
  onDelete,
}: {
  room: MobileRoom;
  selectedFurniture: RoomFurnitureItem | null;
  selectedId: number | null;
  disabled: boolean;
  deleteBusy: boolean;
  onSelect: (id: number) => void;
  onDrop: (
    item: RoomFurnitureItem,
    targetX: number,
    targetY: number
  ) => void;
  onDelete: () => void;
}) {
  const [canvasWidth, setCanvasWidth] =
    useState(0);

  const [zoom, setZoom] =
    useState(DEFAULT_ZOOM);

  const [viewOffset, setViewOffset] =
    useState<ViewOffset>({
      x: 0,
      y: 0,
    });

  const panStartOffset =
    useRef<ViewOffset>({
      x: 0,
      y: 0,
    });

  const pinchStartDistance =
    useRef(0);

  const pinchStartZoom =
    useRef(zoom);

  const canvasHeight =
    canvasWidth > 0
      ? Math.min(
          Math.max(canvasWidth * 0.78, 300),
          400
        )
      : 300;

  const baseScale =
    canvasWidth > 0
      ? canvasWidth / ROOM_IMAGE_SIZE
      : 1;

  const worldScale = baseScale * zoom;
  const worldSize = ROOM_IMAGE_SIZE * worldScale;

  function setClampedZoom(
    nextZoom: number
  ) {
    const safeZoom = clamp(
      nextZoom,
      MIN_ZOOM,
      MAX_ZOOM
    );

    setZoom(safeZoom);

    setViewOffset((currentOffset) =>
      clampViewOffset(
        currentOffset,
        canvasWidth,
        canvasHeight,
        safeZoom
      )
    );
  }

  function resetView() {
    setZoom(DEFAULT_ZOOM);

    setViewOffset(
      clampViewOffset(
        {
          x: 0,
          y: -canvasHeight * 0.04,
        },
        canvasWidth,
        canvasHeight,
        DEFAULT_ZOOM
      )
    );
  }

  useEffect(() => {
    if (canvasWidth <= 0) return;

    setViewOffset(
      clampViewOffset(
        {
          x: 0,
          y: -canvasHeight * 0.04,
        },
        canvasWidth,
        canvasHeight,
        DEFAULT_ZOOM
      )
    );
  }, [canvasHeight, canvasWidth]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          false,

        onMoveShouldSetPanResponder: (
          event,
          gesture
        ) => {
          const touches =
            event.nativeEvent.touches || [];

          return (
            touches.length >= 2 ||
            Math.abs(gesture.dx) +
              Math.abs(gesture.dy) >
              8
          );
        },

        onPanResponderGrant: (event) => {
          const touches =
            event.nativeEvent.touches || [];

          panStartOffset.current =
            viewOffset;

          if (touches.length >= 2) {
            pinchStartDistance.current =
              distanceBetweenTouches(touches);

            pinchStartZoom.current = zoom;
          }
        },

        onPanResponderMove: (
          event,
          gesture
        ) => {
          const touches =
            event.nativeEvent.touches || [];

          if (touches.length >= 2) {
            const currentDistance =
              distanceBetweenTouches(touches);

            if (
              pinchStartDistance.current <= 0 ||
              currentDistance <= 0
            ) {
              return;
            }

            const nextZoom =
              pinchStartZoom.current *
              (currentDistance /
                pinchStartDistance.current);

            setClampedZoom(nextZoom);

            return;
          }

          setViewOffset(
            clampViewOffset(
              {
                x:
                  panStartOffset.current.x +
                  gesture.dx,

                y:
                  panStartOffset.current.y +
                  gesture.dy,
              },
              canvasWidth,
              canvasHeight,
              zoom
            )
          );
        },

        onPanResponderRelease: () => {
          panStartOffset.current =
            viewOffset;
        },

        onPanResponderTerminate: () => {
          panStartOffset.current =
            viewOffset;
        },

        onPanResponderTerminationRequest:
          () => false,
      }),
    [
      canvasHeight,
      canvasWidth,
      viewOffset,
      zoom,
    ]
  );

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
      <View
        {...panResponder.panHandlers}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            left: viewOffset.x,
            top: viewOffset.y,
            width: worldSize,
            height: worldSize,
          }}
        >
          <ExpoImage
            source={ROOM_BACKGROUND}
            contentFit="contain"
            contentPosition="center"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: worldSize,
              height: worldSize,
            }}
          />

          {SHOW_PLACEMENT_GRID && (
            <IsoPlacementGrid
              room={room}
              scale={worldScale}
            />
          )}

          {room.furnitures.map((item) => (
            <DraggableFurniture
              key={item.id}
              item={item}
              scale={worldScale}
              selected={selectedId === item.id}
              disabled={disabled}
              onSelect={onSelect}
              onDrop={onDrop}
            />
          ))}
        </Animated.View>
      </View>

      <View
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          flexDirection: "row",
          gap: 8,
          zIndex: 140,
        }}
      >
        <ZoomButton
          label="−"
          onPress={() =>
            setClampedZoom(zoom - ZOOM_STEP)
          }
        />

        <ZoomButton
          label="+"
          onPress={() =>
            setClampedZoom(zoom + ZOOM_STEP)
          }
        />

        <ZoomButton
          label="Vue"
          wide
          onPress={resetView}
        />
      </View>

      {selectedFurniture && (
        <Pressable
          onPress={onDelete}
          disabled={disabled}
          style={({ pressed }) => ({
            position: "absolute",
            left: 12,
            bottom: 12,
            paddingVertical: 11,
            paddingHorizontal: 15,
            borderRadius: 999,
            backgroundColor: TA.colors.dangerBg,
            borderWidth: 1.5,
            borderColor: TA.colors.dangerBorder,
            opacity:
              disabled || pressed ? 0.66 : 1,
            zIndex: 140,
            ...TA.shadow.soft,
          })}
        >
          <Text
            style={{
              color: TA.colors.dangerText,
              fontSize: 13,
              lineHeight: 16,
              fontFamily: TA.fonts.black,
            }}
          >
            {deleteBusy ? "Suppression..." : "Retirer"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function ZoomButton({
  label,
  onPress,
  wide = false,
}: {
  label: string;
  onPress: () => void;
  wide?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: wide ? 68 : 44,
        height: 42,
        paddingHorizontal: wide ? 14 : 0,
        borderRadius: 999,
        backgroundColor: TA.colors.purple,
        borderWidth: 1.5,
        borderColor: TA.colors.purple,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.78 : 1,
        ...TA.shadow.soft,
      })}
    >
      <Text
        style={{
          color: TA.colors.white,
          fontSize: wide ? 13 : 20,
          lineHeight: wide ? 16 : 22,
          fontFamily: TA.fonts.black,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function IsoPlacementGrid({
  room,
  scale,
}: {
  room: MobileRoom;
  scale: number;
}) {
  const gridLines = [];

  for (let x = 0; x <= room.width; x += 1) {
    gridLines.push({
      from: isoPoint(x, 0),
      to: isoPoint(x, room.height),
      key: `x-${x}`,
    });
  }

  for (let y = 0; y <= room.height; y += 1) {
    gridLines.push({
      from: isoPoint(0, y),
      to: isoPoint(room.width, y),
      key: `y-${y}`,
    });
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
      }}
    >
      {gridLines.map((line) => (
        <IsoGridLine
          key={line.key}
          from={line.from}
          to={line.to}
          scale={scale}
        />
      ))}
    </View>
  );
}

function IsoGridLine({
  from,
  to,
  scale,
}: {
  from: {
    x: number;
    y: number;
  };
  to: {
    x: number;
    y: number;
  };
  scale: number;
}) {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  const length = Math.sqrt(
    deltaX * deltaX + deltaY * deltaY
  );

  const angle = Math.atan2(deltaY, deltaX);

  const centerX = (from.x + to.x) / 2;
  const centerY = (from.y + to.y) / 2;

  const thickness = 4;

  return (
    <View
      style={{
        position: "absolute",
        left:
          (centerX - length / 2) * scale,
        top:
          (centerY - thickness / 2) * scale,
        width: length * scale,
        height: thickness,
        borderRadius: 999,
        backgroundColor: GRID_LINE_COLOR,
        opacity: 0.72,
        transform: [
          {
            rotate: `${angle}rad`,
          },
        ],
      }}
    />
  );
}

function DraggableFurniture({
  item,
  scale,
  selected,
  disabled,
  onSelect,
  onDrop,
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
}) {
  const pan = useRef(
    new Animated.ValueXY()
  ).current;

  const position = gridToScreen(
    item,
    scale
  );

  const size = furnitureScreenSize(
    item,
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
        },

        onPanResponderTerminationRequest:
          () => false,
      }),
    [
      disabled,
      item,
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
        width: size.width,
        height: size.height,
        zIndex:
          30 +
          item.x +
          item.y +
          (selected ? 80 : 0),
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
          borderRadius: 16,
          borderWidth: selected ? 3 : 0,
          borderColor: "#1267D8",
          backgroundColor: selected
            ? "rgba(18, 103, 216, 0.08)"
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
  const [scrollX, setScrollX] = useState(0);
  const [viewportWidth, setViewportWidth] =
    useState(0);
  const [contentWidth, setContentWidth] =
    useState(0);

  const canScroll =
    contentWidth > viewportWidth + 4;

  const thumbWidth = canScroll
    ? Math.max(
        38,
        (viewportWidth * viewportWidth) /
          contentWidth
      )
    : viewportWidth;

  const thumbLeft = canScroll
    ? clamp(
        (scrollX /
          (contentWidth - viewportWidth)) *
          (viewportWidth - thumbWidth),
        0,
        Math.max(viewportWidth - thumbWidth, 0)
      )
    : 0;

  return (
    <View
      style={{
        height: INVENTORY_RAIL_HEIGHT,
        paddingVertical: 14,
        borderRadius: 30,
        backgroundColor: "#EDE5FF",
        borderWidth: 1.5,
        borderColor: "#CDBFFF",
        gap: 12,
        ...TA.shadow.soft,
      }}
    >
      <View
        style={{
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View>
          <Text
            style={{
              color: TA.colors.ink,
              fontSize: 22,
              lineHeight: 26,
              fontFamily: TA.fonts.black,
              letterSpacing: -0.7,
            }}
          >
            Objets
          </Text>

          <Text
            style={{
              marginTop: 2,
              color: TA.colors.inkMuted,
              fontSize: 12,
              lineHeight: 15,
              fontFamily: TA.fonts.bold,
            }}
          >
            {unlockedFurniture.length} disponible(s)
            {nextLockedFurniture.length > 0
              ? ` · ${nextLockedFurniture.length} à débloquer`
              : ""}
          </Text>
        </View>

        <View
          style={{
            paddingVertical: 7,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: TA.colors.surface,
            borderWidth: 1,
            borderColor: "#D8CCFF",
          }}
        >
          <Text
            style={{
              color: TA.colors.purple,
              fontSize: 11,
              lineHeight: 14,
              fontFamily: TA.fonts.black,
            }}
          >
            Glisse horizontalement
          </Text>
        </View>
      </View>

      {unlockedFurniture.length === 0 ? (
        <View style={{ paddingHorizontal: 14 }}>
          <EmptyCard text="Termine quelques activités pour débloquer ton premier meuble." />
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            directionalLockEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onLayout={(event) => {
              setViewportWidth(
                event.nativeEvent.layout.width
              );
            }}
            onContentSizeChange={(width) => {
              setContentWidth(width);
            }}
            onScroll={(event) => {
              setScrollX(
                event.nativeEvent.contentOffset.x
              );
            }}
            style={{
              height: 128,
              flexGrow: 0,
            }}
            contentContainerStyle={{
              gap: 10,
              paddingHorizontal: 14,
              paddingBottom: 2,
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
          </ScrollView>

          <View
            style={{
              height: 4,
              marginHorizontal: 14,
              borderRadius: 999,
              overflow: "hidden",
              backgroundColor:
                "rgba(124, 91, 238, 0.18)",
            }}
          >
            <View
              style={{
                width: Math.max(thumbWidth, 0),
                height: 4,
                borderRadius: 999,
                backgroundColor: TA.colors.purple,
                transform: [
                  {
                    translateX: thumbLeft,
                  },
                ],
              }}
            />
          </View>
        </>
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
        width: 112,
        height: 126,
        padding: 10,
        borderRadius: 22,
        backgroundColor: "#FFFEFB",
        borderWidth: 1.5,
        borderColor: "rgba(90, 74, 54, 0.16)",
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
          height: 70,
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

function RoomFooterActions({
  onBack,
  onNewActivity,
}: {
  onBack: () => void;
  onNewActivity: () => void;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 18,
        backgroundColor: TA.colors.bgStart,
        borderTopWidth: 1,
        borderTopColor: "rgba(90, 74, 54, 0.10)",
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 520,
          alignSelf: "center",
          flexDirection: "row",
          gap: 10,
        }}
      >
        <Pressable
          onPress={onBack}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 54,
            borderRadius: 999,
            backgroundColor: TA.colors.surface,
            borderWidth: 1.5,
            borderColor: TA.colors.borderMedium,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <Text
            style={{
              color: TA.colors.ink,
              fontSize: 14,
              lineHeight: 17,
              fontFamily: TA.fonts.black,
            }}
          >
            Retour
          </Text>
        </Pressable>

        <Pressable
          onPress={onNewActivity}
          style={({ pressed }) => ({
            flex: 1.35,
            minHeight: 54,
            borderRadius: 999,
            backgroundColor: TA.colors.purple,
            borderWidth: 1.5,
            borderColor: TA.colors.purple,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.78 : 1,
            ...TA.shadow.soft,
          })}
        >
          <Text
            style={{
              color: TA.colors.white,
              fontSize: 14,
              lineHeight: 17,
              fontFamily: TA.fonts.black,
            }}
          >
            Nouvelle activité
          </Text>
        </Pressable>
      </View>
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

  const normalizedX = dragX / safeScale;
  const normalizedY = dragY / safeScale;

  const gridX =
    normalizedX / (ISO_TILE_WIDTH / 2) +
    normalizedY / (ISO_TILE_HEIGHT / 2);

  const gridY =
    -normalizedX / (ISO_TILE_WIDTH / 2) +
    normalizedY / (ISO_TILE_HEIGHT / 2);

  return {
    x: Math.round(gridX / 2),
    y: Math.round(gridY / 2),
  };
}

function isoPoint(
  x: number,
  y: number
) {
  return {
    x:
      ISO_ORIGIN_X +
      ((x - y) * ISO_TILE_WIDTH) / 2,

    y:
      ISO_ORIGIN_Y +
      ((x + y) * ISO_TILE_HEIGHT) / 2,
  };
}

function gridToScreen(
  item: RoomFurnitureItem,
  scale: number
) {
  const size = furnitureScreenSize(item, 1);

  const centerX =
    item.x + item.width / 2;

  const centerY =
    item.y + item.height / 2;

  const anchor = isoPoint(
    centerX,
    centerY
  );

  return {
    left:
      (anchor.x - size.width / 2) * scale,

    top:
      (anchor.y - size.height + 24) * scale,
  };
}

function furnitureScreenSize(
  item: RoomFurnitureItem,
  scale: number
) {
  const footprintWidth =
    ((item.width + item.height) *
      ISO_TILE_WIDTH) /
    2;

  const width = Math.max(
    128,
    footprintWidth * 1.35
  );

  const height = Math.max(
    132,
    width * 0.96 + item.height * 24
  );

  return {
    width: width * scale,
    height: height * scale,
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
