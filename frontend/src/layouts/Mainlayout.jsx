import { useState } from "react";
import { Outlet } from "react-router-dom";

import Background from "../layout/Background/Background";
import Sidebar from "../layout/Sidebar/Sidebar";
import Navbar from "../layout/Navbar/Navbar";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

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
          ${
            collapsed
              ? "pl-[120px]"
              : "pl-[360px]"
          }
        `}
      >

        <Navbar />

        <Outlet />

      </main>
    </>
  );
}