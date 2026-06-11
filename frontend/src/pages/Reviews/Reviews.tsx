import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { mockProducts } from '@/data/mockData';
import { setProductImageFallback } from '@/utils/imageFallback';
import './Reviews.css';

interface Review {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  rating: number;
  content: string;
  createdAt: string;
}

const Reviews = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [reviews] = useState<Review[]>([
    {
      id: 1,
      productId: 1,
      productName: '烟台红富士苹果 5斤装',
      productImage: mockProducts[0]?.coverImage || '',
      rating: 5,
      content: '苹果很新鲜，口感脆甜，包装完好，物流很快！',
      createdAt: '2026-05-20',
    },
    {
      id: 2,
      productId: 4,
      productName: '五常稻花香大米 5kg',
      productImage: mockProducts[3]?.coverImage || '',
      rating: 5,
      content: '米粒饱满，煮出来很香，颗粒分明，值得回购。',
      createdAt: '2026-05-15',
    },
    {
      id: 3,
      productId: 8,
      productName: '西湖龙井茶叶 250g',
      productImage: mockProducts[7]?.coverImage || '',
      rating: 4,
      content: '茶香浓郁，回甘明显，性价比不错。',
      createdAt: '2026-05-10',
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <main className="reviews-page container section">
      <h1 className="page-title">⭐ 我的评价</h1>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">✍️</span>
          <p>暂无评价</p>
          <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            去订单中心
          </Link>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card card">
              <Link to={`/product/${review.productId}`} className="review-product">
                <img
                  src={review.productImage}
                  alt={review.productName}
                  onError={(e) => setProductImageFallback(e, review.productName)}
                />
                <span>{review.productName}</span>
              </Link>
              <div className="review-content">
                <div className="review-header">
                  <div className="review-rating">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  <span className="review-date">{review.createdAt}</span>
                </div>
                <p className="review-text">{review.content}</p>
                <div className="review-author">
                  {user?.username || '匿名用户'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Reviews;
