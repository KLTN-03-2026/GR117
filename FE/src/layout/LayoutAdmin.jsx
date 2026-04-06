import Header from '../Components/Header.jsx';
import Footer from '../Components/Footer.jsx';
import Sidebar from "../Components/Sidebar.jsx";
import { Outlet } from 'react-router-dom';

function LayoutAdmin() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main content với Sidebar + Outlet */}
      <main className="flex flex-1 w-full">
        {/* Sidebar cố định bên trái */}
        <Sidebar />

        {/* Nội dung chiếm hết phần còn lại */}
        <div className="flex-1 bg-gray-50">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LayoutAdmin;