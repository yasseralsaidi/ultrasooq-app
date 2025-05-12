import { createContext, useEffect, useReducer } from "react";
import { ME, loginApi } from "../actions/authAction";
import { useHistory } from "react-router-dom";
import Cookie from "../utils/Cookie";
import { toast } from "react-toastify";
import LoadingScreen from "../components/LoadingScreen";
import { fetchRole } from "../apis/requests/roles.requests";

interface User {
  id: string;
  name: string;
  email: string;
  cart_count?: number;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  tradeRole?: string;
  adminRoleId?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  isInitialised: boolean;
  user: User | null;
  permissions: string[];
}

export interface AuthContextType extends AuthState {
  LoginContext: (payload: any, type?: string) => Promise<void>;
  Logout: () => void;
  updateUser: (user: User) => void;
  RegisterUser: (payload: any, type?: string) => Promise<void>;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  isInitialised: false,
  user: null,
  permissions: [],
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "INITIALISE": {
      const { isAuthenticated, user, permissions } = action.payload;

      return {
        ...state,
        isAuthenticated,
        isInitialised: true,
        user,
        permissions
      };
    }
    case "LOGIN": {
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        permissions: action.payload.permissions
      };
    }
    case "LOGOUT": {
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    }
    case "userUpdate": {
      return {
        ...state,
        user: action.payload,
      };
    }
    case "REGISTER": {
      // const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    }
    default: {
      return { ...state };
    }
  }
};

const AuthContext = createContext<AuthContextType>({
  ...initialAuthState,
  LoginContext: () => Promise.resolve(),
  Logout: () => {},
  updateUser: () => {},
  RegisterUser: () => Promise.resolve(),
});

export const AuthProvider = ({ children }: any) => {
  const history = useHistory();
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  const LoginContext = async (payload: any, type = "normalLogin") => {
    if (type === "normalLogin") {
      const response = await loginApi(payload);
      console.log("login response: ---------", response);
      if (response) {
        if (response.data.status) {
          Cookie.setCookie(
            "_tokenPuremoon_SuperAdmin",
            response.data.accessToken,
            1
          );

          let permissions: string[] = [];
          if (response.data.data.tradeRole == 'ADMINMEMBER') {
            let response2 = await fetchRole(response.data.data.adminRoleId || 3);
            if (response2.status) {
              response2?.data?.data?.adminRolePermission?.forEach((permission: any) => {
                if (permission?.adminPermissionDetail?.name) {
                  permissions.push(permission?.adminPermissionDetail?.name);
                }
              });
            }
          }
          
          dispatch({ 
            type: "LOGIN", 
            payload: {
              user: response.data.data,
              permissions: permissions
            }
          });
          toast.success("Login successfully");
          history.push("/user/dashboard");
        } else {
          toast.error(response?.data?.message);
          return response;
        }
      } else {
        toast.error("Something went wrong");
        console.log("Error");
      }
    } else {
    }
    // return body;
  };

  const Logout = () => {
    dispatch({ type: "LOGOUT" });
    toast.success("Logout successfully");
    // document.querySelector('body').classList.toggle("fixed")
    Cookie.deleteCookie("_tokenPuremoon_SuperAdmin");
  };

  const updateUser = (user: any) => {
    dispatch({ type: "userUpdate", payload: user });
  };

  const RegisterUser = async (payload: any, type = "normalRegister") => {};

  useEffect(() => {
    const initialise = async () => {
      try {
        const accessToken = Cookie.getCookie("_tokenPuremoon_SuperAdmin");

        if (accessToken) {
          Cookie.setCookie("_tokenPuremoon_SuperAdmin", accessToken, 1);
          // call user details api
          const response = await ME();
          if (response.data.status) {
            let permissions: string[] = [];
            if (response.data.data.tradeRole == 'ADMINMEMBER') {
              let response2 = await fetchRole(response.data.data.adminRoleId || 3);
              if (response2.status) {
                response2?.data?.data?.adminRolePermission?.forEach((permission: any) => {
                  if (permission?.adminPermissionDetail?.name) {
                    permissions.push(permission?.adminPermissionDetail?.name);
                  }
                });
              }
            }

            dispatch({
              type: "INITIALISE",
              payload: {
                isAuthenticated: true,
                user: response.data.data,
                permissions: permissions
              },
            });
            // console.log("Hi ", response.data.data);
          } else {
            dispatch({
              type: "INITIALISE",
              payload: {
                isAuthenticated: false,
                user: null,
                permissions: []
              },
            });
            Logout();
            history.push("/login");
          }

          // console.log("me api res: -----", response);
        } else {
          dispatch({
            type: "INITIALISE",
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: "INITIALISE",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.isInitialised) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        LoginContext,
        Logout,
        updateUser,
        RegisterUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
