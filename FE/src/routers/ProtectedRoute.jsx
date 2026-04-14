import { Navigate, Outlet } from "react-router-dom";
import { jwt  } from "../utils/jwt";

export default function ProtectedRoute({ roles }) {
  const user = jwt();

  if (!user) return <Navigate to="/signin" replace />;

  if (
    roles &&
    !roles.some((role) => role.toLowerCase() === String(user.role).toLowerCase())
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}