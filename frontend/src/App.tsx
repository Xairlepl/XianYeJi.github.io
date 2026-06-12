import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ScrollToTop from '@/components/common/ScrollToTop';
import Toast from '@/components/common/Toast/Toast';
import AIChat from '@/components/common/AIChat/AIChat';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import ProductList from './pages/ProductList/ProductList';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import Addresses from './pages/Addresses/Addresses';
import Favorites from './pages/Favorites/Favorites';
import Coupons from './pages/Coupons/Coupons';
import Notifications from './pages/Notifications/Notifications';
import Reviews from './pages/Reviews/Reviews';
import NotFound from './pages/NotFound/NotFound';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminApplications from './pages/Admin/AdminApplications';
import SellerLayout from './pages/Seller/SellerLayout';
import SellerDashboard from './pages/Seller/SellerDashboard';
import SellerProducts from './pages/Seller/SellerProducts';
import SellerOrders from './pages/Seller/SellerOrders';
import SellerService from './pages/Seller/SellerService';
import SellerApply from './pages/SellerApply/SellerApply';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/XianYeJi.github.io">
        <ScrollToTop />
        <Toast />
        <AIChat />
        <Routes>
          {/* Login page — no header/footer */}
          <Route path="/login" element={<Login />} />

          {/* Admin portal — standalone layout, role-guarded */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="applications" element={<AdminApplications />} />
          </Route>

          {/* Seller portal — standalone layout, role-guarded */}
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<SellerDashboard />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="service" element={<SellerService />} />
          </Route>

          {/* Main layout with header/footer */}
          <Route
            path="*"
            element={
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/addresses" element={<Addresses />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/coupons" element={<Coupons />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/seller-apply" element={<SellerApply />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
