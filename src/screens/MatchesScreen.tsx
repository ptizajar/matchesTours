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

export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetch(MATCHES_URL)
      .then((response) => {
  console.log("HTTP статус:", response.status);
  console.log("URL запроса:", response.url);

  if (!response.ok) {
    throw new Error(`Не удалось загрузить матчи: HTTP ${response.status}`);
  }

  return response.json();
})
      .then((data) => {
        setMatches(data.matches);
      })
      .catch((error) => {
        console.error("Ошибка загрузки матчей:", error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>

      <FlatList
        data={matches}
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
});
