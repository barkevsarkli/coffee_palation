/**
 * Coffee Palation - Leaderboard/Scores Screen Styles
 */

import { StyleSheet, Dimensions } from 'react-native';
import COLORS from './colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const leaderboardStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.espresso,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 14,
    color: COLORS.coffee,
    marginTop: 5,
  },
  
  // Scores List Container
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  
  emptyIcon: {
    fontSize: 70,
    marginBottom: 15,
    opacity: 0.6,
  },
  
  emptyText: {
    fontSize: 18,
    color: COLORS.coffee,
    textAlign: 'center',
  },
  
  emptySubtext: {
    fontSize: 14,
    color: COLORS.latte,
    marginTop: 5,
  },
  
  // Score Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  
  rowFirst: {
    borderWidth: 3,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldLight,
  },
  
  rowSecond: {
    borderWidth: 2,
    borderColor: '#C0C0C0',
    backgroundColor: '#F5F5F5',
  },
  
  rowThird: {
    borderWidth: 2,
    borderColor: '#CD7F32',
    backgroundColor: '#FFF3E0',
  },
  
  // Medal
  medal: {
    fontSize: 32,
    marginRight: 12,
    width: 40,
    textAlign: 'center',
  },
  
  // Player Info
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.espresso,
  },
  
  date: {
    fontSize: 12,
    color: COLORS.coffee,
    marginTop: 2,
  },
  
  // Score
  score: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  
  scoreFirst: {
    fontSize: 32,
    color: COLORS.goldDark,
  },
  
  // Back Button
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  
  // Decorative
  crown: {
    position: 'absolute',
    top: -20,
    right: 10,
    fontSize: 30,
  },
});

export default leaderboardStyles;

