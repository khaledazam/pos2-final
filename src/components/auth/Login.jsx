import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
      console.log("✅ Login response:", res.data);

      const { user, token } = res.data;

      if (user && token) {
        // ✅ ADDED: Save token to localStorage
        localStorage.setItem("token", token);

        // ✅ ADDED: Save user to Redux
        dispatch(setUser({
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }));

        enqueueSnackbar(`Welcome back, ${user.name}!`, { variant: "success" });

        // ✅ ADDED: Redirect based on role
        const role = user.role?.toLowerCase();
        if (role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/pos");
        }
      } else {
        enqueueSnackbar("Invalid response from server", { variant: "error" });
      }
    },
    onError: (error) => {
      console.error("Login error:", error.response?.data);
      const message = error.response?.data?.message || "خطأ في تسجيل الدخول";
      enqueueSnackbar(message, { variant: "error" });
    }
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="bg-[#262626] p-8 rounded-3xl w-full max-w-md border border-[#333]">
        <h1 className="text-3xl font-black text-[#e2bc15] mb-2">POS System</h1>
        <p className="text-[#ababab] mb-8">Sign in to continue</p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Employee Email
            </label>
            <div className="flex items-center rounded-lg p-4 bg-[#1f1f1f] border border-[#333]">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="please, enter email"
                className="bg-transparent flex-1 text-white focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-4">
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Password
            </label>
            <div className="flex items-center rounded-lg p-4 bg-[#1f1f1f] border border-[#333]">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="bg-transparent flex-1 text-white focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg mt-6 py-4 text-lg bg-[#e2bc15] text-black font-black hover:bg-white transition-all disabled:opacity-50"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Test Accounts */}
        {/* <div className="mt-8 p-4 bg-[#1a1a1a] rounded-xl border border-[#333]">
          <p className="text-xs text-[#ababab] font-bold mb-2">Test Accounts:</p>
          <div className="space-y-2 text-xs">
            <div>
              <p className="text-yellow-400 font-bold">Admin:</p>
              <p className="text-[#f5f5f5] ml-2">Email: admin123@gmail.com</p>
              <p className="text-[#f5f5f5] ml-2">Password: admin123</p>
            </div>
            <div className="mt-2">
              <p className="text-blue-400 font-bold">Cashier:</p>
              <p className="text-[#f5f5f5] ml-2">Email: cashier123@gmail.com</p>
              <p className="text-[#f5f5f5] ml-2">Password: cashier123</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Login;