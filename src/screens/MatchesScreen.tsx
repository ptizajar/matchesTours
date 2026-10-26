import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MATCHES_URL } from "../config";
import { FavoriteButton } from "../components/FavoriteButton";
import { useFavorites } from "../hooks/useFavorites";
import { UpdatedAgo } from "../components/UpdatedAgo";

type Match = {
  id: string;
  startsAt: string | null;
  status: string;
  home: {
    id: string;
    name: string;
    city: string;
  };
  away: {
    id: string;
    name: string;
    city: string;
  };
  score: {
    home: number | null;
    away: number | null;
  } | null;
  minute?: number | null;
};

type MatchFilter = "all" | "upcoming" | "finished";

function formatMatchDate(startsAt: string | null) {
  if (!startsAt) {
    return "Дата не назначена";
  }

  const date = new Date(startsAt);

  if (Number.isNaN(date.getTime())) {
    return "Дата неизвестна";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getMatchStatus(status: string, minute?: number | null) {
  switch (status) {
    case "scheduled":
      return "Предстоящий";
    case "live":
      return minute != null ? `Идёт · ${minute}'` : "Идёт";
    case "finished":
      return "Завершён";
    case "postponed":
      return "Перенесён";
    default:
      return "Статус неизвестен";
  }
}

export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<MatchFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { isFavorite, toggle } = useFavorites();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const filteredMatches = matches.filter((match) => {
    if (filter === "upcoming" && match.status !== "scheduled") {
      return false;
    }

    if (filter === "finished" && match.status !== "finished") {
      return false;
    }

    const query = searchQuery.trim().toLocaleLowerCase("ru-RU");

    if (query) {
      const homeTeam = match.home.name.toLocaleLowerCase("ru-RU");
      const awayTeam = match.away.name.toLocaleLowerCase("ru-RU");

      if (!homeTeam.includes(query) && !awayTeam.includes(query)) {
        return false;
      }
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
      setLastUpdated(new Date());
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
      {lastUpdated && <UpdatedAgo since={lastUpdated} />}
      <TextInput
        style={styles.searchInput}
        multiline={false}
        placeholder="Поиск по названию клуба..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
      <Pressable
        style={styles.refreshButton}
        onPress={loadMatches}
        disabled={loading}
      >
        <Text style={styles.refreshButtonText}>
          {loading ? "Обновление..." : "Обновить"}
        </Text>
      </Pressable>
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
              <FavoriteButton
                active={isFavorite(item.id)}
                onPress={() => toggle(item.id)}
              />
              <Text style={styles.matchDate}>
                {formatMatchDate(item.startsAt)}
              </Text>
              <Text style={styles.status}>
                {getMatchStatus(item.status, item.minute)}
              </Text>
              <Text style={styles.team}>{item.home.name}</Text>
              <Text style={styles.score}>
                {item.score?.home ?? "—"} : {item.score?.away ?? "—"}
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
  searchInput: {
   height: 44,
  minHeight: 44,
  maxHeight: 44,
  borderWidth: 1,
  borderColor: "#dddddd",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 0,
  marginTop: 12,
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
  matchDate: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    marginBottom: 8,
  },
  refreshButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: "#ef3124",
  },
  refreshButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
