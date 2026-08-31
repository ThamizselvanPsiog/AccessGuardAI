import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_BASE_URL = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * ============================================
   * RESTORE AUTHENTICATION
   * ============================================
   *
   * When the application starts, restore the
   * previously logged-in user and JWT.
   */

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("accessGuardUser");

      const storedToken =
        localStorage.getItem("accessGuardToken");

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
        setToken(storedToken);
      }
    } catch (error) {
      console.error(
        "Unable to restore authentication:",
        error
      );

      localStorage.removeItem(
        "accessGuardUser"
      );

      localStorage.removeItem(
        "accessGuardToken"
      );

      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);


  /*
   * ============================================
   * LOGIN
   * ============================================
   */

  const login = async (email, password) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      /*
       * Backend rejected login
       */

      if (!response.ok || !data.success) {
        return {
          success: false,
          message:
            data.message ||
            "Invalid email or password.",
        };
      }

      /*
       * Make sure backend returned
       * the required authentication data.
       */

      if (!data.user || !data.token) {
        return {
          success: false,
          message:
            "Invalid response received from server.",
        };
      }

      /*
       * Store user
       */

      localStorage.setItem(
        "accessGuardUser",
        JSON.stringify(data.user)
      );

      /*
       * Store JWT
       */

      localStorage.setItem(
        "accessGuardToken",
        data.token
      );

      /*
       * Update React state
       */

      setUser(data.user);
      setToken(data.token);

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to the server.",
      };
    }
  };


  /*
   * ============================================
   * REGISTER
   * ============================================
   *
   * Registration does NOT automatically log
   * the user in.
   *
   * Register
   *    ↓
   * Login
   *    ↓
   * Dashboard
   */

  const register = async (
    name,
    email,
    password
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      /*
       * Backend rejected registration
       */

      if (!response.ok || !data.success) {
        return {
          success: false,
          message:
            data.message ||
            "Unable to register.",
        };
      }

      /*
       * Registration successful.
       *
       * We intentionally DO NOT store the
       * user/token here.
       *
       * The user must login separately.
       */

      return {
        success: true,
        user: data.user,
        message:
          data.message ||
          "Registration successful.",
      };
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to the server.",
      };
    }
  };


  /*
   * ============================================
   * UPDATE PROFILE
   * ============================================
   *
   * Updates:
   * - Name
   * - Email
   *
   * Backend also returns a new JWT because
   * the email may have changed.
   */

  const updateProfile = async (
    name,
    email
  ) => {
    if (!name?.trim() || !email?.trim()) {
      return {
        success: false,
        message:
          "Name and email cannot be empty.",
      };
    }

    if (!token) {
      return {
        success: false,
        message:
          "You are not authenticated.",
      };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/profile`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      /*
       * Backend rejected profile update
       */

      if (!response.ok || !data.success) {
        return {
          success: false,
          message:
            data.message ||
            "Unable to update profile.",
        };
      }

      /*
       * Make sure backend returned the
       * updated authentication information.
       */

      if (!data.user || !data.token) {
        return {
          success: false,
          message:
            "Invalid response received from server.",
        };
      }

      /*
       * Store updated user
       */

      localStorage.setItem(
        "accessGuardUser",
        JSON.stringify(data.user)
      );

      /*
       * Store new JWT
       */

      localStorage.setItem(
        "accessGuardToken",
        data.token
      );

      /*
       * Update React state
       */

      setUser(data.user);
      setToken(data.token);

      return {
        success: true,
        user: data.user,
        token: data.token,
        message:
          data.message ||
          "Profile updated successfully.",
      };
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to the server.",
      };
    }
  };


  /*
   * ============================================
   * CHANGE PASSWORD
   * ============================================
   */

  const changePassword = async (
    currentPassword,
    newPassword
  ) => {
    if (
      !currentPassword ||
      !newPassword
    ) {
      return {
        success: false,
        message:
          "Current password and new password are required.",
      };
    }

    if (!token) {
      return {
        success: false,
        message:
          "You are not authenticated.",
      };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/password`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      /*
       * Backend rejected password change
       */

      if (!response.ok || !data.success) {
        return {
          success: false,
          message:
            data.message ||
            "Unable to change password.",
        };
      }

      /*
       * Always provide a fallback success
       * message so the UI never displays
       * "undefined".
       */

      return {
        success: true,
        message:
          data.message ||
          "Password changed successfully.",
      };
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      return {
        success: false,
        message:
          "Unable to connect to the server.",
      };
    }
  };


  /*
   * ============================================
   * LOGOUT
   * ============================================
   */

  const logout = () => {
    localStorage.removeItem(
      "accessGuardUser"
    );

    localStorage.removeItem(
      "accessGuardToken"
    );

    setUser(null);
    setToken(null);
  };


  /*
   * ============================================
   * CONTEXT VALUE
   * ============================================
   */

  const value = {
    user,
    token,
    loading,

    isAuthenticated:
      !!user && !!token,

    login,
    register,
    updateProfile,
    changePassword,
    logout,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


/*
 * ============================================
 * useAuth Hook
 * ============================================
 */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}