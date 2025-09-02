// jest.setup.js
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// Replace native AsyncStorage with mock
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
