import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const adminStr = localStorage.getItem("admin");

  if (!token || !adminStr) {
    return <Navigate to="/admin/login" replace />;
  }

  let admin;

  try {
    admin = JSON.parse(adminStr);
  } catch {
    return <Navigate to="/admin/login" replace />;
  }

  if (admin.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;

// import { Navigate } from "react-router-dom";

// const AdminRoute = ({ children }) => {
//   const token = localStorage.getItem("adminToken");
//   const adminStr = localStorage.getItem("admin");

//   let admin = null;

//   try {
//     admin = adminStr ? JSON.parse(adminStr) : null;
//   } catch {
//     localStorage.clear();
//     return <Navigate to="/admin/login" replace />;
//   }

//   if (!token || !admin || admin.role !== "admin") {
//     // localStorage.clear();
//     return <Navigate to="/admin/login" replace />;
//   }

//   return children;
// };

// export default AdminRoute;
