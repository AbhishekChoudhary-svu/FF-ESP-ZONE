"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

const MyContext = createContext();

export const ThemeProvider = ({ children }) => {
  const router = useRouter()
  const [ user, setUser ] = useState(null)
  const [loading, setLoading] = useState(true)

  
 const fetchUser = async () => {
  try {
    const res = await fetch("/api/users", {
      method: "GET",
      credentials: "include",
    })

    if (!res.ok) {
      setUser(null)
      router.push("/login")
      return
    }

    const data = await res.json()
    setUser(data.user) 
  } catch (err) {
    setUser(null)
  } finally {
    setLoading(false)
  }
}

 
    useEffect(() => {
    fetchUser()
  }, [])
 

  let values = {
    user,
    fetchUser,
    loading,
  };

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <MyContext.Provider value={values}>{children}</MyContext.Provider>
    </NextThemesProvider>
  );
};

export default MyContext;
