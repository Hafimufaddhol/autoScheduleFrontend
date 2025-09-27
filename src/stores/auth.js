import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // --- State ---
  const token = ref(localStorage.getItem("auth_token") || null);
  const user = ref(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);
  const loading = ref(false);
  const error = ref(null);

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const isModerator = computed(() => user.value?.role === "moderator" || isAdmin.value);

  // --- Actions ---
  async function login(credentials) {
    console.log(credentials);
    
    loading.value = true;
    error.value = null;

    try {
      // Dummy login (nanti bisa ganti API beneran)
      if (credentials.email === "admin" && credentials.password === "admin") {
        const dummyToken = "dummy.jwt.token.123456789";
        const dummyUser = { id: 1, name: "Admin User", email: credentials.email, role: "admin" };

        token.value = dummyToken;
        user.value = dummyUser;

        localStorage.setItem("auth_token", dummyToken);
        localStorage.setItem("user", JSON.stringify(dummyUser));

        return true;
      }

      throw new Error("Invalid credentials");
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function register(userData) {
    // dummy register
    const dummyToken = "dummy.jwt.token.987654321";
    const dummyUser = { id: 2, name: userData.name, email: userData.email, role: "user" };

    token.value = dummyToken;
    user.value = dummyUser;

    localStorage.setItem("auth_token", dummyToken);
    localStorage.setItem("user", JSON.stringify(dummyUser));

    return dummyUser;
  }

  function logout() {
    token.value = null;
    user.value = null;
    error.value = null;

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }

  async function refreshUser() {
    if (!token.value) return;
    loading.value = true;

    try {
      // dummy refresh
      const refreshedUser = { ...user.value, name: "Refreshed User" };
      user.value = refreshedUser;
      localStorage.setItem("user", JSON.stringify(refreshedUser));
      return refreshedUser;
    } catch (err) {
      logout();
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(profileData) {
    if (!token.value) throw new Error("Not authenticated");

    const updatedUser = { ...user.value, ...profileData };
    user.value = updatedUser;
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return updatedUser;
  }

  async function changePassword(passwordData) {
    if (!token.value) throw new Error("Not authenticated");
    // Dummy: selalu sukses
    return { success: true };
  }

  // --- Validation helpers ---
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password) => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const getPasswordStrength = (password) => {
    const validation = validatePassword(password);
    const score = Object.values(validation).filter(Boolean).length;
    if (score < 3) return "weak";
    if (score < 5) return "medium";
    return "strong";
  };

  return {
    // state
    token,
    user,
    loading,
    error,

    // getters
    isAuthenticated,
    isAdmin,
    isModerator,

    // actions
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,

    // validation helpers
    validateEmail,
    validatePassword,
    getPasswordStrength,
  };
});
