import Header from "../Components/Header.jsx";
import Footer from "../Components/Footer.jsx";
import Sidebar from "../Components/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { jwt } from "../utils/jwt.js";
import HeadrAdmin from "../Pages/admin/HeadrAdmin.jsx";

function LayoutAdmin() {
  const user = jwt();
  const showSidebar = user?.role === "provider";

  return (
    <div className="min-h-screen flex flex-col">
     {/* <HeadrAdmin/> */}
     <Header/>
      <main className="flex flex-1 w-full">
        {showSidebar && <Sidebar />}

        <div className="flex-1 bg-gray-50">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LayoutAdmin;
