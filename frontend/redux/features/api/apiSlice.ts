import type { Action, PayloadAction } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {useLoadUser} from "../auth/authSlice";


export const apiSlice = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_SERVER_URI!
    }),
    endpoints: (builder) => ({
        loadUser: builder.query({
            query: () => ({
                url: 'user/getuser',
                method:"GET",
                credentials: "include" as const,
            }),

            async onQueryStarted(arg:any, {queryFulfilled, dispatch}) {
                try {
                    const result=await queryFulfilled;
                    console.log(result.data.data)
                    dispatch(
                        useLoadUser({
                            user: result.data.data
                        })
                    )
                } catch (error:any) {
                  console.log(error);
                    
                }
            }
        }),
    })
})

export const { useLoadUserQuery } = apiSlice