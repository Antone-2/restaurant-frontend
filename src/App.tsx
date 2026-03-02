import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "./components/ScrollToTop";
import Cart from "@/components/Cart";
import ChatWidget from "@/components/ChatWidget";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import AboutPage from "./pages/AboutPage";
import ReviewsPage from "./pages/ReviewsPage";
import ContactPage from "./pages/ContactPage";
import OrderPage from "./pages/OrderPage";
import EventsPage from "./pages/EventsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import NotFound from "./pages/NotFound";
import OrderHistory from "./pages/OrderHistory";
import UserProfile from "./pages/UserProfile";
import ReviewHistory from "./pages/ReviewHistory";
import ParkingReservation from "./components/ParkingReservation";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider, NotificationBell } from "@/components/NotificationSystem";

const queryClient = new QueryClient();

// Main app content (needs AuthProvider)
const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.email && ['admin@thequill.com', 'thequillrestaurant@gmail.com', 'pomraningrichard@gmail.com'].includes(user.email);
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register');
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div>
      {/* Show navigation only on non-auth and non-admin pages */}
      {!isAuthPage && !isAdminPage && (
        <>
          <Navbar />
          <NotificationBell />
          <Cart />
          <ChatWidget />
        </>
      )}

      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={
            isAuthenticated && isAdmin ? <Navigate to="/admin" /> : <AdminLoginPage />
          }
        />
        <Route
          path="/admin"
          element={
            isAuthenticated && isAdmin ?
              <AdminDashboard /> :
              <Navigate to="/admin/login" />
          }
        />

        <Route path="/" element={<Index />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/parking" element={<ParkingReservation />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/my-reviews" element={<ReviewHistory />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Show footer only on non-auth and non-admin pages */}
      {!isAuthPage && !isAdminPage && (
        <>
          <Footer />
          <WhatsAppButton />
        </>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <NotificationWrapper />
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Wrapper to access auth context for notification settings
const NotificationWrapper = () => {
  const { user } = useAuth();
  const adminEmails = ['admin@thequill.com', 'thequillrestaurant@gmail.com', 'pomraningrichard@gmail.com'];
  const isAdmin = !!(user?.email && adminEmails.includes(user.email));

  return (
    <NotificationProvider isAdmin={isAdmin}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </NotificationProvider>
  );
};

export default App;
