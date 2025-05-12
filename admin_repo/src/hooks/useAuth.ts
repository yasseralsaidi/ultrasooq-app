import { useContext } from "react";
import AuthContext from "../contexts/JWTAuthContext";
import { AuthContextType } from "../contexts/JWTAuthContext"; // Ensure the type is exported

const useAuth = () => useContext<AuthContextType>(AuthContext);

export default useAuth;
