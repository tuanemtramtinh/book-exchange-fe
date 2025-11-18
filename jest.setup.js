/* eslint-disable no-undef */
// Setup file for Jest tests

// Add custom matchers for React Native
import "@testing-library/jest-native/extend-expect";

if (!global.setImmediate) {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

if (!global.clearImmediate) {
  global.clearImmediate = (timer) => clearTimeout(timer);
}

// Mock React Native Reanimated with a lightweight stub that avoids ESM imports
jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");

  const mock = {
    View,
    createAnimatedComponent: jest.fn((Component) => Component),
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedStyle: jest.fn((styleBuilder) => styleBuilder()),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    runOnJS: jest.fn((fn) => fn),
    Easing: {
      bezier: jest.fn(() => jest.fn()),
    },
  };

  return {
    __esModule: true,
    ...mock,
    default: mock,
  };
});

// Mock expo modules
jest.mock("expo-constants", () => ({
  manifest: {},
  sessionId: "test-session-id",
  systemFonts: [],
}));

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const View = require("react-native/Libraries/Components/View/View");
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Mock react-native-vector-icons
jest.mock("@expo/vector-icons", () => ({
  FontAwesome: "FontAwesome",
  MaterialIcons: "MaterialIcons",
  AntDesign: "AntDesign",
  // Add other icon families as needed
}));
