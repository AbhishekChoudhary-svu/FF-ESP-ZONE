"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createContext } from "react";

const MyContext = createContext();

export const ThemeProvider = ({ children }) => {
 
 

  let values = {
    
  };

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <MyContext.Provider value={values}>{children}</MyContext.Provider>
    </NextThemesProvider>
  );
};

export default MyContext;
