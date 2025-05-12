import { Switch } from "react-router-dom";
import { AuthProvider } from "./contexts/JWTAuthContext";
import { GlobalStoreProvider } from "./contexts/GlobalStoreContext";
import routes, { renderRoutes } from "./routes";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import "./index.css";
import 'react-quill/dist/quill.snow.css';

const App = () => {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <GlobalStoreProvider>
          <Switch>{renderRoutes(routes)}</Switch>
        </GlobalStoreProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
};

export default App;
