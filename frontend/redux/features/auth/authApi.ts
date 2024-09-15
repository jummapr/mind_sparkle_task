import { apiSlice } from "../api/apiSlice";
import { logoutUser, useLoadUser } from "./authSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data: any) => ({
        url: "user/register",
        method: "POST",
        body: data,
        credentials: "include" as const,
        formData: true,
      }),
    }),
    activateAccount: builder.mutation({
      query: (data: any) => ({
        url: `user/activateuser/${data}`,
        method: "POST",
        withCredentials: true,
        credentials: "include" as const,
      }),
    }),
    verifyCaptcha: builder.mutation({
      query: (data: any) => ({
        url: `user/verifyCaptcha`,
        method: "POST",
        withCredentials: true,
        body: data,
        credentials: "include" as const,
      }),
    }),
    loginUser: builder.mutation({
      query: (data: any) => ({
        url: "user/login",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),

      async onQueryStarted(arg: any, { queryFulfilled, dispatch }: any) {
        try {
          const result = await queryFulfilled;
          console.log(result.data);
          dispatch(
            useLoadUser({
              user: result.data.data.user,
            })
          );
        } catch (error: any) {
          console.log(error);
        }
      },
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "user/logout",
        method: "GET",
        credentials: "include" as const,
      }),

      async onQueryStarted(arg: any, { queryFulfilled, dispatch }) {
        dispatch(logoutUser());
      },
    }),
    updateUserInfo: builder.mutation({
      query: (data: any) => ({
        url: "user/update-user-info",
        method: "PUT",
        body: data,
        credentials: "include" as const,
        formData: true,
      }),

    //   async onQueryStarted(arg: any, { queryFulfilled, dispatch }: any) {
    //     try {
    //       const result = await queryFulfilled;
    //       dispatch(
    //         updateUserInfo({
    //           user: result.data.data.user,
    //         })
    //       );
    //     } catch (error: any) {
    //       console.log(error);
    //     }
    //   },
    }),
  }),
});
export const {
  useRegisterMutation,
  useActivateAccountMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useUpdateUserInfoMutation,
  useVerifyCaptchaMutation
} = authApiSlice;
