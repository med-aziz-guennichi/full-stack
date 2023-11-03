import { Route, Routes } from "react-router-dom";
import PageLayout from "./Layouts/PageLayout/PageLayout";
import AuthPage from "./pages/AuthPage/AuthPage.tsx";
import HomePage from "./pages/HomePage/HomePage.tsx";

function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </PageLayout>
  );
}

export default App;
