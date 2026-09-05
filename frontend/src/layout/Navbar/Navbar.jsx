import { useLocation, useNavigate } from "react-router-dom";

import {
  FiBell,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

import { navigation } from "../../utils/navigation";

import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [currentTime, setCurrentTime] = useState(
    new Date()
  );

  const [showUserMenu, setShowUserMenu] =
    useState(false);

  const currentPage =
    navigation.find(
      (item) => item.path === location.pathname
    ) || {
      title: "AccessGuardAI",
    };

  /* =============================
     Greeting
     ============================= */

  const hour = currentTime.getHours();

  let greeting = "Good Evening";
  let emoji = "🌙";

  if (hour < 12) {
    greeting = "Good Morning";
    emoji = "☀️";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
    emoji = "🌤";
  }

  /* =============================
     Live Clock
     ============================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate =
    currentTime.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formattedTime =
    currentTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  /* =============================
     Logout
     ============================= */

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-6 z-20 mb-8">
      <div
        className="
          flex
          items-center
          justify-between
          rounded-3xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
          px-8
          py-5
          backdrop-blur-xl
        "
      >

        {/* LEFT SIDE */}

        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)]">
            {currentPage.title}
          </h1>

          <div className="mt-2">
            <p className="text-lg font-medium text-[var(--theme-cyan)]">
              {emoji} {greeting}
              {user?.name ? `, ${user.name}` : ""}
            </p>

            <p className="text-[var(--text-secondary)]">
              Welcome back to AccessGuardAI
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-4">

          {/* DATE & TIME */}

          <div className="mr-6 text-right">
            <p className="text-sm text-[var(--text-secondary)]">
              {formattedDate}
            </p>

            <p className="text-xl font-semibold text-[var(--text-primary)]">
              {formattedTime}
            </p>
          </div>

          {/* NOTIFICATION */}

          <button
            type="button"
            className="
              rounded-2xl
              border
              border-[var(--border)]
              bg-[var(--surface)]
              p-3
              text-[var(--text-secondary)]
              transition
              hover:bg-cyan-500/10
              hover:text-[var(--theme-cyan)]
            "
          >
            <FiBell size={20} />
          </button>

          {/* USER */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowUserMenu((prev) => !prev)
              }
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface)]
                px-3
                py-2
                text-left
                transition
                hover:bg-cyan-500/10
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-500/10
                  text-[var(--theme-cyan)]
                "
              >
                <FiUser size={20} />
              </div>

              <div className="min-w-0">
                <p className="max-w-[140px] truncate text-sm font-semibold text-[var(--text-primary)]">
                  {user?.name || "User"}
                </p>

                <p className="max-w-[160px] truncate text-xs text-[var(--text-secondary)]">
                  {user?.email || ""}
                </p>
              </div>
            </button>

            {/* USER MENU */}

            {showUserMenu && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  z-50
                  mt-3
                  w-56
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[var(--border)]
                  bg-[var(--dropdown-bg)]
                  p-2
                  shadow-xl
                  backdrop-blur-xl
                "
              >
                {/* PROFILE */}

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/settings");
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    text-[var(--text-secondary)]
                    transition
                    hover:bg-[var(--surface-hover)]
                    hover:text-[var(--text-primary)]
                  "
                >
                  <FiUser size={17} />
                  Profile
                </button>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    text-red-400
                    transition
                    hover:bg-red-400/10
                  "
                >
                  <FiLogOut size={17} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}