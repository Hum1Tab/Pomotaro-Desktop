import { createRoot } from "react-dom/client";
import "./lib/desktop-api";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
