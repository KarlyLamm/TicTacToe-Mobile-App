import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, Modal, Platform, SafeAreaView, ScrollView, Share, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { getBestMove } from '../../game/ai';

const WINNING_COMBINATIONS: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];
const STATS_KEY = 'tictactoe_stats';
const windowWidth = Dimensions.get('window').width;

type Player = 'X' | 'O' | null;
type Board = Player[];

export default function PlayScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerGradient: {
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 32 : 44,
      paddingBottom: 18,
      paddingHorizontal: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    headerGlass: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: 18,
      paddingHorizontal: 22,
      paddingVertical: 10,
      marginBottom: 8,
      shadowColor: '#fff',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#fff',
      letterSpacing: 1.2,
      textShadowColor: 'rgba(0,0,0,0.18)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
    },
    turnIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 2,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 7,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    turnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      letterSpacing: 0.5,
    },
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: 140,
      zIndex: 10,
      pointerEvents: 'none',
    },
    scrollView: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      paddingBottom: 32,
    },
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    startContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    startButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 20,
      borderRadius: 25,
      backgroundColor: '#fff',
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.10,
      shadowRadius: 6,
      marginTop: 24,
    },
    startButtonText: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    boardGlass: {
      backgroundColor: 'transparent',
      borderRadius: 32,
      padding: 20,
      marginBottom: 18,
      shadowColor: colorScheme === 'dark' ? '#4a90e2' : '#2f95dc',
      shadowOpacity: 0.3,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 0 },
      elevation: 8,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? 'rgba(74,144,226,0.2)' : 'rgba(47,149,220,0.2)',
    },
    board: {
      alignSelf: 'center',
      marginTop: 0,
      marginBottom: 0,
      backgroundColor: 'transparent',
    },
    row: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
    },
    squareWrap: {
      margin: 6,
      borderRadius: 20,
      overflow: 'visible',
      backgroundColor: 'transparent',
    },
    square: {
      width: 85,
      aspectRatio: 1,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: 'transparent',
      borderColor: colorScheme === 'dark' ? 'rgba(74,144,226,0.3)' : 'rgba(47,149,220,0.3)',
      shadowColor: colorScheme === 'dark' ? '#4a90e2' : '#2f95dc',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      overflow: 'visible',
    },
    squareText: {
      fontSize: 48,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'monospace',
      letterSpacing: 2,
      textShadowColor: colorScheme === 'dark' ? '#4a90e2' : '#2f95dc',
      textShadowRadius: 12,
      textShadowOffset: { width: 0, height: 0 },
    },
    resultModal: {
      alignSelf: 'center',
      marginTop: 18,
      width: '90%',
      borderRadius: 24,
      overflow: 'hidden',
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 12,
    },
    resultModalGradient: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 18,
      borderRadius: 24,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultTextPremium: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 18,
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.18)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 4,
    },
    resultButtonRow: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 25,
      marginHorizontal: 2,
      backgroundColor: colors.tint,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      padding: 20,
      borderRadius: 20,
      alignItems: 'center',
      width: '80%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colors.text,
    },
    modalButton: {
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 25,
      marginBottom: 10,
      width: '100%',
      alignItems: 'center',
      backgroundColor: colors.tint,
    },
    modalButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw'>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [userFirst, setUserFirst] = useState<boolean | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const shareViewRef = useRef<View>(null);
  const turnAnim = useRef(new Animated.Value(0)).current;
  const aiLetter = 'O';
  const userLetter = 'X';

  // Animate turn indicator
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(turnAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(turnAnim, { toValue: 0, duration: 900, useNativeDriver: true })
      ])
    ).start();
  }, []);

  // Check winner and highlight
  const checkWinner = (board: Board): Player | 'draw' | null => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinningLine(combination);
        return board[a];
      }
    }
    setWinningLine([]);
    return board.includes(null) ? null : 'draw';
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
      if (gameWinner !== 'draw') setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  useEffect(() => {
    if (!isXNext && !winner && userFirst !== null && gameStarted) {
      setTimeout(() => {
        const computerMove = getBestMove(board, aiLetter, userLetter);
        const newBoard = [...board];
        newBoard[computerMove] = aiLetter;
        setBoard(newBoard);
        setIsXNext(true);
        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          if (gameWinner !== 'draw') setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
        }
      }, 600);
    }
  }, [isXNext, board, winner, userFirst, gameStarted, aiLetter, userLetter]);

  useEffect(() => {
    if (winner) {
      AsyncStorage.getItem(STATS_KEY).then((data) => {
        let stats = { won: 0, lost: 0, draw: 0 };
        if (data) {
          try { stats = JSON.parse(data); } catch {}
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
    setWinningLine([]);
  };

  const startGame = (userGoesFirst: boolean) => {
    setUserFirst(userGoesFirst);
    setShowStartModal(false);
    setGameStarted(true);
    if (!userGoesFirst) setIsXNext(false);
  };

  const handleShare = async () => {
    if (!winner) return;
    setIsSharing(true);
    try {
      const uri = await captureRef(shareViewRef, { format: 'png', quality: 1 });
      let resultMsg = '';
      if (winner === 'X') resultMsg = 'I just won a game of Tic-Tac-Nope! 🏆';
      else if (winner === 'O') resultMsg = 'I just lost to the unbeatable Tic-Tac-Nope AI! 🤖';
      else if (winner === 'draw') resultMsg = "It's a draw on Tic-Tac-Nope! 🤝";
      await Share.share({ url: uri, message: `${resultMsg}\n\nCan you beat the AI? Play now! #TicTacNope` });
    } catch (error) {} finally { setIsSharing(false); }
  };

  // Board animation
  const boardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(boardAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [gameStarted]);

  // Square animation
  const renderSquare = (index: number) => {
    const isActive = board[index] === 'X' ? '#4a90e2' : '#ff6b6b';
    const isWinner = winningLine.includes(index);
    return (
      <Animated.View
        key={index}
        style={[
          styles.squareWrap,
          isWinner && { 
            shadowColor: isActive, 
            shadowOpacity: 0.5, 
            shadowRadius: 16, 
            elevation: 8, 
            transform: [{ scale: 1.08 }] 
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.square,
            { 
              borderColor: isActive, 
              backgroundColor: isWinner 
                ? colorScheme === 'dark' 
                  ? 'rgba(74,144,226,0.15)' 
                  : 'rgba(47,149,220,0.15)'
                : colorScheme === 'dark'
                  ? 'rgba(74,144,226,0.05)'
                  : 'rgba(47,149,220,0.05)'
            },
            isWinner && { borderWidth: 3 },
          ]}
          activeOpacity={0.7}
          onPress={() => handlePress(index)}
        >
          {board[index] && (
            <Animated.Text
              style={[
                styles.squareText,
                { 
                  color: isActive, 
                  opacity: 1, 
                  transform: [{ scale: 1.1 }] 
                },
                isWinner && { 
                  textShadowColor: isActive, 
                  textShadowRadius: 12, 
                  textShadowOffset: { width: 0, height: 0 } 
                },
              ]}
            >
              {board[index]}
            </Animated.Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Confetti burst
  const confettiArray = Array.from({ length: 18 });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }] }>
      {/* Floating glassy header */}
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={[styles.headerGradient, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
        <View style={styles.headerGlass}>
          <FontAwesome name="gamepad" size={28} color={colors.tint} style={{ marginRight: 10 }} />
          <ThemedText style={styles.headerTitle}>Tic-Tac-Nope</ThemedText>
        </View>
        <Animated.View style={[styles.turnIndicator, {
          backgroundColor: isXNext ? colors.gradientStart : colors.gradientEnd,
          opacity: turnAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
        }]}
        >
          <FontAwesome name={isXNext ? 'user' : 'cogs'} size={18} color="#fff" style={{ marginRight: 6 }} />
          <ThemedText style={styles.turnText}>{!gameStarted ? 'Ready?' : winner ? 'Game Over' : isXNext ? 'Your Turn' : 'Computer Thinking...'}</ThemedText>
        </Animated.View>
      </LinearGradient>

      {/* Confetti */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiArray.map((_, i) => (
            <Animated.Text
              key={i}
              style={{
                position: 'absolute',
                left: Math.random() * (windowWidth - 40),
                top: Math.random() * 120,
                fontSize: 28,
                opacity: 0.8,
                transform: [{ rotate: `${Math.random() * 360}deg` }],
              }}
            >
              🎉
            </Animated.Text>
          ))}
        </View>
      )}

      <ScrollView style={[styles.scrollView, { backgroundColor: 'transparent' }]} contentContainerStyle={[styles.scrollContent, { backgroundColor: 'transparent' }] }>
        <ThemedView style={[styles.container, { backgroundColor: 'transparent' }] }>
          {!gameStarted ? (
            <ThemedView style={styles.startContainer}>
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: colors.tint }]}
                onPress={() => setShowStartModal(true)}
                activeOpacity={0.92}
              >
                <FontAwesome name="play-circle" size={28} color="#fff" style={{ marginRight: 10 }} />
                <ThemedText style={styles.startButtonText}>Start Game</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <>
              {/* Shareable area starts here */}
              <Animated.View
                ref={shareViewRef}
                collapsable={false}
                style={{ alignItems: 'center', marginTop: 24, opacity: boardAnim, transform: [{ scale: boardAnim }] }}
              >
                <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <LinearGradient
                    colors={colorScheme === 'dark' ? ['#4a90e2', '#2f95dc'] : ['#a1c4fd', '#c2e9fb']}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 40,
                      width: 340,
                      height: 340,
                      alignSelf: 'center',
                      opacity: 0.45,
                      zIndex: 0,
                      shadowColor: colorScheme === 'dark' ? '#4a90e2' : '#2f95dc',
                      shadowOpacity: 0.7,
                      shadowRadius: 40,
                      shadowOffset: { width: 0, height: 0 },
                    }}
                  />
                  <ThemedView style={[styles.boardGlass, {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: colorScheme === 'dark' ? '#4a90e2' : '#2f95dc',
                    width: 320,
                    height: 320,
                    borderRadius: 32,
                    zIndex: 1,
                  }]}
                  >
                    <ThemedView style={styles.board}>
                      <ThemedView style={styles.row}>{[0, 1, 2].map(renderSquare)}</ThemedView>
                      <ThemedView style={styles.row}>{[3, 4, 5].map(renderSquare)}</ThemedView>
                      <ThemedView style={styles.row}>{[6, 7, 8].map(renderSquare)}</ThemedView>
                    </ThemedView>
                  </ThemedView>
                </View>
              </Animated.View>

              {winner && (
                <Animated.View style={[styles.resultModal, { opacity: boardAnim, transform: [{ translateY: boardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}
                >
                  <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.resultModalGradient}>
                    <FontAwesome name={winner === 'X' ? 'trophy' : winner === 'O' ? 'cogs' : 'handshake-o'} size={36} color="#fff" style={{ marginBottom: 8 }} />
                    <ThemedText style={styles.resultTextPremium}>
                      {winner === 'X' ? 'You Won!' : winner === 'O' ? 'You Lost!' : "It's a Draw!"}
                    </ThemedText>
                    <View style={styles.resultButtonRow}>
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.tint }]}
                        onPress={resetGame}
                        disabled={isSharing}
                        activeOpacity={0.92}
                      >
                        <ThemedText style={styles.buttonText}>New Game</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#4f8cff' }]}
                        onPress={handleShare}
                        disabled={isSharing}
                        activeOpacity={0.92}
                      >
                        {isSharing ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <ThemedText style={styles.buttonText}>Share</ThemedText>
                        )}
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </Animated.View>
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