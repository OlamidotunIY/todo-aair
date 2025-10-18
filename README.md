# Todo Aair

A simple React Native (Expo) Todo app built with Expo Router, Zustand for state management, and AsyncStorage for persistence.

**🎤 NEW: Stage 2 - Voice-to-Task Feature**
Now includes intelligent voice input that converts natural speech like "Buy groceries and call mom" into multiple tasks automatically!

This README explains how to run the app (including on Expo Go), the implemented functionality, how each feature works, and how the project aligns with the provided project requirements.

## Checklist (requirements mapping)

### Stage 1 Features
- [x] Add new tasks (title + optional description)
- [x] Mark tasks completed/incomplete
- [x] Delete tasks (moves to Trash)
- [x] Show list of all tasks
- [x] Display completed vs incomplete tasks with visual distinction
- [x] Persist tasks between launches using AsyncStorage (via zustand persist)
- [x] Navigation with React Navigation / Expo Router (Task List, Create Task, Trash)
- [x] Simple, clean UI and basic edge-case handling (empty title validation, no tasks state handled)

### Stage 2 Features (Voice-to-Task)
- [x] Floating Action Button (FAB) for voice input on task list screen
- [x] Expo SpeechRecognizer integration with permission handling
- [x] Visual feedback (pulsing animation, state colors) while recording
- [x] Hybrid task parsing: OpenAI GPT-4o-mini (primary) + Compromise NLP (fallback)
- [x] Natural language processing to split multi-task speech into individual tasks
- [x] Automatic task creation from parsed voice input
- [x] Offline mode support (works without API key using local NLP)
- [x] Error handling for permissions, network failures, and transcription issues
- [x] User feedback via alerts and haptic responses

## Project structure (important files)

### Core Application
- `app/_layout.tsx` - Root layout with font loading, theme provider, and navigation setup
- `app/(task)/_layout.tsx` - Task group layout configuration
- `app/(task)/index.tsx` - Main task list screen with search, filters, sort, voice input, and task management
- `app/(task)/create-task.tsx` - Create task screen with Formik validation
- `app/(task)/trash.tsx` - Trash screen for deleted tasks
- `app/+not-found.tsx` - 404 fallback screen

### State Management & Data
- `store/useTask.ts` - Zustand store for tasks with AsyncStorage persistence
- `store/useTheme.ts` - Theme management store

### Components
- `components/VoiceFAB.tsx` - Floating action button for voice input with animations
- `components/ui/TaskRow.tsx` - Individual task row component
- `components/ui/FilterButton.tsx` - Task filtering UI
- `components/ui/SortButton.tsx` - Task sorting UI
- `components/ui/IconSymbol.tsx` - Icon wrapper component
- `components/ThemedButton.tsx` - Themed button component
- `components/ThemedText.tsx` - Themed text component
- `components/ThemedTextInput.tsx` - Themed text input component
- `components/ThemedView.tsx` - Themed view container
- `components/ThemeToggle.tsx` - Theme switching component
- `components/Collapsible.tsx` - Collapsible section component

### Utilities & Hooks
- `hooks/useSpeechRecognition.ts` - Custom hook for speech recognition with event handling
- `utils/parseTasks.ts` - Hybrid task parser (OpenAI + NLP fallback)
- `utils/useSyncSystemTheme.ts` - System theme synchronization

### Configuration
- `app.json` - Expo configuration with plugins and environment variables
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## Features and how they work

1) Add new tasks

	- Where: `app/(task)/create-task.tsx` (Create Task screen).
	- How: Uses Formik for form state and Yup for validation. The form requires a title (min 3 characters). Description is optional. Priority selection is provided (low / medium / high).
	- On submit: Calls `addTask` from the `useTasks` zustand store which creates a task object with a UUID, timestamps, and saves it to the `tasks` array.

2) Mark tasks completed / incomplete

	- Where: `app/(task)/index.tsx` and `components/ui/TaskRow.tsx`.
	- How: Each `TaskRow` contains a toggle control. Toggling calls `toggleTask(id)` in `useTasks` which flips the `completed` boolean and updates `updatedAt`.
	- Visual distinction: Completed tasks are styled differently in `TaskRow` (strikethrough or reduced opacity), so users can distinguish completed vs incomplete at a glance.

3) Delete tasks

	- Where: `TaskRow` exposes a delete action which calls `moveToTrash(id)` in the store.
	- How: `moveToTrash` removes the task from `tasks` and adds it to a `trash` array in the zustand store. The Trash screen (`/trash`) allows restore or emptying the trash.

3.5) 🎤 Voice-to-Task (NEW - Stage 2)

	- Where: `app/(task)/index.tsx` with `components/VoiceFAB.tsx` and `utils/parseTasks.ts`.
	- What: A floating action button (blue microphone icon) in the bottom-right corner of the task list screen.
	- How it works:
		- Tap the FAB to start voice recording (turns red and pulses)
		- Speak naturally: "Buy groceries and call mom"
		- Tap again to stop (or wait for silence)
		- The app transcribes speech using Expo SpeechRecognizer
		- Transcript is parsed using hybrid approach:
			• Primary: OpenAI GPT-4o-mini API (if API key configured)
			• Fallback: Compromise NLP library (works offline)
		- Multiple tasks are automatically created and saved
		- Confirmation alert shows all created tasks
	- Features:
		- Works offline (without API key) using local NLP
		- Removes filler words ("please", "remind me to")
		- Splits on natural conjunctions ("and", "then", commas)
		- Handles permissions automatically
		- Visual states: idle (blue), listening (red), processing (orange)
		- Haptic feedback on press

4) Show list of all tasks

	- Where: `app/(task)/index.tsx` uses a `FlatList` to render tasks returned from `getVisibleTasks()`.
	- Filtering & search: The list is driven by `getVisibleTasks()` which filters by `filter` (all/completed/incomplete), applies search text, and sorts (recent/oldest/dueDate).

5) Data persistence

	- Where: `store/useTask.ts` uses `zustand` with the `persist` middleware configured to use `createJSONStorage(() => AsyncStorage)`.
	- How: The entire tasks state (tasks, trash, filter, etc.) is persisted under the key `todo-storage` in AsyncStorage. Tasks survive app restarts and Expo reloads.

6) Navigation

	- Where: `app/_layout.tsx` and `app/(task)/_layout.tsx` define the navigation structure using Expo Router. Screens included: `index` (task list), `create-task`, `trash`, and a `+not-found` fallback.
	- How: Expo Router maps file-based routes to screens; navigation uses `router.push('/create-task')` and similar calls.

7) Basic UI/UX and edge cases

	- Validation: Create Task uses Yup to enforce a non-empty title (min 3 chars). The Create button is disabled until the form is valid and dirty.
	- No tasks: The `FlatList` will render nothing if there are no tasks; the UI components are designed with padding and a floating create button so the screen remains usable. You can add a minor improvement: add an explicit empty state message in `index.tsx` if desired (not required).

## How this aligns with the project requirement

- Task Management: Implemented via `useTasks` store—`addTask`, `toggleTask`, `moveToTrash` satisfy creating, toggling, and deleting tasks.
- Task Display: `index.tsx` renders tasks and `getVisibleTasks()` provides filtering and sorting; `TaskRow` visually distinguishes completed tasks.
- Data Persistence: `zustand` + `persist` with AsyncStorage stores the app data under `todo-storage` so tasks persist between launches.
- Navigation: Expo Router (file-based routing) is used with three primary screens—Task List (`index.tsx`), Create Task, and Trash.
- Basic UI/UX: Form validation, search, filters, sort, and a clean layout are implemented. Edge cases like empty titles are prevented by validation; no tasks case is handled by the list layout (recommendation below to add an explicit message).

## Run locally (development)

Prerequisites

- Node.js (16+ recommended)
- npm or yarn
- Expo CLI or use the `npx expo` commands

Install dependencies

```bash
npm install
# or
yarn install
```

### 🎤 Voice Feature Setup

**Important**: The Voice-to-Task feature requires a **development build** (not Expo Go) because `expo-speech-recognition` uses native modules.

#### Option 1: Download Pre-built APK (Android - Easiest)

1. **Download the development build**:
   - Link: https://expo.dev/accounts/dotman1999/projects/todo-aair/builds/42296abd-6194-4988-afde-36b85584369d
   - Or scan this QR code on your Android device:

   <img src="./assets/RPu193.svg" width="200" alt="QR Code" />

2. **Install the APK** on your Android device

3. **Configure OpenAI API Key** (optional but recommended):

   Edit `app.json` and add your OpenAI API key:
   ```json
   {
     "expo": {
       ...
       "extra": {
         "OPENAI_API_KEY": "sk-your-actual-api-key-here"
       }
     }
   }
   ```

   Get your key from: https://platform.openai.com/api-keys

4. **Start the development server**:
   ```bash
   npx expo start --dev-client
   ```

5. **Connect from the app**: Open the installed app on your device and scan the QR code from the terminal

**Note**: The app works offline without an API key (uses local NLP), but provides better results with OpenAI configured.

#### Option 2: Build Locally (Android/iOS)

For Android:
```bash
npx expo prebuild
npx expo run:android
```

For iOS (macOS only):
```bash
npx expo prebuild
npx expo run:ios
```

Start the Expo dev server

```bash
npx expo start
# or
yarn expo start
```

### For Testing with Expo Go (Stage 1 Features Only)

**Note**: Voice feature will NOT work in Expo Go. Use the development build above for full functionality.

Open on a device using Expo Go

1. Install the Expo Go app on your Android/iOS device.
2. Start the dev server (see previous step). A QR code will appear in the terminal or in the browser devtools.
3. Scan the QR code with the Expo Go app (iOS: use the camera app on iOS 13+ or the QR scanner inside Expo Go). The app will load on your device.

## Helpful commands

- Start: `npx expo start` or `yarn expo start`
- Install a package: `npm install <pkg>`
- Run on Android emulator (if configured): `npx expo run:android` (requires Android setup)
- Run on iOS simulator (macOS only): `npx expo run:ios`


## Testing

This repository includes unit tests using Jest and @testing-library/react-native. There are test files in `__tests__/` including:

- `__tests__/useTask.test.ts` — tests the `useTasks` zustand store. The spec covers:
  - creating a new task via `addTask`
  - creating a task via a test-only `addTaskObject` helper (the test uses optional chaining so this helper is optional)
  - toggling task completion with `toggleTask`
- `__tests__/ThemedButton.test.tsx` — UI snapshot/behavior test for the themed button component.

Run tests (watch mode — default):

```bash
npm run test
# or
yarn test
```
