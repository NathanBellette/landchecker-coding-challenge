import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PropertyListings from "@/components/PropertyListings/PropertyListings";
import Watchlist from "@/pages/Watchlist";
import PropertyDetail from "@/pages/PropertyDetail";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Layout from "@/components/Layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <PropertyListings />
            </Layout>
          }
        />
        <Route
          path="/watchlist"
          element={
            <Layout>
              <Watchlist />
            </Layout>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <Layout>
              <PropertyDetail />
            </Layout>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
