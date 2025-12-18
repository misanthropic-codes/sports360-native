import BottomNavBar from "@/components/BottomNavBar";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useOrganizerStore } from "@/store/organizerAnalyticsStore";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Helper function to capitalize first letter of each word
const capitalizeWords = (str: string) => {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Tournament Modal
const TournamentModal = ({ visible, onClose, tournament }: any) => {
  if (!tournament) return null;

  const handleManageTournament = () => {
    onClose();
    setTimeout(() => {
      router.push(`/tournament/ManageTournament?id=${tournament.tournamentId}`);
    }, 300);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{tournament.tournamentName}</Text>
            <View style={styles.modalHeaderRow}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{capitalizeWords(tournament.status)}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingIcon}>★</Text>
                <Text style={styles.ratingValue}>{tournament.rating}</Text>
                <Text style={styles.ratingCount}>
                  ({tournament.totalRatings})
                </Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailsCard}>
              <Text style={styles.sectionLabel}>TOURNAMENT DETAILS</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Teams</Text>
                  <Text style={styles.statValue}>
                    {tournament.teamCount}/{tournament.maxTeams}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Matches</Text>
                  <Text style={styles.statValue}>
                    {tournament.matchesCount}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Registrations</Text>
                  <Text style={styles.statValue}>
                    {tournament.registrations}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.financialCard}>
              <Text style={styles.financialLabel}>FINANCIAL OVERVIEW</Text>
              <View style={styles.financialRow}>
                <Text style={styles.financialItemLabel}>Entry Fee</Text>
                <Text style={styles.financialItemValue}>
                  ₹{tournament.entryFee}
                </Text>
              </View>
              <View style={[styles.financialRow, styles.financialRowBorder]}>
                <Text style={styles.financialItemLabel}>Total Revenue</Text>
                <Text style={styles.financialItemValue}>
                  ₹{tournament.revenue}
                </Text>
              </View>
              <View style={[styles.financialRow, styles.financialRowBorder]}>
                <Text style={styles.financialItemLabel}>Expenses</Text>
                <Text style={styles.financialItemValue}>
                  ₹{tournament.expenses}
                </Text>
              </View>
              <View style={[styles.financialRow, styles.financialRowBorder]}>
                <Text style={styles.financialItemLabel}>Prize Pool</Text>
                <Text style={styles.financialItemValue}>
                  ₹{tournament.prizePool}
                </Text>
              </View>
              <View style={[styles.financialRow, styles.financialRowTotal]}>
                <Text style={styles.financialTotalLabel}>Net Profit</Text>
                <Text style={styles.financialTotalValue}>
                  ₹{tournament.profit}
                </Text>
              </View>
            </View>

            <View style={styles.scheduleCard}>
              <Text style={styles.sectionLabel}>SCHEDULE</Text>
              <View style={styles.scheduleItem}>
                <Text style={styles.statLabel}>Start Date</Text>
                <Text style={styles.scheduleValue}>
                  {new Date(tournament.startDate).toLocaleString()}
                </Text>
              </View>
              <View style={styles.scheduleItem}>
                <Text style={styles.statLabel}>End Date</Text>
                <Text style={styles.scheduleValue}>
                  {new Date(tournament.endDate).toLocaleString()}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={handleManageTournament}
            >
              <Text style={styles.manageButtonText}>Manage Tournament</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CricketDashboard: React.FC = () => {
  const { user } = useAuth();
  const name = user?.fullName || "Player";
  const { summary, tournaments, fetchAnalytics } = useOrganizerStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const token = user?.token || "";
      if (token) {
        await fetchAnalytics(token);
      }
    };
    loadAnalytics();
  }, [user]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        Platform.OS === "android"
          ? { paddingTop: StatusBar.currentHeight }
          : {},
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        type="welcome"
        name={name}
        avatarUrl={`https://placehold.co/40x40/E2E8F0/4A5568?text=${name.charAt(0)}`}
        onNotificationPress={() => console.log("Notifications clicked")}
        onProfilePress={() => router.push("/profile")}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {summary && (
          <>
            {/* Quick Stats Row */}
            <View style={styles.quickStatsContainer}>
              <View style={styles.quickStatsRow}>
                <View style={styles.quickStatWrapper}>
                  <View style={styles.quickStatActive}>
                    <Text style={styles.quickStatLabelActive}>Active</Text>
                    <Text style={styles.quickStatValueActive}>
                      {summary.activeTournaments}
                    </Text>
                    <Text style={styles.quickStatSubActive}>Tournaments</Text>
                  </View>
                </View>
                <View style={styles.quickStatWrapper}>
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatLabel}>Total Teams</Text>
                    <Text style={styles.quickStatValue}>
                      {summary.totalTournamentsCreated * 8}
                    </Text>
                    <Text style={styles.quickStatSub}>Registered</Text>
                  </View>
                </View>
                <View style={styles.quickStatWrapper}>
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatLabel}>Rating</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.quickStatValue}>
                        {summary.overallRating.toFixed(1)}
                      </Text>
                      <Text style={styles.ratingStarSmall}>★</Text>
                    </View>
                    <Text style={styles.quickStatSub}>
                      {summary.totalRatingsReceived} reviews
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Main Metrics Grid */}
            <View style={styles.metricsContainer}>
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
              <View style={styles.metricsCard}>
                {/* Row 1 */}
                <View style={styles.metricsRowBorder}>
                  <View style={styles.metricHalfBorder}>
                    <Text style={styles.metricLabel}>Total Tournaments</Text>
                    <Text style={styles.metricValue}>
                      {summary.totalTournamentsCreated}
                    </Text>
                    <View style={styles.metricSubRow}>
                      <View style={styles.metricSubItem}>
                        <Text style={styles.metricSubLabel}>Completed</Text>
                        <Text style={styles.metricSubValue}>
                          {summary.completedTournaments}
                        </Text>
                      </View>
                      <View style={styles.metricSubItem}>
                        <Text style={styles.metricSubLabel}>Active</Text>
                        <Text style={styles.metricSubValuePurple}>
                          {summary.activeTournaments}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.metricHalf}>
                    <Text style={styles.metricLabel}>Matches Organized</Text>
                    <Text style={styles.metricValue}>
                      {summary.totalMatchesOrganized}
                    </Text>
                    <Text style={styles.metricSubText}>
                      Total matches conducted
                    </Text>
                  </View>
                </View>

                {/* Row 2 */}
                <View style={styles.metricsRowBorder}>
                  <View style={styles.metricHalfBorder}>
                    <Text style={styles.metricLabel}>Total Registrations</Text>
                    <Text style={styles.metricValue}>
                      {summary.totalRegistrations}
                    </Text>
                    <Text style={styles.metricSubText}>
                      Avg {summary.averageRegistrationsPerTournament}/tournament
                    </Text>
                  </View>
                  <View style={styles.metricHalf}>
                    <Text style={styles.metricLabel}>Avg Revenue</Text>
                    <Text style={styles.metricValue}>
                      ₹{summary.averageRevenuePerTournament}
                    </Text>
                    <Text style={styles.metricSubText}>Per tournament</Text>
                  </View>
                </View>

                {/* Row 3 - Financial */}
                <View style={styles.financialMetrics}>
                  <View style={styles.financialMetricsRow}>
                    <View style={styles.financialMetricHalfBorder}>
                      <Text style={styles.financialMetricLabel}>
                        Total Revenue
                      </Text>
                      <Text style={styles.financialMetricValue}>
                        ₹{summary.totalRevenue}
                      </Text>
                      <Text style={styles.financialMetricSub}>
                        Expenses: ₹{summary.totalExpenses}
                      </Text>
                    </View>
                    <View style={styles.financialMetricHalf}>
                      <Text style={styles.financialMetricLabel}>
                        Net Profit
                      </Text>
                      <Text style={styles.financialMetricValue}>
                        ₹{summary.netProfit}
                      </Text>
                      <Text style={styles.financialMetricSub}>
                        Avg ₹{summary.averageProfitPerTournament}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Tournament List */}
            <View style={styles.tournamentSection}>
              <View style={styles.tournamentHeader}>
                <Text style={styles.sectionTitle}>Your Tournaments</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {tournaments && tournaments.length > 0 ? (
                <View>
                  {tournaments.slice(0, 3).map((item) => (
                    <TouchableOpacity
                      key={item.tournamentId}
                      onPress={() => {
                        setSelectedTournament(item);
                        setModalVisible(true);
                      }}
                      style={styles.tournamentCard}
                    >
                      <View style={styles.tournamentCardHeader}>
                        <View style={styles.tournamentCardTitle}>
                          <Text style={styles.tournamentName} numberOfLines={1}>
                            {item.tournamentName}
                          </Text>
                          <View style={styles.tournamentMeta}>
                            <View style={styles.tournamentStatusBadge}>
                              <Text style={styles.tournamentStatusText}>
                                {capitalizeWords(item.status)}
                              </Text>
                            </View>
                            <Text style={styles.tournamentTeams}>
                              {item.teamCount}/{item.maxTeams} Teams
                            </Text>
                          </View>
                        </View>
                        <View style={styles.tournamentPrize}>
                          <Text style={styles.prizeAmount}>
                            ₹{item.prizePool}
                          </Text>
                          <Text style={styles.prizeLabel}>Prize Pool</Text>
                        </View>
                      </View>

                      <View style={styles.tournamentStats}>
                        <View style={styles.tournamentStatItem}>
                          <Text style={styles.tournamentStatLabel}>
                            Matches
                          </Text>
                          <Text style={styles.tournamentStatValue}>
                            {item.matchesCount}
                          </Text>
                        </View>
                        <View style={styles.tournamentStatItem}>
                          <Text style={styles.tournamentStatLabel}>
                            Revenue
                          </Text>
                          <Text style={styles.tournamentStatValue}>
                            ₹{item.revenue}
                          </Text>
                        </View>
                        <View style={styles.tournamentStatItem}>
                          <Text style={styles.tournamentStatLabel}>Profit</Text>
                          <Text style={styles.tournamentStatValuePurple}>
                            ₹{item.profit}
                          </Text>
                        </View>
                        <View style={styles.tournamentStatItemEnd}>
                          <Text style={styles.tournamentStatLabel}>Rating</Text>
                          <View style={styles.tournamentRating}>
                            <Text style={styles.tournamentStatValue}>
                              {item.rating}
                            </Text>
                            <Text style={styles.tournamentRatingStar}>★</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No tournaments yet</Text>
                </View>
              )}
            </View>
          </>
        )}

        <TournamentModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          tournament={selectedTournament}
        />
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNavBar role="organizer" type="cricket" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // Quick Stats Styles
  quickStatsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  quickStatsRow: {
    flexDirection: "row",
    marginHorizontal: -6,
  },
  quickStatWrapper: {
    flex: 1,
    paddingHorizontal: 6,
  },
  quickStatActive: {
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  quickStatLabelActive: {
    color: "#9333EA",
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
  },
  quickStatValueActive: {
    color: "#7E22CE",
    fontSize: 24,
    fontWeight: "700",
  },
  quickStatSubActive: {
    color: "#C084FC",
    fontSize: 10,
    marginTop: 2,
  },
  quickStat: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickStatLabel: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
  },
  quickStatValue: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "700",
  },
  quickStatSub: {
    color: "#9CA3AF",
    fontSize: 10,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  ratingStarSmall: {
    color: "#9CA3AF",
    fontSize: 14,
    marginLeft: 4,
  },
  // Metrics Styles
  metricsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 12,
  },
  metricsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  metricsRowBorder: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  metricHalfBorder: {
    flex: 1,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  metricHalf: {
    flex: 1,
    padding: 16,
  },
  metricLabel: {
    color: "#9CA3AF",
    fontSize: 10,
    marginBottom: 8,
  },
  metricValue: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 24,
  },
  metricSubRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  metricSubItem: {
    marginRight: 16,
  },
  metricSubLabel: {
    color: "#9CA3AF",
    fontSize: 10,
  },
  metricSubValue: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 14,
  },
  metricSubValuePurple: {
    color: "#9333EA",
    fontWeight: "600",
    fontSize: 14,
  },
  metricSubText: {
    color: "#9CA3AF",
    fontSize: 10,
    marginTop: 8,
  },
  financialMetrics: {
    backgroundColor: "#F3E8FF",
  },
  financialMetricsRow: {
    flexDirection: "row",
  },
  financialMetricHalfBorder: {
    flex: 1,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: "#E9D5FF",
  },
  financialMetricHalf: {
    flex: 1,
    padding: 16,
  },
  financialMetricLabel: {
    color: "#9333EA",
    fontSize: 10,
    marginBottom: 8,
  },
  financialMetricValue: {
    color: "#7E22CE",
    fontWeight: "700",
    fontSize: 24,
  },
  financialMetricSub: {
    color: "#C084FC",
    fontSize: 10,
    marginTop: 8,
  },
  // Tournament List Styles
  tournamentSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  tournamentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  viewAllText: {
    color: "#9333EA",
    fontWeight: "600",
    fontSize: 14,
  },
  tournamentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 12,
  },
  tournamentCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tournamentCardTitle: {
    flex: 1,
    marginRight: 12,
  },
  tournamentName: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 16,
  },
  tournamentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  tournamentStatusBadge: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  tournamentStatusText: {
    color: "#7E22CE",
    fontWeight: "600",
    fontSize: 10,
  },
  tournamentTeams: {
    color: "#9CA3AF",
    fontSize: 10,
  },
  tournamentPrize: {
    alignItems: "flex-end",
  },
  prizeAmount: {
    color: "#7E22CE",
    fontWeight: "700",
    fontSize: 20,
  },
  prizeLabel: {
    color: "#9CA3AF",
    fontSize: 10,
  },
  tournamentStats: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  tournamentStatItem: {
    flex: 1,
  },
  tournamentStatItemEnd: {
    flex: 1,
    alignItems: "flex-end",
  },
  tournamentStatLabel: {
    color: "#9CA3AF",
    fontSize: 10,
    marginBottom: 4,
  },
  tournamentStatValue: {
    color: "#111827",
    fontWeight: "600",
  },
  tournamentStatValuePurple: {
    color: "#9333EA",
    fontWeight: "600",
  },
  tournamentRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  tournamentRatingStar: {
    color: "#9CA3AF",
    fontSize: 10,
    marginLeft: 4,
  },
  emptyState: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  bottomSpacer: {
    height: 32,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  statusBadge: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 12,
  },
  statusText: {
    color: "#7E22CE",
    fontWeight: "600",
    fontSize: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingIcon: {
    color: "#9CA3AF",
    fontSize: 10,
    marginRight: 4,
  },
  ratingValue: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  ratingCount: {
    color: "#9CA3AF",
    fontSize: 10,
    marginLeft: 4,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  detailsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statItem: {
    width: "33.33%",
    marginBottom: 16,
  },
  statLabel: {
    color: "#9CA3AF",
    fontSize: 10,
    marginBottom: 4,
  },
  statValue: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 18,
  },
  financialCard: {
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  financialLabel: {
    color: "#7E22CE",
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 12,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  financialRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#E9D5FF",
  },
  financialRowTotal: {
    borderTopWidth: 2,
    borderTopColor: "#DDD6FE",
    paddingVertical: 12,
  },
  financialItemLabel: {
    color: "#4B5563",
    fontSize: 14,
  },
  financialItemValue: {
    color: "#111827",
    fontWeight: "600",
  },
  financialTotalLabel: {
    color: "#7E22CE",
    fontWeight: "700",
  },
  financialTotalValue: {
    color: "#7E22CE",
    fontWeight: "700",
    fontSize: 18,
  },
  scheduleCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  scheduleItem: {
    marginBottom: 12,
  },
  scheduleValue: {
    color: "#111827",
    fontWeight: "600",
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  manageButton: {
    backgroundColor: "#9333EA",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  manageButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  closeButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "#6B7280",
    fontWeight: "600",
  },
});

export default CricketDashboard;
