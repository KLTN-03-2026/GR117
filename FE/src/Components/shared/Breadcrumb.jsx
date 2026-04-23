import { Link, useLocation } from "react-router-dom";

const ROOT_ROUTES = {
  admin: {
    label: "Dashboard",
    to: "/admin",
  },
  provider: {
    label: "Dashboard",
    to: "/provider",
  },
  user: {
    label: "Dashboard",
    to: "/user/dashboard",
  },
};

const PAGE_LABELS = {
  services: "Dịch vụ",
  addservices: "Thêm dịch vụ",
  detailservices: "Chi tiết dịch vụ",
  schedule: "Lịch khởi hành",
  booking: "Đặt chỗ",
  coupons: "Mã giảm giá",
  revenue: "Doanh thu",
};

function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const [scope, section] = segments;
  const rootRoute = ROOT_ROUTES[scope];

  if (!rootRoute || !section || pathname.toLowerCase() === rootRoute.to.toLowerCase()) {
    return null;
  }

  const normalizedSection = section.toLowerCase();

  return (
    <div className="mb-4 flex items-center gap-2 text-sm">
      <Link to={rootRoute.to} className="text-gray-400 hover:text-gray-600">
        {rootRoute.label}
      </Link>

      <span className="text-gray-400">{">"}</span>

      <span className="font-medium text-orange-500">
        {PAGE_LABELS[normalizedSection] || section}
      </span>
    </div>
  );
}

export default Breadcrumb;
