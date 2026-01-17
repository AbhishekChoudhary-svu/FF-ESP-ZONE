"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

const MyContext = createContext();

export const ThemeProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [player, setPlayer] = useState(null);
  const [team, setTeam] = useState(null);
  const [activePlayer, setActivePlayer] = useState(null);
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        router.push("/login");
        return;
      }

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayer = async (userId) => {
    try {
      const res = await fetch(`/api/players/${userId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setPlayer(null);
        return;
      }

      const data = await res.json();
      setPlayer(data.player);
    } catch (err) {
      console.error("FETCH PLAYER ERROR:", err);
      setPlayer(null);
    }
  };
  const fetchTeam = async (playerId) => {
    try {
      const res = await fetch(`/api/teams/${playerId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setTeam(null);
        return;
      }

      const data = await res.json();
      setTeam(data.team || null);
    } catch (err) {
      console.error("FETCH TEAM ERROR:", err);
      setTeam(null);
    }
  };

  const fetchActivePlayers = async () => {
    const res = await fetch("/api/players/allPlayers");
    const data = await res.json();

    if (data.success) {
      setActivePlayer(data.players);
    }
  };
 const fetchActiveTeams = async () => {
  try {
    const res = await fetch("/api/teams/allTeams"); 
    const data = await res.json();

    if (data.success) {
      setActiveTeam(data.teams);
    } else {
      setActiveTeam([]);
    }
  } catch (err) {
    console.error("FETCH ACTIVE TEAMS ERROR:", err);
    setActiveTeam([]);
  }
};


  useEffect(() => {
    fetchUser();
    fetchActivePlayers();
    fetchActiveTeams();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchPlayer(user.id);
    }
  }, [user]);

   useEffect(() => {
    if (player?._id) {
      fetchTeam(player._id);
    }
  }, [player]);

  useEffect(() => {
    if (user !== null) {
      setLoading(false);
    }
  }, [user, player, team]);

  let values = {
    user,
    fetchUser,
    loading,
    player,
    fetchPlayer,
    activePlayer,
    fetchActivePlayers,
    team,
    fetchTeam,
    activeTeam,
    fetchActiveTeams,
  };

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <MyContext.Provider value={values}>{children}</MyContext.Provider>
    </NextThemesProvider>
  );
};

export default MyContext;
