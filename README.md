# Unbeatable Tic Tac Toe

A React Native mobile application featuring an unbeatable Tic Tac Toe game with a sleek, modern UI and robust features.

## Features

- Beautiful, modern UI with gradients, glassmorphism, and glowing effects
- Dark mode support with theme toggle in settings
- Unbeatable AI opponent using optimal Tic Tac Toe strategy
- Option to choose who goes first (player or computer)
- Persistent stats (wins, losses, draws, streaks) and theme using AsyncStorage
- Modern home screen with animated stats, progress ring, and win streak trophy
- Share your results and challenge friends
- Animated confetti for achievements
- Custom app icon and splash screen
- Responsive design for iOS and Android

## How to Run

1. Make sure you have Node.js and npm installed
2. Install Expo CLI globally:
   ```bash
   npm install -g expo-cli
   ```
3. Clone this repository
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npx expo start
   ```
6. Use the Expo Go app on your mobile device to scan the QR code, or press 'i' for iOS simulator or 'a' for Android emulator

## Technical Details

### AI Implementation

The computer player uses a strategic approach to ensure it never loses:

1. **Winning Move Check**: First checks if it has a winning move available
2. **Blocking Move**: If no winning move, blocks the player's winning move
3. **Center Control**: Takes the center if available (optimal position)
4. **Corner Strategy**: Takes available corners (second-best positions)
5. **Random Selection**: If no strategic moves available, takes any available space

This strategy ensures the computer will:
- Win if the player makes a mistake
- Force a draw if the player plays optimally
- Never lose a game

### Technologies Used

- **React Native** & **Expo**
- **TypeScript**
- **Expo Linear Gradient** (gradients)
- **React Native SVG** (charts and progress rings)
- **@react-native-async-storage/async-storage** (persistence)
- **Jest** (unit testing)
- **React Native Reanimated** (animations)

### Game Logic

The game uses a 3x3 grid represented as a 9-element array. Each position can be:
- `null`: Empty space
- `'X'`: Player's move
- `'O'`: Computer's move

Win conditions are checked using predefined winning combinations (rows, columns, diagonals).

### UI Components & Visuals

- **Game Board**: 3x3 grid with glassy, glowing, and animated effects
- **Status Header**: Gradient header with current game state and turn
- **Result Modal**: Displays game outcome, confetti, and new game/share options
- **Start Modal**: Allows choosing who goes first
- **Home Screen**: Animated stats (pie chart, progress ring, trophy), share button, and modern layout
- **Settings Screen**: Theme toggle and app preferences
- **Custom App Icon & Splash**: Branded visuals for launch and home screen

## Contributing

Feel free to submit issues and enhancement requests!

## Running Unit Tests

This project uses [Jest](https://jestjs.io/) for unit testing (with TypeScript support via ts-jest).

To run all unit tests locally:

```sh
npm test
```

Or to run a specific test file:

```sh
npx jest game/ai.test.ts 
```

### Test Coverage
- AI logic (minimax, blocking, winning, fork, draw)
- Board/game state logic (reset, move validity, win/draw detection)
- Stats and persistence logic

### Continuous Integration

Unit tests are automatically run on every pull request and push to the `main` branch using GitHub Actions. See `.github/workflows/test.yml` for details.
