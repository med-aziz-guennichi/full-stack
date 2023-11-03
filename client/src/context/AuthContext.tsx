// AuthContext.tsx
import Cookies from "js-cookie";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
type IUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: string;
  isVerified: boolean;
  posts: Array<{ postId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
};
// Define the authentication state and action types
type AuthState = {
  user: IUser | null;
  token: string | null;
};

type AuthAction =
  | { type: "LOGIN"; payload: AuthState }
  | { type: "LOGOUT" }
  | { type: "UPDATE_TOKEN"; payload: string };

// Create the context
const AuthContext = createContext<
  { state: AuthState; dispatch: React.Dispatch<AuthAction> } | undefined
>(undefined);

// Define the reducer function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user || null,
        token: action.payload.token || null,
      };
    case "LOGOUT":
      return {
        user: null,
        token: null,
      };
    case "UPDATE_TOKEN":
      return {
        ...state,
        token: action.payload,
      };
    default:
      return state;
  }
}

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
  });

  const checkAndRefreshToken = async () => {
    const accessToken = Cookies.get("access_token");
    if (accessToken) {
      try {
        const response = await api.post("/refresh");
        Cookies.set("access_token", response.data.accessToken, { expires: 1 });
        dispatch({ type: "UPDATE_TOKEN", payload: response.data.accessToken });
      } catch (error) {
        console.error(
          "Error while checking or refreshing the access token:",
          error
        );
      }
    }
  };

  // Add a timer to refresh the token periodically
  useEffect(() => {
    const refreshInterval = 4 * 60 * 1000;

    const refreshTimer = setInterval(() => {
      checkAndRefreshToken();
    }, refreshInterval);

    return () => {
      clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    if (!state.user) {
      navigate("/auth");
    } else {
      navigate("/");
    }
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create custom hooks for using the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
