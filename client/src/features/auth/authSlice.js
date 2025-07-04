import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   userData : [{ id:"userID", userName:"someone", email:"someone@example.com", active:"no"}],
};

export const authSlice = createSlice({
   name: "auth",
   initialState,
   reducers: {
      //reducer object functions
      // userLogin:(state, action)      
   }
})