import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
        id: null,
        name: null,
        email: null,
        phone: null,
        role: null,
    },
    isAuth: false
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { id, name, phone, email, role } = action.payload;
            state.user = { id, name, phone, email, role };
            state.isAuth = true;
        },

        removeUser: (state) => {
            state.user = {
                id: null,
                email: null,
                name: null,
                phone: null,
                role: null,
            };
            state.isAuth = false;
        }
    }
})

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;