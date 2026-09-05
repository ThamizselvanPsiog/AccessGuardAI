import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import { FiMenu, FiShield } from "react-icons/fi";

import SidebarItem from "../../components/common/SidebarItem";

import { navigation } from "../../utils/navigation";

export default function Sidebar({
  collapsed,
  setCollapsed,
}) {

  const [scanId, setScanId] = useState(
    () => localStorage.getItem("activeScanId")
  );

  /*
   * Listen for scan ID changes.
   *
   * NewScan.jsx will dispatch this event
   * whenever a new scan is completed.
   */
  useEffect(() => {

    const handleScanIdChange = () => {

      const currentScanId =
        localStorage.getItem("activeScanId");

      setScanId(currentScanId);

    };

    window.addEventListener(
      "activeScanChanged",
      handleScanIdChange
    );

    return () => {
      window.removeEventListener(
        "activeScanChanged",
        handleScanIdChange
      );
    };

  }, []);


  /*
   * Build the actual route for each sidebar item.
   */
  const getNavigationPath = (item) => {

    /*
     * Dashboard does not depend on scanId.
     */
    if (!item.requiresScanId) {
      return item.path;
    }

    /*
     * If no scan has been performed yet,
     * keep the base route.
     *
     * This prevents URLs such as /ai/null.
     */
    if (!scanId) {
      return item.path;
    }

    return `${item.path}/${scanId}`;
  };


  return (
    <motion.aside
      animate={{
        width: collapsed ? 90 : 260,
      }}
      transition={{
        duration: 0.35,
      }}
      className="
        fixed
        left-6
        top-6
        bottom-6
        z-50
        rounded-3xl
        border
        border-[var(--border)]
        bg-[var(--surface)]
        backdrop-blur-2xl
        shadow-2xl
      "
    >

      <div className="flex h-full flex-col">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-center justify-between p-6">

          {!collapsed && (
            <div>

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-cyan-500/20 p-2">

                  <FiShield
                    className="text-[var(--theme-cyan)]"
                    size={22}
                  />

                </div>

                <div>

                  <h2 className="font-bold text-[var(--text-primary)]">
                    AccessGuardAI
                  </h2>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Accessibility Governance Platform
                  </p>

                </div>

              </div>

            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="
              rounded-xl
              p-2
              text-[var(--text-secondary)]
              transition
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--text-primary)]
            "
          >
            <FiMenu size={22} />
          </button>

        </div>


        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <div className="flex-1 space-y-2 px-4">

          {navigation.map((item) => (

            <SidebarItem
              key={item.title}
              icon={item.icon}
              title={item.title}
              path={getNavigationPath(item)}
              collapsed={collapsed}
            />

          ))}

        </div>


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        {!collapsed && (

          <div className="border-t border-[var(--border)] p-6">

            <p className="text-sm text-[var(--text-secondary)]">
              AccessGuardAI
            </p>

            <p className="text-xs text-[var(--text-tertiary)]">
              Version 1.0.0
            </p>

          </div>

        )}

      </div>

    </motion.aside>
  );
}