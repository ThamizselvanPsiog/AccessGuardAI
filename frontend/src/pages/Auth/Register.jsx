import { motion } from "framer-motion";
import {
  FiLock,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import Background from "../../layout/Background/Background";
import AppAlert from "../../components/common/AppAlert";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const clearError = (field) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setAlertMessage("");
    setShowAlert(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setAlertMessage("");
    setShowAlert(false);

    let hasError = false;

    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Please enter your name.";
      hasError = true;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Please enter your email.";
      hasError = true;
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Please enter a password.";
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters.";
      hasError = true;
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword =
        "Please confirm your password.";
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await register(
        name.trim(),
        email.trim(),
        password
      );

      if (!result.success) {
        const message =
          result.message ||
          "Unable to create your account.";

        setAlertMessage(message);
        setShowAlert(true);

        /*
         * Keep name and email.
         * Clear password fields so the user
         * can safely try again.
         */
        setPassword("");
        setConfirmPassword("");

        return;
      }

      /*
       * Registration successful.
       *
       * We intentionally navigate to "/"
       * instead of automatically logging the
       * user into the dashboard.
       *
       * The user can now log in using the
       * newly registered credentials.
       */
      navigate("/");

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setAlertMessage(
        "Unable to create your account. Please try again."
      );

      setShowAlert(true);

      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <>
      {/* Application Background */}

      <Background />

      {/* Application Alert */}

      <AppAlert
        show={showAlert}
        message={alertMessage}
        type="error"
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
          py-10
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

        {/* Register Card */}

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
              Create your account
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Register to start using AccessGuardAI.
            </p>

          </div>


          {/* Registration Form */}

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* Name */}

            <div>

              <label
                htmlFor="name"
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
                  size={18}
                />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  placeholder="Enter your name"
                  autoComplete="name"
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

              {errors.name && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.name}
                </p>
              )}

            </div>


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
                    clearError("email");
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

              {errors.email && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.email}
                </p>
              )}

            </div>


            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-300
                "
              >
                Password
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
                  size={18}
                />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  placeholder="Create a password"
                  autoComplete="new-password"
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

              {errors.password && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.password}
                </p>
              )}

            </div>


            {/* Confirm Password */}

            <div>

              <label
                htmlFor="confirmPassword"
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
                  size={18}
                />

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );

                    clearError(
                      "confirmPassword"
                    );
                  }}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
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

              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.confirmPassword}
                </p>
              )}

            </div>


            {/* Register Button */}

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
              Create Account
            </motion.button>

          </form>


          {/* Login Link */}

          <div className="mt-7 text-center">

            <p className="text-sm text-gray-400">

              Already have an account?

              {" "}

              <Link
                to="/"
                className="
                  font-medium
                  text-cyan-400
                  transition
                  hover:text-cyan-300
                "
              >
                Sign in
              </Link>

            </p>

          </div>

        </motion.div>

      </div>
    </>
  );
}