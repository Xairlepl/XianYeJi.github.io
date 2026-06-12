import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, MapPinOff, Phone, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { mockApi } from '@/services/mockApi';
import type { Address } from '@/types';
import './Addresses.css';

const Addresses = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const showToast = useToastStore((state) => state.show);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    const data = await mockApi.getProfileData();
    setAddresses(data.addresses);
    setLoading(false);
  };

  const handleSetDefault = async (id: number) => {
    await mockApi.setDefaultAddress(id);
    await loadData();
    showToast('已设为默认地址', 'success');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除此地址？')) return;
    await mockApi.deleteAddress(id);
    await loadData();
    showToast('地址已删除', 'success');
  };

  if (loading) {
    return (
      <main className="addresses-page container section">
        <div className="page-loading">
          <span className="loading-spinner" />
          <span>加载中...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="addresses-page container section">
      <h1 className="page-title">
        <MapPin size={26} />
        收货地址
      </h1>

      {addresses.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <MapPinOff size={40} />
          </span>
          <p>暂无收货地址</p>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map((addr) => (
            <div key={addr.id} className={`address-card card ${addr.isDefault ? 'default' : ''}`}>
              <div className="address-info">
                <div className="address-receiver">
                  {addr.receiver}
                  {addr.isDefault && <span className="address-badge">默认</span>}
                </div>
                <div className="address-phone">
                  <Phone size={13} />
                  {addr.phone}
                </div>
                <div className="address-detail">
                  <MapPin size={13} />
                  {addr.province} {addr.city} {addr.district} {addr.detail}
                </div>
              </div>
              <div className="address-actions">
                {!addr.isDefault && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleSetDefault(addr.id)}>
                    <CheckCircle2 size={14} />
                    设为默认
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(addr.id)}>
                  <Trash2 size={14} />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Addresses;
