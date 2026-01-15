import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../styles/theme';
import { getTopScores } from '../utils/storage';

const LeaderboardScreen = ({ onNavigate }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    const topScores = await getTopScores();
    setScores(topScores);
    setLoading(false);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const getMedalEmoji = (rank) => {
    switch(rank) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      <Text style={styles.subtitle}>Top 5 Coffee Champions</Text>

      <View style={styles.scoresContainer}>
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : scores.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🫘</Text>
            <Text style={styles.emptyText}>No scores yet!</Text>
            <Text style={styles.emptySubtext}>Be the first to collect some beans!</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {scores.map((entry, index) => (
              <View key={index} style={[
                styles.scoreItem,
                index === 0 && styles.scoreItemFirst
              ]}>
                <View style={styles.rankSection}>
                  <Text style={styles.medal}>{getMedalEmoji(index)}</Text>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.usernameText} numberOfLines={1}>
                    {entry.username || 'Anonymous'}
                  </Text>
                  <Text style={styles.dateText}>
                    {formatDate(entry.date)}
                  </Text>
                </View>

                <View style={styles.scoreSection}>
                  <Text style={[
                    styles.scoreText,
                    index === 0 && styles.scoreTextFirst
                  ]}>
                    {entry.score}
                  </Text>
                  <Text style={styles.beansText}>beans</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{scores.length}</Text>
          <Text style={styles.statLabel}>Total Players</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {scores.length > 0 ? scores[0].score : 0}
          </Text>
          <Text style={styles.statLabel}>Top Score</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => onNavigate('menu')}
      >
        <Text style={styles.buttonText}>← Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    ...FONTS.title,
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    ...FONTS.body,
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.secondary,
    marginBottom: 25,
  },
  scoresContainer: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.card,
  },
  scrollView: {
    flex: 1,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    ...SHADOWS.button,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  scoreItemFirst: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF9E6',
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  medal: {
    fontSize: 28,
    marginRight: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    flex: 1,
    marginRight: 10,
  },
  usernameText: {
    ...FONTS.subtitle,
    fontSize: 18,
    marginBottom: 2,
  },
  dateText: {
    ...FONTS.body,
    fontSize: 12,
    color: COLORS.secondary,
  },
  scoreSection: {
    alignItems: 'flex-end',
  },
  scoreText: {
    ...FONTS.score,
    fontSize: 24,
    color: COLORS.success,
  },
  scoreTextFirst: {
    fontSize: 28,
    color: '#FFD700',
  },
  beansText: {
    ...FONTS.body,
    fontSize: 11,
    color: COLORS.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    ...FONTS.body,
    fontSize: 20,
    textAlign: 'center',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    ...FONTS.body,
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.card,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 15,
  },
  statValue: {
    ...FONTS.score,
    fontSize: 32,
    color: COLORS.success,
  },
  statLabel: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 5,
  },
  backButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  buttonText: {
    ...FONTS.button,
    fontSize: 18,
  },
});

export default LeaderboardScreen;
