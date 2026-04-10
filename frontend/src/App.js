import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Loader from "./components/Loader";

import { ThemeProvider } from "./components/ThemeContext";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./admin/Admin";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./admin/AdminDashboard";
import Users from "./admin/AdminUsers";
import AdminContacts from "./admin/AdminContacts";
import Airlines from "./admin/Airlines";
import Airports from "./admin/Airports";
import AdminFlights from "./admin/Flight";
import AdminBookings from "./admin/AdminBookings";
import Passengers from "./admin/Passengers";
import Payment from "./admin/Payment";

import Contact from "./components/ContactUs";
import FAQs from "./components/FAQs";
import About from "./components/About";
import Services from "./components/Services";
import UserRoute from "./components/UserRoute";

import HomePage from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import PrivacyPolicy from "./pages/Privacy";
import TermsOfService from "./pages/TermsOfService";
import SearchResults from "./pages/SearchResults";
import SeatSelection from "./pages/SeatSelection";
import PassengerDetails from "./pages/PassengerDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import CookiePolicy from "./pages/CookiePolicy";
import HelpCenter from "./pages/Helpcenter";

import UserLayout from "./user/UserLayout";
import UserDashboard from "./user/UserDashboard";
import UserBookings from "./user/UserBookings";
import UserPayments from "./user/UserPayments";
import UserProfile from "./user/Userprofile";
import UserSearch from "./user/UserSearch";
import CancellationRefund from "./user/Cancellationrefund";


export default function App() {
  return (
    <>

     <Loader/>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/termofservice" element={<TermsOfService />} />
          <Route path="/cookiepolicy" element={<CookiePolicy />} />
          <Route path="/helpcenter" element={<HelpCenter />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/*Protected — Login */}

          <Route
            path="/results"
            element={
              <UserRoute>
                <SearchResults />
              </UserRoute>
            }
          />
          <Route
            path="/seats"
            element={
              <UserRoute>
                <SeatSelection />
              </UserRoute>
            }
          />
          <Route
            path="/passengers"
            element={
              <UserRoute>
                <PassengerDetails />
              </UserRoute>
            }
          />
          <Route
            path="/confirmation"
            element={
              <UserRoute>
                <BookingConfirmation />
              </UserRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <ThemeProvider storageKey="admin-theme">
                  <Admin />
                </ThemeProvider>
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="airlines" element={<Airlines />} />
            <Route path="airports" element={<Airports />} />
            <Route path="flights" element={<AdminFlights />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="passengers" element={<Passengers />} />
            <Route path="payments" element={<Payment />} />
          </Route>

          {/* User */}
          <Route
            path="/user"
            element={
              <UserRoute>
                <ThemeProvider storageKey="user-theme">
                  <UserLayout />
                </ThemeProvider>
              </UserRoute>
            }
          >
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="bookings" element={<UserBookings />} />
            <Route path="payments" element={<UserPayments />} />
            <Route path="cancellation" element={<CancellationRefund />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="search" element={<UserSearch />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
