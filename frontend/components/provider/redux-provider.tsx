"use client"

import React, { ReactNode } from "react";
import { store } from "@/redux/store";
import { Provider } from "react-redux";

interface ReduxProviderProps {
  children: ReactNode;
}

export const ReduxProvider = ({ children }: ReduxProviderProps) => {
  return <Provider store={store}>{children}</Provider>;
};
