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
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Toast />
        <AIChat />
        <Routes>
          {/* Login page — no header/footer */}
          <Route path="/login" element={<Login />} />

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
