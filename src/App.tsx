import { useEffect, useState } from "react";
import TaxesTable from "./components/taxestable";

type Theme = "light" | "dark";

function App() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">
            Manage customer details and request history
          </p>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
        >
          {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
        </button>
      </header>

      <TaxesTable />
    </div>
  );
}

export default App;
