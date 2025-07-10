import { useState, useEffect } from "react";

const API_BASE_URL = "/api/v1";

interface UseDataGolfState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Generic function to fetch data
async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Network error" }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Generic hook for DataGolf data
function useDataGolf<T>(
  endpoint: string,
  deps: any[] = []
): UseDataGolfState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataFunction = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, deps);

  return {
    data,
    loading,
    error,
    refetch: fetchDataFunction,
  };
}

// Tournament-specific hooks
export function useRecentTournaments(tour: string = "pga", limit: number = 20) {
  return useDataGolf<any[]>(
    `/tournaments/datagolf/recent?tour=${tour}&limit=${limit}`,
    [tour, limit]
  );
}

export function useTournamentSchedule(tour: string = "all") {
  return useDataGolf<any>(`/tournaments/datagolf/schedule?tour=${tour}`, [
    tour,
  ]);
}

export function useTournamentLeaderboard(
  tour: string,
  eventId: string,
  year: number
) {
  const shouldFetch = tour && eventId && year && year > 0;
  return useDataGolf<any[]>(
    shouldFetch
      ? `/tournaments/datagolf/${tour}/${eventId}/${year}/leaderboard`
      : "",
    [tour, eventId, year]
  );
}

export function useLivePredictions(
  tour: string = "pga",
  oddsFormat: string = "percent"
) {
  return useDataGolf<any>(
    `/tournaments/datagolf/live/predictions?tour=${tour}&odds_format=${oddsFormat}`,
    [tour, oddsFormat]
  );
}

export function useLiveTournamentStats(
  stats: string = "sg_total,sg_ott,sg_app,sg_arg,sg_putt",
  roundType: string = "event_cumulative",
  display: string = "value"
) {
  return useDataGolf<any>(
    `/tournaments/datagolf/live/stats?stats=${stats}&round_type=${roundType}&display=${display}`,
    [stats, roundType, display]
  );
}

export function useLiveHoleStats(tour: string = "pga") {
  return useDataGolf<any>(
    `/tournaments/datagolf/live/hole-stats?tour=${tour}`,
    [tour]
  );
}

export function usePreTournamentPredictions(
  tour: string = "pga",
  oddsFormat: string = "percent"
) {
  return useDataGolf<any>(
    `/tournaments/datagolf/pre-tournament-predictions?tour=${tour}&odds_format=${oddsFormat}`,
    [tour, oddsFormat]
  );
}

// Player-specific hooks
export function usePlayersWithRankings() {
  return useDataGolf<any[]>("/players/datagolf/with-rankings", []);
}

// Export the main hook as useDataGolfRankings for clarity
export function useDataGolfRankings() {
  return useDataGolf<any[]>("/players/datagolf/rankings", []);
}

export function usePlayerList() {
  return useDataGolf<any>("/players/datagolf/list", []);
}

export function useSkillRatings(display: string = "value") {
  return useDataGolf<any>(
    `/players/datagolf/skill-ratings?display=${display}`,
    [display]
  );
}

export function usePlayerDecompositions(tour: string = "pga") {
  return useDataGolf<any[]>(`/players/datagolf/decompositions?tour=${tour}`, [
    tour,
  ]);
}

export function useApproachSkill(period: string = "l24") {
  return useDataGolf<any[]>(
    `/players/datagolf/approach-skill?period=${period}`,
    [period]
  );
}

// Export the generic hook as well
export default useDataGolf;
