import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, SafeAreaView, ScrollView, Share, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type Player = 'X' | 'O' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

const STATS_KEY = 'tictactoe_stats';

export default function PlayScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw'>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [userFirst, setUserFirst] = useState<boolean | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const shareViewRef = useRef<View>(null);

  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight || 32 : 44;

  const checkWinner = (board: Board): Player | 'draw' | null => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return board.includes(null) ? null : 'draw';
  };

  const makeComputerMove = (board: Board): number => {
    // Check for winning move
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const newBoard = [...board];
        newBoard[i] = 'O';
        if (checkWinner(newBoard) === 'O') return i;
      }
    }

    // Block user's winning move
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const newBoard = [...board];
        newBoard[i] = 'X';
        if (checkWinner(newBoard) === 'X') return i;
      }
    }

    // Take center if available
    if (!board[4]) return 4;

    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !board[i]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Take any available space
    const availableSpaces = board.map((cell, index) => !cell ? index : -1).filter(i => i !== -1);
    return availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
  };

  const handlePress = (index: number) => {
    if (!gameStarted || board[index] || winner || (userFirst === false && !isXNext)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    }
  };

  useEffect(() => {
    if (!isXNext && !winner && userFirst !== null && gameStarted) {
      const computerMove = makeComputerMove(board);
      const newBoard = [...board];
      newBoard[computerMove] = 'O';
      setBoard(newBoard);
      setIsXNext(true);

      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
      }
    }
  }, [isXNext, board, winner, userFirst, gameStarted]);

  useEffect(() => {
    if (winner) {
      AsyncStorage.getItem(STATS_KEY).then((data: string | null) => {
        let stats = { won: 0, lost: 0, draw: 0 };
        if (data) {
          try {
            stats = JSON.parse(data);
          } catch {}
        }
        if (winner === 'X') stats.won++;
        else if (winner === 'O') stats.lost++;
        else if (winner === 'draw') stats.draw++;
        AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
      });
    }
  }, [winner]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameStarted(false);
    setUserFirst(null);
  };

  const startGame = (userGoesFirst: boolean) => {
    setUserFirst(userGoesFirst);
    setShowStartModal(false);
    setGameStarted(true);
    if (!userGoesFirst) {
      setIsXNext(false);
    }
  };

  const handleShare = async () => {
    if (!winner) return;
    setIsSharing(true);
    try {
      const uri = await captureRef(shareViewRef, {
        format: 'png',
        quality: 1,
      });
      let resultMsg = '';
      if (winner === 'X') resultMsg = 'I just won a game of Tic-Tac-Nope! 🏆';
      else if (winner === 'O') resultMsg = 'I just lost to the unbeatable Tic-Tac-Nope AI! 🤖';
      else if (winner === 'draw') resultMsg = "It's a draw on Tic-Tac-Nope! 🤝";
      await Share.share({
        url: uri,
        message: `${resultMsg}\n\nCan you beat the AI? Play now! #TicTacNope`,
      });
    } catch (error) {
      // Optionally handle error
    } finally {
      setIsSharing(false);
    }
  };

  const renderSquare = (index: number) => {
    const isActive = board[index] === 'X' ? colors.gradientStart : colors.gradientEnd;
    return (
      <TouchableOpacity
        style={[styles.square, { borderColor: colors.tint }]}
        onPress={() => handlePress(index)}
      >
        {board[index] && (
          <ThemedText style={[styles.squareText, { color: isActive }]}>
            {board[index]}
          </ThemedText>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.container}>
          {!gameStarted ? (
            <ThemedView style={styles.startContainer}>
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: colors.tint }]}
                onPress={() => setShowStartModal(true)}
              >
                <ThemedText style={styles.startButtonText}>Start Game</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <>
              <View ref={shareViewRef} collapsable={false} style={{ alignItems: 'center' }}>
                {winner && (
                  <ThemedText style={styles.resultText}>
                    {winner === 'X' ? 'You Won!' : winner === 'O' ? 'You Lost!' : "It's a Draw!"}
                  </ThemedText>
                )}
                <ThemedView style={styles.board}>
                  <ThemedView style={styles.row}>
                    {renderSquare(0)}
                    {renderSquare(1)}
                    {renderSquare(2)}
                  </ThemedView>
                  <ThemedView style={styles.row}>
                    {renderSquare(3)}
                    {renderSquare(4)}
                    {renderSquare(5)}
                  </ThemedView>
                  <ThemedView style={styles.row}>
                    {renderSquare(6)}
                    {renderSquare(7)}
                    {renderSquare(8)}
                  </ThemedView>
                </ThemedView>
              </View>

              {winner && (
                <View style={styles.resultContainer}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: colors.tint }]}
                      onPress={resetGame}
                      disabled={isSharing}
                    >
                      <ThemedText style={styles.buttonText}>New Game</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#4f8cff' }]}
                      onPress={handleShare}
                      disabled={isSharing}
                    >
                      {isSharing ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <ThemedText style={styles.buttonText}>Share</ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}

          <Modal
            visible={showStartModal}
            transparent
            animationType="fade"
          >
            <ThemedView style={styles.modalContainer}>
              <ThemedView style={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>Who goes first?</ThemedText>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.tint }]}
                  onPress={() => startGame(true)}
                >
                  <ThemedText style={styles.modalButtonText}>I&apos;ll go first</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.tint }]}
                  onPress={() => startGame(false)}
                >
                  <ThemedText style={styles.modalButtonText}>Computer goes first</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </Modal>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startButton: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  board: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    width: 100,
    aspectRatio: 1,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'visible',
  },
  squareText: {
    fontSize: 26,
    lineHeight: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 0,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 