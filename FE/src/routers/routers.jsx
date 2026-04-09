import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout.jsx";
import LayoutAdmin from "../layout/LayoutAdmin.jsx";
import HomePage from "../Pages/HomePage.jsx";
import SignIn from "../Pages/SignIn.jsx";
import Register from "../Pages/Register.jsx";
import ForgotPassword from "../Pages/ForgotPassword.jsx";
import DashboardProvider from "../Pages/provider/DashboardProvider.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { jwt } from "../utils/jwt.js";
import Services from "../Pages/provider/Services.jsx";
import DashboardAdmin from "../Pages/admin/DashboardAdmin.jsx";
import AddServices from "../Pages/provider/AddServices.jsx";
import EditServices from "../Pages/provider/EditServices.jsx";
import ServicesDetail from "../Pages/provider/ServicesDetail.jsx";
import Destination from "../Pages/Destination.jsx";
import About from "../Pages/About.jsx";
import Contact from "../Pages/Contact.jsx";
import ProviderSchedule from "../Pages/provider/ProviderSchedule.jsx";
import Booking from "../Pages/provider/Booking.jsx";
import Revenue from "../Pages/provider/Revenue.jsx";
import PartnerProfile from "../Pages/provider/PartnerProfile.jsx";

function Routers() {
  const user = jwt();

  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/signin"
          element={user ? <Navigate to="/" /> : <SignIn />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/" /> : <ForgotPassword />}
        />
        <Route path="/destination" element={<Destination />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* USER */}
      <Route element={<ProtectedRoute roles={["user"]} />}>
        <Route path="/user" element={<PublicLayout />}>
          <Route path="dashboard" element={<div>User Dashboard</div>} />
        </Route>
      </Route>

      {/* ADMIN */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<LayoutAdmin />}>
          <Route path="dashboard" element={<DashboardAdmin />} />
        </Route>
      </Route>

      {/* PROVIDER */}
      <Route element={<ProtectedRoute roles={["provider"]} />}>
        <Route path="/provider" element={<LayoutAdmin />}>
          <Route path="dashboard" element={<DashboardProvider />} />
          <Route path="Services" element={<Services />} />
          <Route path="AddServices" element={<AddServices />} />
          <Route path="EditServices/:id" element={<EditServices />} />
          <Route path="DetailServices/:id" element={<ServicesDetail />} />
          <Route path="Schedule" element={<ProviderSchedule />} />
          <Route path="Booking" element={<Booking />} />
          <Route path="Revenue" element={<Revenue />} />
          <Route path="PartnerProfile" element={<PartnerProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default Routers;

