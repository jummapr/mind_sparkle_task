
import {PayloadAction, createSlice} from "@reduxjs/toolkit";


const initialState = {
    user: null,
    isAuthenticated: false,
}


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        useLoadUser: (state,action: PayloadAction<{user: any}>) => {
            state.user= action.payload.user
            console.log(action)
            state.isAuthenticated = true
        },
        logoutUser: (state) => {
            state.user = null
            state.isAuthenticated = false
        },
        updateUserInfo: (state,action) => {
            state.user = action.payload
        },
    }
})

export const {useLoadUser,logoutUser,updateUserInfo} = authSlice.actions
export default authSlice