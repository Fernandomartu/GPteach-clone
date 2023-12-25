import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import LandingPage from "./scenes/LandingPage/LandingPage";
import HomePage from "./scenes/HomePage/HomePage";
import Billing from "./scenes/Billing/Billing";
import { useSelector } from "react-redux";

function App() {
  const isAuth = Boolean(useSelector((state: any) => state.token));
  console.log(isAuth);
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route
            path="/billing"
            element={isAuth ? <Billing /> : <LandingPage />}
          />
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/home"
            element={isAuth ? <HomePage /> : <Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
