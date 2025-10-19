import AppScreen from "@/components/AppScreen";
import { useAuth } from "@/context/AuthContext";
import { usePlayerAnalyticsStore } from "@/store/playerAnalyticsStore";
import { Team, useTeamStore } from "@/store/teamStore";
import { router } from "expo-router";
import {
  Award,
  BookOpen,
  ChevronRight,
  PlusCircle,
  Shield,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ModalComponent from "react-native-modal";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import BottomNavBar from "../../../components/BottomNavBar";
import Header from "../../../components/Header";

const { width } = Dimensions.get("window");

const CricketHomeScreen = () => {
  const { user, token } = useAuth();
  const { summary, isLoading, fetchAnalytics } = usePlayerAnalyticsStore();
  const { myTeams, fetchTeams } = useTeamStore();
  const name = user?.fullName ?? "Player";

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"teams" | "performance" | null>(
    null
  );

  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;

  useEffect(() => {
    if (token) fetchAnalytics(token);
    if (token && baseURL) fetchTeams(token, baseURL);
  }, [token]);

  if (isLoading) {
    return (
      <AppScreen
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </AppScreen>
    );
  }

  const winRate = summary?.winRate ?? 0;
  const strokeDasharray = 2 * Math.PI * 36;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * winRate) / 100;

  const openModal = (type: "teams" | "performance") => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const navigateToTeam = (teamId: string) => {
    router.push({
      pathname: "/team/ManageTeam/ManageTeam",
      params: { teamId: teamId },
    });
  };

  return (
    <AppScreen
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        backgroundColor: "#F1F5F9",
      }}
    >
      <Header
        type="welcome"
        name={name}
        avatarUrl={`https://placehold.co/40x40/E2E8F0/4A5568?text=${name.charAt(0)}`}
        onProfilePress={() => router.push("/profile")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
      >
        {/* Performance Overview Header */}
        <View style={{ marginTop: 20, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 13,
              color: "#64748B",
              fontWeight: "600",
              letterSpacing: 0.5,
            }}
          >
            PERFORMANCE OVERVIEW
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: "row", marginBottom: 16, gap: 12 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#EEF2FF",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Target size={16} color="#6366F1" strokeWidth={2.5} />
              </View>
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#0F172A",
                marginBottom: 2,
              }}
            >
              {summary?.totalMatchesPlayed?.toString() ?? "0"}
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>
              Matches
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#DCFCE7",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Award size={16} color="#10B981" strokeWidth={2.5} />
              </View>
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#0F172A",
                marginBottom: 2,
              }}
            >
              {summary?.matchesWon?.toString() ?? "0"}
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>
              Wins
            </Text>
          </View>
        </View>

        {/* Win Rate and Performance Card */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Win Rate Circle */}
            <View style={{ alignItems: "center" }}>
              <View style={{ width: 100, height: 100, marginBottom: 8 }}>
                <Svg width={100} height={100}>
                  <Defs>
                    <LinearGradient
                      id="winGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <Stop offset="0%" stopColor="#10B981" />
                      <Stop offset="100%" stopColor="#059669" />
                    </LinearGradient>
                  </Defs>
                  <Circle
                    cx={50}
                    cy={50}
                    r={36}
                    stroke="#F1F5F9"
                    strokeWidth={8}
                    fill="none"
                  />
                  <Circle
                    cx={50}
                    cy={50}
                    r={36}
                    stroke="url(#winGradient)"
                    strokeWidth={8}
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="50,50"
                  />
                </Svg>
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: "#10B981",
                    }}
                  >
                    {winRate}%
                  </Text>
                </View>
              </View>
              <Text
                style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}
              >
                WIN RATE
              </Text>
            </View>

            {/* Performance Stats */}
            {summary ? (
              <View style={{ flex: 1, marginLeft: 24 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                  >
                    TOTAL RUNS
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {summary.totalRuns ?? 0}
                  </Text>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                  >
                    TOTAL WICKETS
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {summary.totalWickets ?? 0}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                  >
                    AVG SCORE
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#F59E0B",
                    }}
                  >
                    {summary.averageScore ?? 0}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* View All Button */}
          <TouchableOpacity
            onPress={() => openModal("performance")}
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: "#F1F5F9",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "#6366F1",
                fontWeight: "600",
                marginRight: 4,
              }}
            >
              View Full Stats
            </Text>
            <ChevronRight size={14} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Teams Section */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "#64748B",
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              YOUR TEAMS
            </Text>
            {myTeams.length > 3 && (
              <TouchableOpacity
                onPress={() => openModal("teams")}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6366F1",
                    fontWeight: "600",
                    marginRight: 2,
                  }}
                >
                  See All
                </Text>
                <ChevronRight size={12} color="#6366F1" />
              </TouchableOpacity>
            )}
          </View>

          {myTeams.length > 0 ? (
            myTeams.slice(0, 3).map((team: Team) => (
              <TouchableOpacity
                key={team.id}
                onPress={() => navigateToTeam(team.id)}
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#F8FAFC",
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Shield size={18} color="#6366F1" strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#0F172A",
                      marginBottom: 3,
                    }}
                  >
                    {team.name}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: team.isActive ? "#10B981" : "#F59E0B",
                        marginRight: 6,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        color: team.isActive ? "#10B981" : "#F59E0B",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                      }}
                    >
                      {team.isActive ? "Active" : "Pending"}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
              </TouchableOpacity>
            ))
          ) : (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Users size={32} color="#CBD5E1" strokeWidth={1.5} />
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 13,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                No teams yet
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/team/CreateTeam")}
                style={{ marginTop: 12 }}
              >
                <Text
                  style={{ color: "#6366F1", fontSize: 13, fontWeight: "600" }}
                >
                  Create or Join a Team
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 13,
              color: "#64748B",
              fontWeight: "600",
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            QUICK ACTIONS
          </Text>

          {/* First Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/matches/MatchDetail")}
              style={{
                width: "48.5%",
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Trophy size={18} color="#F59E0B" strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#0F172A",
                  lineHeight: 18,
                }}
              >
                Join{"\n"}Tournament
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/tournament/ViewTournament")}
              style={{
                width: "48.5%",
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor: "#DBEAFE",
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Shield size={18} color="#2563EB" strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#0F172A",
                  lineHeight: 18,
                }}
              >
                View{"\n"}Matches
              </Text>
            </TouchableOpacity>
          </View>

          {/* Second Row */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              onPress={() => router.push("/booking/Cricket-booking")}
              style={{
                width: "48.5%",
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor: "#DCFCE7",
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <BookOpen size={18} color="#10B981" strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#0F172A",
                  lineHeight: 18,
                }}
              >
                Book{"\n"}Grounds
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/team/CreateTeam")}
              style={{
                width: "48.5%",
                backgroundColor: "white",
                borderRadius: 12,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor: "#F3E8FF",
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <PlusCircle size={18} color="#9333EA" strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#0F172A",
                  lineHeight: 18,
                }}
              >
                Create/Join{"\n"}Team
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar role="player" type="cricket" />

      {/* Modal */}
      <ModalComponent
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        style={{ margin: 0, justifyContent: "flex-end" }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 30,
            maxHeight: "80%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
              {modalType === "teams" ? "All Teams" : "Performance Stats"}
            </Text>
            <TouchableOpacity
              onPress={closeModal}
              style={{
                backgroundColor: "#F1F5F9",
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {modalType === "teams" &&
              myTeams.map((team: Team) => (
                <TouchableOpacity
                  key={team.id}
                  onPress={() => {
                    closeModal();
                    navigateToTeam(team.id);
                  }}
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "white",
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Shield size={18} color="#6366F1" strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#0F172A",
                        marginBottom: 3,
                      }}
                    >
                      {team.name}
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: team.isActive
                            ? "#10B981"
                            : "#F59E0B",
                          marginRight: 6,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          color: team.isActive ? "#10B981" : "#F59E0B",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        {team.isActive ? "Active" : "Pending"}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}

            {modalType === "performance" && summary && (
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                {Object.entries(summary).map(([key, value], index) => (
                  <View
                    key={key}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 10,
                      borderBottomWidth:
                        index < Object.entries(summary).length - 1 ? 1 : 0,
                      borderBottomColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                      }}
                    >
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      {String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </ModalComponent>
    </AppScreen>
  );
};

export default CricketHomeScreen;
