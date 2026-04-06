import { jwtDecode } from "jwt-decode";

export const jwt = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    // check expire
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("accessToken");
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
};