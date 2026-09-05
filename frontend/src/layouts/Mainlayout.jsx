import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Background from "../layout/Background/Background";
import Sidebar from "../layout/Sidebar/Sidebar";
import Navbar from "../layout/Navbar/Navbar";

const THEME_KEY = "accessGuardTheme";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || "Dark"
  );

  useEffect(() => {
    const applyTheme = () => {
      const systemIsLight = window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches;

      const resolvedTheme =
        theme === "System"
          ? systemIsLight
            ? "light"
            : "dark"
          : theme.toLowerCase();

      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.style.colorScheme = resolvedTheme;
    };

    applyTheme();

    if (theme !== "System") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: light)"
    );

    const handleSystemThemeChange = () => {
      applyTheme();
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    localStorage.setItem(THEME_KEY, newTheme);
    setTheme(newTheme);
  };

  return (
    <>
      <Background />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`
          relative
          min-h-screen
          pr-8
          pt-6
          transition-all
          duration-300
          ${collapsed ? "pl-[120px]" : "pl-[360px]"}
        `}
      >
        <Navbar />

        <Outlet
          context={{
            theme,
            setTheme: handleThemeChange,
          }}
        />
      </main>
    </>
  );
}