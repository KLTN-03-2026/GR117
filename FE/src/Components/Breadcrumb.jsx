import { Link, useLocation } from "react-router-dom";

const ROOT_ROUTES = {
  admin: {
    label: "Dashboard",
    to: "/admin/dashboard",
  },
  provider: {
    label: "Dashboard",
    to: "/provider/dashboard",
  },
  user: {
    label: "Dashboard",
    to: "/user/dashboard",
  },
};

const PAGE_LABELS = {
  services: "D\u1ecbch v\u1ee5",
  addservices: "Th\u00eam d\u1ecbch v\u1ee5",
  detailservices: "Chi ti\u1ebft d\u1ecbch v\u1ee5",
  schedule: "L\u1ecbch kh\u1edfi h\u00e0nh",
  booking: "\u0110\u1eb7t ch\u1ed7",
  revenue: "Doanh thu",
  partnerprofile: "H\u1ed3 s\u01a1 \u0111\u1ed1i t\u00e1c",
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
