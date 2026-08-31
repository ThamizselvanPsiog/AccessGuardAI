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

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentPage =
    navigation.find((item) => item.path === location.pathname) || {
      title: "AccessGuardAI",
    };

  /* ============================= */
  /* Greeting */
  /* ============================= */

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

  /* ============================= */
  /* Live Clock */
  /* ============================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  /* ============================= */
  /* Logout */
  /* ============================= */

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
          border-white/10
          bg-white/5
          px-8
          py-5
          backdrop-blur-xl
        "
      >

        {/* ============================= */}
        {/* Left Side */}
        {/* ============================= */}

        <div>

          <h1 className="text-4xl font-bold text-white">
            {currentPage.title}
          </h1>

          <div className="mt-2">

            <p className="text-lg font-medium text-cyan-300">
              {emoji} {greeting}
              {user?.name ? `, ${user.name}` : ""}
            </p>

            <p className="text-gray-400">
              Welcome back to AccessGuardAI
            </p>

          </div>

        </div>


        {/* ============================= */}
        {/* Right Side */}
        {/* ============================= */}

        <div className="flex items-center gap-4">

          {/* Date & Time */}

          <div className="mr-6 text-right">

            <p className="text-sm text-gray-400">
              {formattedDate}
            </p>

            <p className="text-xl font-semibold text-white">
              {formattedTime}
            </p>

          </div>


          {/* Notification */}

          <button
            type="button"
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-3
              text-gray-300
              transition
              hover:bg-cyan-500/10
              hover:text-cyan-300
            "
          >
            <FiBell size={20} />
          </button>


          {/* User */}

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
                border-white/10
                bg-white/5
                px-3
                py-2
                text-left
                transition
                hover:bg-cyan-500/10
              "
            >
              {/* User Icon */}
            
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
                  text-cyan-400
                "
              >
                <FiUser size={20} />
              </div>
            
              {/* User Information */}
            
              <div className="min-w-0">
                <p className="max-w-[140px] truncate text-sm font-semibold text-white">
                  {user?.name || "User"}
                </p>
            
                <p className="max-w-[160px] truncate text-xs text-gray-400">
                  {user?.email || ""}
                </p>
              </div>
            </button>


            {/* User Menu */}

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
                  border-white/10
                  bg-slate-900/95
                  p-2
                  shadow-xl
                  backdrop-blur-xl
                "
              >

                {/* Profile */}

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
                    text-gray-300
                    transition
                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  <FiUser size={17} />

                  Profile
                </button>


                {/* Logout */}

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