import { axiosWrapper } from "./axiosWrapper";

// ================== Auth Endpoints ==================
export const login = (data) => axiosWrapper.post("/api/auth/login", data);
export const register = (data) => axiosWrapper.post("/api/auth/register", data);
export const getUserData = () => axiosWrapper.get("/api/auth/me");
export const logout = () => axiosWrapper.post("/api/auth/logout");

// ================== Table Endpoints ==================
export const getTables = () => axiosWrapper.get("/api/table");
export const addTable = (data) => axiosWrapper.post("/api/table", data);
export const updateTable = ({ id, ...data }) => axiosWrapper.put(`/api/table/${id}`, data);
export const deleteTable = (id) => axiosWrapper.delete(`/api/table/${id}`);

// ================== Inventory/Products Endpoints ==================
export const getInventory = () => axiosWrapper.get("/api/products");
export const getCategories = () => axiosWrapper.get("/api/products/categories");
export const addInventoryItem = (data) => axiosWrapper.post("/api/products", data);
export const updateInventoryItem = ({ id, ...data }) => axiosWrapper.put(`/api/products/${id}`, data);
export const deleteInventoryItem = (id) => axiosWrapper.delete(`/api/products/${id}`);

// ================== Menu Endpoints ==================
// Note: Menu is separate from Inventory/Products
export const getMenuItems = () => axiosWrapper.get("/api/menu");
export const createMenuItem = (data) => axiosWrapper.post("/api/menu", data);
export const updateMenuItem = ({ id, ...data }) => axiosWrapper.put(`/api/menu/${id}`, data);
export const deleteMenuItem = (id) => axiosWrapper.delete(`/api/menu/${id}`);

// ================== PlayStation Endpoints ==================
// ✅ CORRECTED PlayStation API Endpoints (Match Backend Routes Exactly)

// PlayStation CRUD
export const getPlayStations = () => axiosWrapper.get("/api/playstations");

export const addPlayStation = (data) => axiosWrapper.post("/api/playstations", data);

export const updatePlayStation = ({ id, ...data }) => 
  axiosWrapper.put(`/api/playstations/${id}`, data);

export const deletePlayStation = (id) => 
  axiosWrapper.delete(`/api/playstations/${id}`);

// PlayStation Session Management
export const startPSSession = (playStationId) => 
  axiosWrapper.post("/api/playstations/sessions/start", { playStationId });

// ✅ FIX: Changed from /sessions/:id/end to /sessions/end/:id
export const endPSSession = (sessionId) => 
  axiosWrapper.post(`/api/playstations/sessions/end/${sessionId}`);

// ✅ FIX: Changed from /sessions/:id/invoice to /invoices/:id
export const getPSInvoice = (sessionId) => 
  axiosWrapper.get(`/api/playstations/invoices/${sessionId}`);
// ================== Order Endpoints ==================
export const getOrders = (params) => axiosWrapper.get("/api/orders", { params });
export const getOrderById = (id) => axiosWrapper.get(`/api/orders/${id}`);
export const addOrder = (data) => axiosWrapper.post("/api/orders", data);
export const updateOrderStatus = ({ id, orderStatus }) => axiosWrapper.put(`/api/orders/${id}`, { orderStatus });
export const deleteOrder = (id) => axiosWrapper.delete(`/api/orders/${id}`);
export const getOrderStats = (params) => axiosWrapper.get("/api/orders/stats", { params });

// ================== Payment Endpoints ==================
// Order-to-Payment Flow
// ===== Payments API Calls =====
// استخدم /api/payments مباشرة (الروت الصحيح في الباك)

export const addToPayment = (orderId) => axiosWrapper.post("/api/payments", { orderId });

export const getPayments = (params) => axiosWrapper.get("/api/payments", { params });

export const getPaymentById = (id) => axiosWrapper.get(`/api/payments/${id}`);

export const getPaymentStats = (params) => axiosWrapper.get("/api/payments/stats", { params });

export const updatePaymentStatus = ({ id, status }) => axiosWrapper.put(`/api/payments/${id}`, { status });
// Legacy Payment Endpoints (if you still use them)
export const addInvoice = (data) => axiosWrapper.post("/api/invoices", data);
export const getInvoices = (filter = "all") => axiosWrapper.get(`/api/orders/invoices?filter=${filter}`);

// ================== Razorpay Payment Endpoints ==================
export const createOrderRazorpay = (data) => axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) => axiosWrapper.post("/api/payment/verify-payment", data);

// ================== Reports Endpoints ==================
export const getSummary = () => axiosWrapper.get("/api/reports/summary");