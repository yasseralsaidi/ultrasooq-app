import React, { createContext, useReducer } from "react";

const initialGlobalState = {
  customValue: "old value in global store",
  TOGGLE_TERM_CONDITION_MODAL: false,
  TOGGLE_MAC_SETTINGS_MODAL: false,
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "ADDVALUE": {
      return {
        ...state,
        customValue: "demo value for global context",
      };
    }
    case "TOGGLE_MODAL": {
      if (action.payload === "TOGGLE_TERM_CONDITION_MODAL") {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_TERM_CONDITION_MODAL,
        };
      } else if (action.payload === "TOGGLE_MAC_SETTINGS_MODAL") {
        return {
          ...state,
          [action.payload]: !state.TOGGLE_MAC_SETTINGS_MODAL,
        };
      }
      break;
    }
    default: {
      return { ...state };
    }
  }
};

const GlobalContext = createContext({
  ...initialGlobalState,
  addValMethod: () => {},
  toggleForModal: (args: any) => {},
});

export const GlobalStoreProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(reducer, initialGlobalState);

  const addValMethod = (payload: any) => {
    dispatch({ type: "ADDVALUE", payload: payload });
  };
  const toggleForModal = (payload: any) => {
    dispatch({ type: "TOGGLE_MODAL", payload: payload });
  };

  return (
    <GlobalContext.Provider
      value={{
        ...state,
        addValMethod,
        toggleForModal,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
