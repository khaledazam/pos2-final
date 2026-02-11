import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, removeUser } from "../redux/slices/userSlice";
import { getUserData } from "../https";

const useLoadData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { isAuth } = useSelector((state) => state.user);

  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount

    const loadUserData = async () => {
      try {
        console.log("🔄 useLoadData - Loading user data...");

        // ✅ ADDED: Check if token exists
        const token = localStorage.getItem("token");

        if (!token) {
          // ✅ SKIP: If no token in localStorage, assume not logged in (even if cookie exists)
          // This enforces strict logout behavior
          if (isMounted) {
            dispatch(removeUser());
            setIsLoading(false);
          }
          return;
        }

        // ✅ ADDED: Fetch user data (Token is attached via axios interceptor)
        const response = await getUserData();
        const userData = response.data?.user || response.data?.data;

        if (userData && isMounted) {
          dispatch(setUser({
            id: userData.id || userData._id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role
          }));
        } else {
          throw new Error("Invalid user data");
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);

        // ✅ ADDED: Clear auth if unauthorized
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (isMounted) dispatch(removeUser());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Only run if not already authenticated
    if (!isAuth) {
      loadUserData();
    } else {
      console.log("✅ Already authenticated");
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // ✅ Run only once on mount

  return isLoading;
};

export default useLoadData;