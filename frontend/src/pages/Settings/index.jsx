import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiUser,
  FiMail,
  FiMoon,
  FiShield,
  FiInfo,
  FiLogOut,
  FiLock,
  FiAlertTriangle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const navigate = useNavigate();

  const {
    user,
    updateProfile,
    changePassword,
    logout,
  } = useAuth();

  /*
   * ============================================
   * Profile State
   * ============================================
   */

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  /*
   * ============================================
   * Password State
   * ============================================
   */

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /*
   * ============================================
   * Password Field Errors
   * ============================================
   */

  const [currentPasswordError, setCurrentPasswordError] =
    useState("");

  const [newPasswordError, setNewPasswordError] =
    useState("");

  const [confirmPasswordError, setConfirmPasswordError] =
    useState("");

  /*
   * ============================================
   * Appearance
   * ============================================
   */

  const [theme, setTheme] = useState("Dark");

  /*
   * ============================================
   * Application Alert
   * ============================================
   */

  const [alert, setAlert] = useState({
    show: false,
    type: "warning",
    message: "",
  });

  /*
   * ============================================
   * Load authenticated user's information
   * ============================================
   */

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  /*
   * ============================================
   * Show App Alert
   * ============================================
   */

  const showAlert = (message, type = "warning") => {
    setAlert({
      show: true,
      type,
      message,
    });

    /*
     * Automatically hide after 4 seconds.
     */
    setTimeout(() => {
      setAlert((prev) => ({
        ...prev,
        show: false,
      }));
    }, 4000);
  };

  /*
   * ============================================
   * Save Profile
   * ============================================
   */

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showAlert("Name cannot be empty.", "warning");
      return;
    }

    if (!email.trim()) {
      showAlert("Email cannot be empty.", "warning");
      return;
    }

    const result = await updateProfile(
      name.trim(),
      email.trim()
    );

    if (!result.success) {
      showAlert(
        result.message || "Unable to update profile.",
        "warning"
      );
      return;
    }

    showAlert(
      "Profile updated successfully.",
      "success"
    );
  };

  /*
   * ============================================
   * Change Password
   * ============================================
   */

  const handleChangePassword = async () => {
    /*
     * Clear previous field errors.
     */

    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    /*
     * Validate current password.
     */

    if (!currentPassword.trim()) {
      setCurrentPasswordError(
        "Please enter your current password."
      );
      return;
    }

    /*
     * Validate new password.
     */

    if (!newPassword.trim()) {
      setNewPasswordError(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setNewPasswordError(
        "New password must be at least 6 characters long."
      );
      return;
    }

    /*
     * Validate confirmation password.
     */

    if (!confirmPassword.trim()) {
      setConfirmPasswordError(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(
        "Passwords do not match."
      );
      return;
    }

    /*
     * Call backend.
     */

    const result = await changePassword(
      currentPassword,
      newPassword
    );

    /*
     * Backend rejected password change.
     */

    if (!result.success) {
      setCurrentPasswordError(
        result.message ||
          "Unable to change password."
      );
      return;
    }

    /*
     * Clear password fields.
     */

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    /*
     * Show success popup.
     */

    showAlert(
      "Password changed successfully.",
      "success"
    );
  };

  /*
   * ============================================
   * Logout
   * ============================================
   */

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="relative space-y-8 pb-10">

      {/* ========================================= */}
      {/* Application Alert */}
      {/* ========================================= */}

      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              x: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
              x: 20,
            }}
            className="
              fixed
              right-6
              top-6
              z-[100]
              w-[360px]
              max-w-[calc(100vw-3rem)]
            "
          >
            <div
              className={`
                flex
                items-start
                gap-3
                rounded-2xl
                border
                p-4
                backdrop-blur-xl
                shadow-2xl
                ${
                  alert.type === "success"
                    ? "border-green-400/20 bg-green-500/10"
                    : "border-yellow-400/20 bg-yellow-500/10"
                }
              `}
            >

              {/* Icon */}

              <div
                className={`
                  mt-0.5
                  shrink-0
                  ${
                    alert.type === "success"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }
                `}
              >
                {alert.type === "success" ? (
                  <FiCheckCircle size={21} />
                ) : (
                  <FiAlertTriangle size={21} />
                )}
              </div>

              {/* Message */}

              <div className="flex-1">

                <p
                  className={`
                    text-sm
                    font-medium
                    ${
                      alert.type === "success"
                        ? "text-green-300"
                        : "text-yellow-300"
                    }
                  `}
                >
                  {alert.message}
                </p>

              </div>

              {/* Close */}

              <button
                type="button"
                onClick={() =>
                  setAlert((prev) => ({
                    ...prev,
                    show: false,
                  }))
                }
                className="
                  shrink-0
                  text-gray-500
                  transition
                  hover:text-white
                "
              >
                <FiX size={18} />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ========================================= */}
      {/* Page Header */}
      {/* ========================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <h1 className="text-3xl font-bold text-white">
          Settings
        </h1>

        <p className="mt-2 text-gray-400">
          Manage your account and application preferences.
        </p>
      </motion.div>


      {/* ========================================= */}
      {/* Profile */}
      {/* ========================================= */}

      <SettingsCard
        icon={<FiUser size={20} />}
        title="Profile"
        description="Manage your personal account information."
      >

        <div className="grid gap-6 md:grid-cols-2">

          {/* Name */}

          <div>

            <label
              htmlFor="profile-name"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-300
              "
            >
              Name
            </label>

            <div className="relative">

              <FiUser
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-500
                "
              />

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  py-3
                  pl-11
                  pr-4
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400
                  focus:bg-white/[0.07]
                "
              />

            </div>

          </div>


          {/* Email */}

          <div>

            <label
              htmlFor="profile-email"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-300
              "
            >
              Email
            </label>

            <div className="relative">

              <FiMail
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-500
                "
              />

              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  py-3
                  pl-11
                  pr-4
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400
                  focus:bg-white/[0.07]
                "
              />

            </div>

          </div>

        </div>


        {/* Save */}

        <button
          onClick={handleSaveProfile}
          className="
            mt-6
            rounded-xl
            bg-cyan-500
            px-5
            py-2.5
            font-medium
            text-black
            transition
            hover:bg-cyan-400
          "
        >
          Save Changes
        </button>

      </SettingsCard>


      {/* ========================================= */}
      {/* Appearance */}
      {/* ========================================= */}

      <SettingsCard
        icon={<FiMoon size={20} />}
        title="Appearance"
        description="Customize how AccessGuardAI looks."
      >

        <div className="
          flex
          flex-col
          items-start
          justify-between
          gap-6
          sm:flex-row
          sm:items-center
        ">

          <div>

            <h3 className="font-medium text-white">
              Theme
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              Choose your preferred application theme.
            </p>

          </div>

          <select
            value={theme}
            onChange={(e) =>
              setTheme(e.target.value)
            }
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-3
              text-white
              outline-none
              focus:border-cyan-400
            "
          >

            <option
              value="Dark"
              className="bg-slate-900"
            >
              Dark
            </option>

            <option
              value="Light"
              className="bg-slate-900"
            >
              Light
            </option>

            <option
              value="System"
              className="bg-slate-900"
            >
              System
            </option>

          </select>

        </div>

      </SettingsCard>


      {/* ========================================= */}
      {/* Security */}
      {/* ========================================= */}

      <SettingsCard
        icon={<FiShield size={20} />}
        title="Security"
        description="Manage your account security."
      >

        {/* Password */}

        <div>

          <h3 className="font-medium text-white">
            Change Password
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            Update your account password.
          </p>


          <div className="
            mt-5
            grid
            gap-5
            md:grid-cols-3
          ">

            {/* ================================= */}
            {/* Current Password */}
            {/* ================================= */}

            <div>

              <label
                htmlFor="current-password"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-300
                "
              >
                Current Password
              </label>

              <div className="relative">

                <FiLock
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(
                      e.target.value
                    );
                    setCurrentPasswordError("");
                  }}
                  placeholder="Current password"
                  className={`
                    w-full
                    rounded-xl
                    border
                    bg-white/5
                    py-3
                    pl-11
                    pr-4
                    text-white
                    placeholder:text-gray-600
                    outline-none
                    transition
                    focus:border-cyan-400
                    ${
                      currentPasswordError
                        ? "border-red-400/50"
                        : "border-white/10"
                    }
                  `}
                />

              </div>

              {currentPasswordError && (
                <p className="
                  mt-2
                  text-sm
                  text-red-400
                ">
                  {currentPasswordError}
                </p>
              )}

            </div>


            {/* ================================= */}
            {/* New Password */}
            {/* ================================= */}

            <div>

              <label
                htmlFor="new-password"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-300
                "
              >
                New Password
              </label>

              <div className="relative">

                <FiLock
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(
                      e.target.value
                    );
                    setNewPasswordError("");
                  }}
                  placeholder="New password"
                  className={`
                    w-full
                    rounded-xl
                    border
                    bg-white/5
                    py-3
                    pl-11
                    pr-4
                    text-white
                    placeholder:text-gray-600
                    outline-none
                    transition
                    focus:border-cyan-400
                    ${
                      newPasswordError
                        ? "border-red-400/50"
                        : "border-white/10"
                    }
                  `}
                />

              </div>

              {newPasswordError && (
                <p className="
                  mt-2
                  text-sm
                  text-red-400
                ">
                  {newPasswordError}
                </p>
              )}

            </div>


            {/* ================================= */}
            {/* Confirm Password */}
            {/* ================================= */}

            <div>

              <label
                htmlFor="confirm-password"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-300
                "
              >
                Confirm Password
              </label>

              <div className="relative">

                <FiLock
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );
                    setConfirmPasswordError("");
                  }}
                  placeholder="Confirm password"
                  className={`
                    w-full
                    rounded-xl
                    border
                    bg-white/5
                    py-3
                    pl-11
                    pr-4
                    text-white
                    placeholder:text-gray-600
                    outline-none
                    transition
                    focus:border-cyan-400
                    ${
                      confirmPasswordError
                        ? "border-red-400/50"
                        : "border-white/10"
                    }
                  `}
                />

              </div>

              {confirmPasswordError && (
                <p className="
                  mt-2
                  text-sm
                  text-red-400
                ">
                  {confirmPasswordError}
                </p>
              )}

            </div>

          </div>


          {/* Change Password Button */}

          <button
            onClick={handleChangePassword}
            className="
              mt-5
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-5
              py-2.5
              text-sm
              font-medium
              text-gray-200
              transition
              hover:border-cyan-400/30
              hover:bg-cyan-400/10
              hover:text-cyan-300
            "
          >
            <FiLock size={16} />

            Change Password
          </button>

        </div>


        <div className="
          my-5
          border-t
          border-white/10
        " />


        {/* ========================================= */}
        {/* Sign Out */}
        {/* ========================================= */}

        <div className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <div>

            <h3 className="font-medium text-white">
              Sign Out
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              Sign out of your AccessGuardAI account.
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-400/20
              bg-red-400/5
              px-4
              py-2.5
              text-sm
              font-medium
              text-red-400
              transition
              hover:bg-red-400/10
            "
          >
            <FiLogOut size={16} />

            Sign Out
          </button>

        </div>

      </SettingsCard>


      {/* ========================================= */}
      {/* About */}
      {/* ========================================= */}

      <SettingsCard
        icon={<FiInfo size={20} />}
        title="About"
        description="Information about AccessGuardAI."
      >

        <div className="
          grid
          gap-4
          sm:grid-cols-2
        ">

          <InfoItem
            label="Application"
            value="AccessGuardAI"
          />

          <InfoItem
            label="Version"
            value="1.0.0"
          />

        </div>

      </SettingsCard>

    </div>
  );
}


/* ================================================= */
/* Settings Card */
/* ================================================= */

function SettingsCard({
  icon,
  title,
  description,
  children,
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
        shadow-[0_0_30px_rgba(6,182,212,0.05)]
      "
    >

      <div className="
        mb-6
        flex
        items-start
        gap-4
      ">

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-cyan-500/10
            text-cyan-400
          "
        >
          {icon}
        </div>

        <div>

          <h2 className="
            text-xl
            font-semibold
            text-white
          ">
            {title}
          </h2>

          <p className="
            mt-1
            text-sm
            text-gray-400
          ">
            {description}
          </p>

        </div>

      </div>

      {children}

    </motion.section>
  );
}


/* ================================================= */
/* About Item */
/* ================================================= */

function InfoItem({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        p-5
      "
    >

      <p className="
        text-sm
        text-gray-400
      ">
        {label}
      </p>

      <p className="
        mt-1
        font-semibold
        text-white
      ">
        {value}
      </p>

    </div>
  );
}