import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { MATCHES_URL } from "../config";

type Match = {
  id: string;
  startsAt: string | null;
  status: string;
  home: {
    id: string;
    name: string;
    city: string;
    score: number | null;
  };
  away: {
    id: string;
    name: string;
    city: string;
    score: number | null;
  };
};

type MatchFilter = "all" | "upcoming" | "finished";

export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<MatchFilter>("all");

  const filteredMatches = matches.filter((match) => {
    if (filter === "upcoming") {
      return match.status === "scheduled";
    }

    if (filter === "finished") {
      return match.status === "finished";
    }

    return true;
  });

  const loadMatches = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(MATCHES_URL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setMatches(data.matches);
    } catch (error) {
      console.error("Ошибка загрузки матчей:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>
      <View style={styles.filters}>
        <Text onPress={() => setFilter("all")}>Все</Text>
        <Text onPress={() => setFilter("upcoming")}>Предстоящие</Text>
        <Text onPress={() => setFilter("finished")}>Завершённые</Text>
      </View>
      {error ? (
        <View>
          <Text>Не удалось загрузить матчи.</Text>
          <Text onPress={loadMatches}>Повторить загрузку</Text>
        </View>
      ) : loading ? (
        <Text>Загрузка матчей...</Text>
      ) : (
        <FlatList
          data={filteredMatches}
          ListEmptyComponent={
            <Text>
              {matches.length === 0
                ? "Матчей пока нет"
                : "Нет матчей по выбранному фильтру"}
            </Text>
          }
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.matchCard}>
              <Text style={styles.team}>{item.home.name}</Text>
              <Text style={styles.score}>
                {item.home.score ?? "—"} : {item.away.score ?? "—"}
              </Text>
              <Text style={styles.team}>{item.away.name}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  matchCard: {
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 8,
  },
  team: {
    fontSize: 16,
  },
  score: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 6,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
});
