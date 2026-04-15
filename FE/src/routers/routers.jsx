import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout.jsx";
import LayoutAdmin from "../layout/LayoutAdmin.jsx";
import HomePage from "../Pages/client/HomePage.jsx";
import SignIn from "../Pages/auth/SignIn.jsx";
import Register from "../Pages/auth/Register.jsx";
import ForgotPassword from "../Pages/auth/ForgotPassword.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { jwt } from "../utils/jwt.js";
import Services from "../Pages/provider/Services.jsx";
import DashboardAdmin from "../Pages/admin/DashboardAdmin.jsx";
import AddServices from "../Pages/provider/AddServices.jsx";
import DashboardProvider from "../Pages/provider/DashboardProvider.jsx";
import EditServices from "../Pages/provider/EditServices.jsx";
import ServicesDetail from "../Pages/provider/ServicesDetail.jsx";
import Destination from "../Pages/client/Destination.jsx";
import About from "../Pages/client/About.jsx";
import Contact from "../Pages/client/Contact.jsx";
import ProviderSchedule from "../Pages/provider/ProviderSchedule.jsx";
import Booking from "../Pages/provider/Booking.jsx";
import Revenue from "../Pages/provider/Revenue.jsx";
import ServiceManagement from "../Pages/admin/ServiceManagement.jsx";
import AccountManagement from "../Pages/admin/AccountManagement.jsx";
import BookingManagement from "../Pages/admin/BookingManagement.jsx";
import DetailServices from "../Pages/client/DetailServers.jsx";

function Routers() {
  const user = jwt();

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={user ? <Navigate to="/" /> : <SignIn />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />
        <Route path="/destination" element={<Destination />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services/:id" element={<DetailServices />} />
        <Route path="/DetailServices" element={<DetailServices />} />
      </Route>

      <Route element={<ProtectedRoute roles={["user"]} />}>
        <Route path="/user" element={<PublicLayout />}>
          <Route path="dashboard" element={<div>User Dashboard</div>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<LayoutAdmin />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="servicemanager" element={<ServiceManagement />} />
          <Route path="ServiceManager" element={<Navigate to="servicemanager" replace />} />
          <Route path="accountmanager" element={<AccountManagement />} />
          <Route path="AccountManager" element={<Navigate to="accountmanager" replace />} />
          <Route path="bookingmanager" element={<BookingManagement />} />
          <Route path="BookingManager" element={<Navigate to="bookingmanager" replace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["provider"]} />}>
        <Route path="/provider" element={<LayoutAdmin />}>
          <Route index element={<DashboardProvider />} />
          <Route path="dashboard" element={<Navigate to="/provider" replace />} />
          <Route path="services" element={<Services />} />
          <Route path="Services" element={<Navigate to="services" replace />} />
          <Route path="addservices" element={<AddServices />} />
          <Route path="AddServices" element={<Navigate to="addservices" replace />} />
          <Route path="editservices/:id" element={<EditServices />} />
          <Route path="EditServices/:id" element={<EditServices />} />
          <Route path="detailservices/:id" element={<ServicesDetail />} />
          <Route path="DetailServices/:id" element={<ServicesDetail />} />
          <Route path="schedule" element={<ProviderSchedule />} />
          <Route path="Schedule" element={<Navigate to="schedule" replace />} />
          <Route path="booking" element={<Booking />} />
          <Route path="Booking" element={<Navigate to="booking" replace />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="Revenue" element={<Navigate to="revenue" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default Routers;
