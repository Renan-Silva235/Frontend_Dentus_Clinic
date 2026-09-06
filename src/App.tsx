import { BrowserRouter } from "react-router-dom";
import { AutenticacaoProvider } from "./contexts/AutenticacaoContext";
import { TemaProvider } from "./contexts/TemaContext";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <AutenticacaoProvider>
      <TemaProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TemaProvider>
    </AutenticacaoProvider>
  );
}
