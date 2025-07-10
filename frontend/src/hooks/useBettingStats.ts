import { useState, useEffect } from "react";
import axios from "axios";

export interface BettingStats {
  total_bets: number;
  won_bets: number;
  lost_bets: number;
  pending_bets: number;
  win_percentage: number;
  total_wagered: number;
  total_winnings: number;
  net_profit: number;
  roi_percentage: number;
}

export const useBettingStats = () => {
  const [stats, setStats] = useState<BettingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/v1/bets/stats/summary");
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching betting stats:", err);
      setError("Failed to fetch betting statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshStats = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
};
