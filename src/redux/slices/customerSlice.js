import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderId: "",
  customerName: "",
  customerPhone: "",
  guests: 1,
  table: null,
  session: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomer: (state, action) => {
      const { name, phone, guests } = action.payload;
      state.orderId = `${Date.now()}`;
      state.customerName = name;
      state.customerPhone = phone;
      state.guests = guests;
    },

    updateTable: (state, action) => {
      state.table = action.payload.table; // لازم فيها _id
      state.session = null;
    },

    updateSession: (state, action) => {
      state.session = action.payload.session;
      state.table = null;
    },

    removeCustomer: () => initialState,
  },
});

export const {
  setCustomer,
  updateTable,
  updateSession,
  removeCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;
