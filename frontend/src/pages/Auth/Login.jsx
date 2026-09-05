import { motion } from "framer-motion";
import { FiLock, FiMail, FiShield } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import Background from "../../layout/Background/Background";
import AppAlert from "../../components/common/AppAlert";

// Production-grade email format validation
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("error");

  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear previous alerts/errors
    setError("");
    setShowAlert(false);

    const trimmedEmail = email.trim();

    // Validate email
    if (!trimmedEmail) {
      setError("Please enter your email.");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    // Validate password
    if (!password) {
      setError("Please enter your password.");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    try {
      const result = await login(
        trimmedEmail,
        password
      );

      // Login failed
      if (!result.success) {
        const message =
          result.message ||
          "Invalid email or password.";

        setError(message);
        setAlertType("error");
        setShowAlert(true);

        /*
         * Keep the email so the user doesn't
         * have to type it again.
         *
         * Clear only the password.
         */
        setPassword("");

        return;
      }

      // Login successful
      setError("Login successful.");
      setAlertType("success");
      setShowAlert(true);

      // Give the success alert time to be visible
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to sign in. Please try again."
      );

      setAlertType("error");
      setShowAlert(true);

      setPassword("");
    }
  };

  return (
    <>
      {/* Application Background */}

      <Background />

      {/* Application Alert */}

      <AppAlert
        show={showAlert}
        message={error}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />

      {/* Page */}

      <div
        className="
          relative
          flex
          min-h-screen
          items-center
          justify-center
          overflow-hidden
          px-6
        "
      >

        {/* Background Glow */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[600px]
            w-[600px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-cyan-500/10
            blur-[150px]
          "
        />

        {/* Login Card */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="
            relative
            z-10
            w-full
            max-w-md
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-8
            backdrop-blur-xl
            shadow-[0_0_50px_rgba(6,182,212,0.08)]
          "
        >

          {/* Logo */}

          <div className="mb-8 text-center">

            <div
              className="
                mx-auto
                mb-5
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-cyan-500/10
                text-cyan-400
              "
            >
              <FiShield size={32} />
            </div>

            <h1
              className="
                bg-gradient-to-r
                from-cyan-400
                to-violet-400
                bg-clip-text
                text-4xl
                font-extrabold
                text-transparent
              "
            >
              AccessGuardAI
            </h1>

            <p className="mt-3 text-gray-400">
              AI-powered accessibility governance
            </p>

          </div>

          {/* Heading */}

          <div className="mb-6">

            <h2 className="text-2xl font-semibold text-white">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Sign in to continue to your dashboard.
            </p>

          </div>

          {/* Login Form */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}

            <div>

              <label
                htmlFor="email"
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
                  size={18}
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    setError("");
                    setShowAlert(false);
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    py-3.5
                    pl-11
                    pr-4
                    text-white
                    caret-cyan-400
                    placeholder:text-gray-600
                    outline-none
                    transition
                    focus:border-cyan-400
                    focus:bg-white/[0.07]
                  "
                />

              </div>

            </div>

            {/* Password */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="
                    text-sm
                    font-medium
                    text-gray-300
                  "
                >
                  Password
                </label>
              </div>

              <div className="relative">

                <FiLock
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                  size={18}
                />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    setError("");
                    setShowAlert(false);
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    py-3.5
                    pl-11
                    pr-4
                    text-white
                    caret-cyan-400
                    placeholder:text-gray-600
                    outline-none
                    transition
                    focus:border-cyan-400
                    focus:bg-white/[0.07]
                  "
                />

              </div>

              {/* Password Error */}

              {error && alertType === "error" && (
                <p className="mt-2 text-sm text-red-400">
                  {error}
                </p>
              )}

            </div>

            {/* Login Button */}

            <motion.button
              whileHover={{
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              type="submit"
              className="
                w-full
                rounded-xl
                bg-cyan-500
                py-3.5
                font-semibold
                text-black
                transition
                hover:bg-cyan-400
              "
            >
              Sign In
            </motion.button>

          </form>

          {/* Register */}

          <div className="mt-7 text-center">

            <p className="text-sm text-gray-400">

              Don't have an account?

              {" "}

              <Link
                to="/register"
                className="
                  font-medium
                  text-cyan-400
                  transition
                  hover:text-cyan-300
                "
              >
                Create an account
              </Link>

            </p>

          </div>

        </motion.div>

      </div>
    </>
  );
}