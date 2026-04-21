// src/components/common/SecureImage.jsx
import { useEffect, useState } from 'react';

const BASE_URL = 'https://www.minboo-be.io.vn';

export default function SecureImage({ src, alt, className }) {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const fullUrl = src.startsWith('http')
      ? src
      : `${BASE_URL}/${src.startsWith('/') ? src.slice(1) : src}`;

    const token = localStorage.getItem('access_token');

    fetch(fullUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        setImageUrl(URL.createObjectURL(blob));
        setError(false);
      })
      .catch((err) => {
        console.error('Không thể tải ảnh:', fullUrl, err);
        setError(true);
        setImageUrl(''); // Xóa blob URL cũ nếu có
      });

    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [src]);

  if (error) {
    // Hiển thị placeholder hoặc icon báo lỗi
    return (
      <div
        className={`${className} bg-gray-200 flex items-center justify-center text-gray-400`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
          <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" />
          <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  if (!imageUrl) return null;

  return <img src={imageUrl} alt={alt} className={className} />;
}
