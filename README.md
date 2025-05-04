# Unbeatable Tic Tac Toe

A React Native mobile application featuring an unbeatable Tic Tac Toe game with a sleek, modern UI.

## Features

- Beautiful, modern UI with gradient colors and smooth animations
- Unbeatable AI opponent using optimal Tic Tac Toe strategy
- Option to choose who goes first (player or computer)
- Clear game state indicators and win/lose/draw messages
- Responsive design that works on both iOS and Android

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

- **React Native**: For cross-platform mobile development
- **Expo**: For simplified development and deployment
- **TypeScript**: For type safety and better development experience
- **Expo Linear Gradient**: For beautiful gradient effects
- **React Native Reanimated**: For smooth animations

### Game Logic

The game uses a 3x3 grid represented as a 9-element array. Each position can be:
- `null`: Empty space
- `'X'`: Player's move
- `'O'`: Computer's move

Win conditions are checked using predefined winning combinations (rows, columns, diagonals).

### UI Components

- **Game Board**: 3x3 grid with touchable squares
- **Status Header**: Shows current game state and turn
- **Result Modal**: Displays game outcome and new game option
- **Start Modal**: Allows choosing who goes first

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
npx jest path/to/your.test.ts
```

### Continuous Integration

Unit tests are automatically run on every pull request and push to the `main` branch using GitHub Actions. See `.github/workflows/test.yml` for details.
