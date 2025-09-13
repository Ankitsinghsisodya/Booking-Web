import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import FacebookCallback from './Auth/FacebookCallback';
import { FeatureRoute } from './Auth/FeatureRoute';
import LinkedInCallback from './Auth/LinkedinCallBack';
import { AdminRoute, InstructorRoute } from './Auth/ProtectedRoute';
import ChatWidget from './components/ChatWidget';
import { Loader } from './components/Loader';
import { useLanguageInitializer } from './hooks/useLanguageInitializer';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import AdminLayout from './Pages/Admin/Layout';
import AdventureFormPage from './Pages/Admin/SubPages/AdventureForm';
import AdventuresPage from './Pages/Admin/SubPages/Adventures';
import Dash_Bookings from './Pages/Admin/SubPages/Bookings';
import Dash_Declation from './Pages/Admin/SubPages/Declaration';
import Dash_Hotels from './Pages/Admin/SubPages/Hotels';
import LocationsPage from './Pages/Admin/SubPages/Location';
import Dash_Store from './Pages/Admin/SubPages/Store';
import Dash_Terms from './Pages/Admin/SubPages/Terms';
import Dash_Tickets from './Pages/Admin/SubPages/Tickets';
import Dash_User from './Pages/Admin/SubPages/Users';
import { AuthProvider } from './Pages/AuthProvider';
import Booking from './Pages/BookingSteps/Booking';
import ConfirmationPage from './Pages/ConfirmationPage/Confirmation';
import EventDetailPage from './Pages/EventDetailPage';
import InstructorDashboard from './Pages/Instructor/InstructorDashboard';
import SessionForm from './Pages/Instructor/SessionForm';
import { ResetPass } from './Pages/ResetPass';
import AchievementTestComponent from './Pages/Testing/AchievementTestComponent';
import UserBookingsPage from './Pages/User/UserBookingsPage';
import UserDashboardPage from './Pages/User/UserDashboardPage';
import UserFriendsPage from './Pages/User/UserFriendsPage';
import UserProfilePage from './Pages/User/UserProfilePage';
import UserSettingsPage from './Pages/User/UserSettingsPage';
import UserTicketsPage from './Pages/User/UserTicketsPage';

// Lazy loaded components
const LoginPage = lazy(() => import('./Pages/LoginPage'));
const LandingPage = lazy(() => import('./Pages/LandingPage'));
const BrowsingPage = lazy(() => import('./Pages/Browsing/BrowsingPage'));
const Shop = lazy(() => import('./Pages/Shop/Shop'));
const Hotel = lazy(() => import('./Pages/Hotel/Hotel'));
const HotelCheckout = lazy(() => import('./Pages/Hotel/HotelCheckout'));
const HotelBookingSuccess = lazy(
  () => import('./Pages/Hotel/HotelBookingSuccess')
);
const LoginOptionsPage = lazy(() => import('./Pages/LoginOptionPage'));
const Terms = lazy(() => import('./Pages/Terms'));
const PaymentPage = lazy(() => import('./Pages/Payment/PaymentPage'));
const PaymentApprove = lazy(() => import('./Pages/Payment/PaymentApprove'));
const PaymentCancel = lazy(() => import('./Pages/Payment/PaymentCancel'));
const Payout = lazy(() => import('./Pages/Payment/Payout'));
const PayPalSuccess = lazy(() => import('./Pages/Payment/PayPalSuccess'));
const PayPalError = lazy(() => import('./Pages/Payment/PayPalError'));
const EventBookingConfirmation = lazy(
  () => import('./Pages/Payment/EventBookingConfirmation')
);
const SecretNftEvents = lazy(() => import('./Pages/SecretNftEvents'));

// i18n
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { updateLanguageHeaders } from './Api/language.api.js';
import { WebsiteSettingsProvider } from './contexts/WebsiteSettingsContext';
import deTranslation from './Locales/de.json';
import enTranslation from './Locales/en.json';
import esTranslation from './Locales/es.json';
import frTranslation from './Locales/fr.json';
import itTranslation from './Locales/it.json';
import EventsPage from './Pages/Admin/SubPages/Events';
import InstructorsPage from './Pages/Admin/SubPages/InstructorsVerification';
import Managers from './Pages/Admin/SubPages/Managers';
import WebsiteSettings from './Pages/Admin/SubPages/WebsiteSettings';
import { CartProvider } from './Pages/Cart/CartContext';
import { ChatLayout } from './Pages/Chat/ChatLayout';
import HotelPendingReview from './Pages/Hotel/HotelPending';
import { HotelProfile } from './Pages/Hotel/HotelProfile';
import { HotelRegister } from './Pages/Hotel/HotelRegister';
import { InstructorBookings } from './Pages/Instructor/Instructor.bookings';
import InstructorLayout from './Pages/Instructor/InstructorLayout';
import { InstructorRegister } from './Pages/Instructor/InstructorLogin';
import InstructorPendingReview from './Pages/Instructor/InstructorPendingReview';
import { InstructorProfile } from './Pages/Instructor/InstructorProfile';
import { InstructorSession } from './Pages/Instructor/InstructorSession';
import InstructorSettings from './Pages/Instructor/InstructorSettings';
import InstructorTickets from './Pages/Instructor/InstructorTickets';
import { Cart } from './Pages/Shop/Cart';
import CartSuccess from './Pages/Shop/CartSuccess';
import { ItemPage } from './Pages/Shop/ItemPage';

// Initialize i18n with stored language
const getInitialLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || 'en';
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return 'en';
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    fr: { translation: frTranslation },
    de: { translation: deTranslation },
    es: { translation: esTranslation },
    it: { translation: itTranslation },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Initialize language headers
updateLanguageHeaders(getInitialLanguage());

// Language Initializer Component
const LanguageInitializer = () => {
  useLanguageInitializer();
  return null;
};

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <WebsiteSettingsProvider>
          <CartProvider>
            <LanguageInitializer />
            <BrowserRouter>
              <ChatWidget />
              <Suspense fallback={<Loader />}>
                <Toaster />
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/login-options" element={<LoginOptionsPage />} />
                  <Route
                    path="/auth/signInWithLinkedin"
                    element={<LinkedInCallback />}
                  />
                  <Route
                    path="/auth/signInWithFacebook"
                    element={<FacebookCallback />}
                  />
                  <Route path="/" element={<LandingPage />} />
                  <Route
                    path="/secret-nft-events"
                    element={<SecretNftEvents />}
                  />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/browse" element={<BrowsingPage />} />
                  <Route path="/event/:id" element={<EventDetailPage />} />
                  <Route path="/booking" element={<Booking />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/payment/approve" element={<PaymentApprove />} />
                  <Route path="/payment/cancel" element={<PaymentCancel />} />
                  <Route path="/instructor/payout" element={<Payout />} />
                  <Route path="/paypal/success" element={<PayPalSuccess />} />
                  <Route path="/paypal/error" element={<PayPalError />} />
                  <Route
                    path="/event-booking-confirmation"
                    element={<EventBookingConfirmation />}
                  />
                  <Route path="/confirmation" element={<ConfirmationPage />} />
                  <Route path="/chat" element={<ChatLayout />} />
                  <Route
                    path="/test/achievements"
                    element={<AchievementTestComponent />}
                  />
                  <Route
                    path="/shop"
                    element={
                      <FeatureRoute feature="shop">
                        <Shop />
                      </FeatureRoute>
                    }
                  />
                  <Route
                    path="/book-hotel"
                    element={
                      <FeatureRoute feature="hotels">
                        <Hotel />
                      </FeatureRoute>
                    }
                  />{' '}
                  <Route
                    path="/cart"
                    element={
                      <FeatureRoute feature="shop">
                        <Cart />
                      </FeatureRoute>
                    }
                  />
                  <Route
                    path="/cart/success"
                    element={
                      <FeatureRoute feature="shop">
                        <CartSuccess />
                      </FeatureRoute>
                    }
                  />
                  <Route
                    path="/product/:productId"
                    element={
                      <FeatureRoute feature="shop">
                        <ItemPage />
                      </FeatureRoute>
                    }
                  />
                  <Route path="/reset" element={<ResetPass />} />
                  <Route
                    path="/instructor/register"
                    element={<InstructorRegister />}
                  />
                  <Route
                    path="/instructor/pending-review"
                    element={<InstructorPendingReview />}
                  />
                  <Route path="/dashboard" element={<UserDashboardPage />} />
                  <Route
                    path="/dashboard/bookings"
                    element={<UserBookingsPage />}
                  />
                  <Route
                    path="/dashboard/friends"
                    element={<UserFriendsPage />}
                  />
                  <Route
                    path="/dashboard/tickets"
                    element={<UserTicketsPage />}
                  />
                  <Route
                    path="/dashboard/profile"
                    element={<UserProfilePage />}
                  />
                  <Route
                    path="/dashboard/settings"
                    element={<UserSettingsPage />}
                  />
                  <Route
                    path="/hotel"
                    element={
                      <FeatureRoute feature="hotels">
                        <HotelProfile />
                      </FeatureRoute>
                    }
                  />
                  <Route
                    path="/hotel/register"
                    element={
                      <FeatureRoute feature="hotels">
                        <HotelRegister />
                      </FeatureRoute>
                    }
                  />{' '}
                  <Route
                    path="/hotel/pending"
                    element={
                      <FeatureRoute feature="hotels">
                        <HotelPendingReview />
                      </FeatureRoute>
                    }
                  />{' '}
                  <Route
                    path="/hotel/checkout"
                    element={
                      <FeatureRoute feature="hotels">
                        <HotelCheckout />
                      </FeatureRoute>
                    }
                  />
                  <Route
                    path="/hotel/booking-success"
                    element={
                      <FeatureRoute feature="hotels">
                        <HotelBookingSuccess />
                      </FeatureRoute>
                    }
                  />
                  <Route
                    path="/instructor/"
                    element={
                      <InstructorRoute>
                        <InstructorLayout />
                      </InstructorRoute>
                    }
                  />
                  <Route
                    path="/instructor/dashboard"
                    element={
                      <InstructorRoute>
                        <InstructorDashboard />
                      </InstructorRoute>
                    }
                  />
                  <Route
                    path="/instructor/bookings"
                    element={
                      <InstructorRoute>
                        <InstructorBookings />
                      </InstructorRoute>
                    }
                  />
                  <Route
                    path="/instructor/sessions"
                    element={
                      <InstructorRoute>
                        <InstructorSession />
                      </InstructorRoute>
                    }
                  />
                  <Route
                    path="/instructor/sessions/new"
                    element={
                      <InstructorRoute>
                        <SessionForm />
                      </InstructorRoute>
                    }
                  />
                  <Route
                    path="/instructor/profile"
                    element={
                      <InstructorRoute>
                        <InstructorProfile />
                      </InstructorRoute>
                    }
                  />
                  <Route
                    path="/instructor/support"
                    element={
                      <InstructorRoute>
                        <InstructorTickets />
                      </InstructorRoute>
                    }
                  />
                  <Route
                    path="/instructor/settings"
                    element={
                      <InstructorRoute>
                        <InstructorSettings />
                      </InstructorRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route
                      index
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/adventures"
                      element={<AdventuresPage />}
                    />
                    <Route
                      path="/admin/adventures/new"
                      element={<AdventureFormPage />}
                    />
                    <Route
                      path="/admin/adventures/edit/:id"
                      element={<AdventureFormPage />}
                    />
                    <Route path="/admin/bookings" element={<Dash_Bookings />} />
                    <Route path="/admin/users" element={<Dash_User />} />
                    <Route
                      path="/admin/instructors"
                      element={<InstructorsPage />}
                    />
                    <Route path="/admin/store" element={<Dash_Store />} />
                    <Route path="/admin/hotels" element={<Dash_Hotels />} />
                    <Route path="/admin/tickets" element={<Dash_Tickets />} />
                    <Route path="/admin/terms" element={<Dash_Terms />} />
                    <Route
                      path="/admin/declaration"
                      element={<Dash_Declation />}
                    />
                    <Route
                      path="/admin/locations"
                      element={<LocationsPage />}
                    />
                    <Route path="/admin/manager" element={<Managers />} />
                    <Route path="/admin/events" element={<EventsPage />} />
                    <Route
                      path="/admin/website-settings"
                      element={<WebsiteSettings />}
                    />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </WebsiteSettingsProvider>
      </AuthProvider>
    </I18nextProvider>
  );
};

export default App;
