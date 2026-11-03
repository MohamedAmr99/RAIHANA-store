import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import FacebookPixel from "./components/FacebookPixel";
import ScrollToTop from "./components/ScrollToTop";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";

// Lazy loading for pages
const Home = lazy(() => import("./pages/Home"));
const Perfumes = lazy(() => import("./pages/Perfumes"));
const MenPerfumes = lazy(() => import("./pages/MenPerfumes"));
const WomenPerfumes = lazy(() => import("./pages/WomenPerfumes"));
const UnisexPerfumes = lazy(() => import("./pages/UnisexPerfumes"));
const Incense = lazy(() => import("./pages/Incense"));
const Diffusers = lazy(() => import("./pages/Diffusers"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));

// Loading Component
const PageLoader = () => (
  <div className="min-h-[80vh] flex items-center justify-center bg-white">
    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/perfumes" element={<Perfumes />} />
          <Route path="/perfumes/men" element={<MenPerfumes />} />
          <Route path="/perfumes/women" element={<WomenPerfumes />} />
          <Route path="/perfumes/unisex" element={<UnisexPerfumes />} />
          <Route path="/incense" element={<Incense />} />
          <Route path="/diffusers" element={<Diffusers />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <FacebookPixel />
        <div className="font-sans antialiased text-dark min-h-screen flex flex-col selection:bg-gold selection:text-white">
          <Navbar />
          <AnimatedRoutes />
          <Footer />
          <CartDrawer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
