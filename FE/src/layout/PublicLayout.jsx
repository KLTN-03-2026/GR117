import Header from "../Components/shared/Header.jsx";
import Footer from "../Components/shared/Footer.jsx";
import { Navigate, Outlet } from "react-router-dom";
import { jwt } from "../utils/jwt.js";

function PublicLayout() {
  const user = jwt();

  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "provider") return <Navigate to="/provider" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default PublicLayout;
