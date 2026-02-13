import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, removeUser } from "../redux/slices/userSlice";
import { getUserData } from "../https";

const useLoadData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { isAuth } = useSelector((state) => state.user);

  useEffect(() => {
    let isMounted = true;

    // الخطوة الأولى: حاول تحميل المستخدم من localStorage فورًا
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch(setUser(user));
        console.log("تم تحميل المستخدم من localStorage بعد الريفريش:", user.name);
        setIsLoading(false);
        return; // خلاص، مش محتاج نعمل fetch تاني
      } catch (err) {
        console.error("خطأ في قراءة user من localStorage:", err);
        localStorage.removeItem("user");
      }
    }

    // لو مفيش بيانات محفوظة أو التوكن مش موجود → نفذ الـ fetch
    const loadUserData = async () => {
      try {
        console.log("جاري جلب بيانات المستخدم من الـ API...");
        const response = await getUserData();
        const userData = response.data?.user || response.data?.data;

        if (userData && isMounted) {
          const formattedUser = {
            id: userData.id || userData._id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
          };
          dispatch(setUser(formattedUser));
          // حفظ البيانات للريفريش الجاي
          localStorage.setItem("user", JSON.stringify(formattedUser));
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات المستخدم:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch(removeUser());
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // نفذ الـ fetch لو لزم الأمر
    if (storedToken && !isAuth) {
      loadUserData();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []); // يفضل [] عشان يشتغل مرة واحدة عند الـ mount

  return isLoading;
};

export default useLoadData;