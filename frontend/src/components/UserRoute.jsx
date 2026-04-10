import { Navigate } from "react-router-dom";

const UserRoute = ({ children }) => {
  const token = localStorage.getItem("usertoken");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userStr);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "user") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserRoute;










// import { Navigate } from "react-router-dom";

// const UserRoute = ({ children }) => {
//   const token = localStorage.getItem("usertoken");
//   const userStr = localStorage.getItem("user");

//   let user = null;

//   try {
//     user = userStr ? JSON.parse(userStr) : null;
//   } catch {
//     localStorage.removeItem("usertoken");
//     localStorage.removeItem("user");
//     return <Navigate to="/login" replace />;
//   }

//   if (
//     !token ||
//     token === "undefined" ||
//     token === "null" ||
//     !user ||
//     user.role !== "user"
//   ) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default UserRoute;
