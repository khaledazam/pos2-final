import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuth, user } = useSelector((state) => state.user);

  // ✅ Check if user is logged in
  if (!isAuth || !user) {
    return <Navigate to="/auth" replace />;
  }

  // ✅ Check if route has role restrictions
  if (allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase();
    const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole);

    if (!isAllowed) {
      enqueueSnackbar("غير مصرح لك بالدخول إلى هذه الصفحة", { 
        variant: "error",
        autoHideDuration: 3000
      });
      
      // Redirect based on role
      if (userRole === "admin") {
        return <Navigate to="/dashboard" replace />;
      } else {
        return <Navigate to="/pos" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;