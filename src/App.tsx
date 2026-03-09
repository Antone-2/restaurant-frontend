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
import AccommodationPage from "./pages/AccommodationPage";
import AboutPage from "./pages/AboutPage";
import ReviewsPage from "./pages/ReviewsPage";
import ContactPage from "./pages/ContactPage";
import OrderPage from "./pages/OrderPage";
import EventsPage from "./pages/EventsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import NotFound from "./pages/NotFound";
import OrderHistory from "./pages/OrderHistory";
import UserProfile from "./pages/UserProfile";
import ReviewHistory from "./pages/ReviewHistory";
import LocalPartnerships from "./pages/LocalPartnerships";
import MyReservations from "./pages/MyReservations";
import ParkingReservation from "./components/ParkingReservation";
import FAQPage from "./pages/FAQPage";
import CancellationPolicyPage from "./pages/CancellationPolicyPage";
import DeliveryInformationPage from "./pages/DeliveryInformationPage";
import TakeawayInfoPage from "./pages/TakeawayInfoPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import AllergenDisclaimerPage from "./pages/AllergenDisclaimerPage";
import ReservationPage from "./pages/ReservationPage";
import ReservationConfirmationPage from "./pages/ReservationConfirmationPage";
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
      {/* */}
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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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
        <Route path="/accommodation" element={<AccommodationPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/partnerships" element={<LocalPartnerships />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route path="/parking" element={<ParkingReservation />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/my-reviews" element={<ReviewHistory />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
        <Route path="/delivery-information" element={<DeliveryInformationPage />} />
        <Route path="/takeaway-info" element={<TakeawayInfoPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/allergen-disclaimer" element={<AllergenDisclaimerPage />} />
        <Route path="/reservations" element={<ReservationPage />} />
        <Route path="/reservation-confirmation" element={<ReservationConfirmationPage />} />
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

// Wrapper to access auth context for notification settings
// This component must be inside AuthProvider
const NotificationWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const adminEmails = ['admin@thequill.com', 'thequillrestaurant@gmail.com', 'pomraningrichard@gmail.com'];
  const isAdmin = !!(user?.email && adminEmails.includes(user.email));

  return (
    <NotificationProvider isAdmin={isAdmin}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </NotificationProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationWrapper>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </NotificationWrapper>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
