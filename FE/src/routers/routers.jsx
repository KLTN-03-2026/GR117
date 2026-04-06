import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout.jsx";
import LayoutAdmin from "../layout/LayoutAdmin.jsx";
import HomePage from "../Pages/HomePage.jsx";
import SignIn from "../Pages/Auth/SignIn.jsx";
import Register from "../Pages/Auth/Register.jsx";
import DashboardProvider from "../Pages/DashboardProvider.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { jwt } from "../utils/jwt.js";
import Services from "../Pages/Services.jsx";
import Dashboard from "../Pages/Dashboard.jsx";
import AddServices from "../Pages/AddServices.jsx";
import ServicesDetail from "../Pages/ServicesDetail.jsx";
import Destination from "../Pages/Destination.jsx";
import About from "../Pages/About.jsx";
import Contact from "../Pages/Contact.jsx";
import DepartureSchedule from "../Pages/DepartureSchedule.jsx";
import Booking from "../Pages/Booking.jsx";
import Revenue from "../Pages/Revenue.jsx";
import PartnerProfile from "../Pages/PartnerProfile.jsx";

function Routers() {
  const user = jwt();
  const P = []
  return (
    <Routes>

      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={user ? <Navigate to="/" /> : <SignIn />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      </Route>
      
      {/* USER */}
      <Route element={<ProtectedRoute roles={["user"]} />}>
        <Route path="/user" element={<PublicLayout />}>
          <Route path="dashboard" element={<div>User Dashboard</div>} />
          <Route path="Destination" element={<Destination/>} />
          <Route path="About" element={<About/>} />
          <Route path="Contact" element={<Contact/>} /> 
        </Route>
      </Route>
     
      {/* ADMIN */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<LayoutAdmin />}>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      {/* PROVIDER */}
      <Route element={<ProtectedRoute roles={["provider"]} />}>
        <Route path="/provider" element={<LayoutAdmin />}>
          <Route path="dashboard" element={<DashboardProvider />} />
          {/* <Route path="/DBdeatils" element={<Dashboard/>} /> */}
          <Route path="Services" element={<Services/>}  />
          <Route path="AddServices" element={<AddServices/>}  />
          <Route path="DetailServices/:id" element={<ServicesDetail/>}  />
          <Route path="Schedule" element={<DepartureSchedule/>}  />
          <Route path="Booking" element={<Booking/>}  />
          <Route path="Revenue" element={<Revenue/>}  />
          <Route path="PartnerProfile" element={<PartnerProfile/>}  />
        </Route>
      </Route>
    </Routes>
  );
}

export default Routers;