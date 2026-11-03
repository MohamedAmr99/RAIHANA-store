import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_SETTINGS = {
  whatsappNumber: '201112522926',
  storeName: 'RAIHANA',
  email: 'info@rehanaperfumes.com',
  address: 'شارع عبد الرحمن نصر الزيتون , القاهرة , مصر',
  instagramUrl: '#',
  whatsappTemplate: 'مرحباً ريحانة، أود الاستفسار عن عطر: {product} حجم {size}',
  facebookPixelId: '26387857114203242',
  // Shipping
  shippingFee: 0,
  shippingRates: {},
  freeShippingEnabled: false,   // تفعيل/تعطيل التوصيل المجاني
  freeShippingThreshold: 0,     // الحد الأدنى للطلب للحصول على توصيل مجاني (0 = للجميع)
  categories: [
    { id: 'men', nameAr: 'رجالي', nameEn: 'Men' },
    { id: 'women', nameAr: 'نسائي', nameEn: 'Women' },
    { id: 'unisex', nameAr: 'للجنسين', nameEn: 'Unisex' },
    { id: 'incense', nameAr: 'بخور', nameEn: 'Incense' },
    { id: 'diffusers', nameAr: 'فواحات', nameEn: 'Diffusers' },
  ],
};

// Helper function to safely strip undefined values so Firestore never rejects the write
const sanitizeFirestoreData = (data) => {
  if (Array.isArray(data)) {
    return data.map(sanitizeFirestoreData);
  }
  if (data !== null && typeof data === 'object') {
    const clean = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = sanitizeFirestoreData(value);
      }
    }
    return clean;
  }
  return data;
};

export const useSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'settings', 'store');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      setLoading(false);
    }, () => {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
    });
    return unsub;
  }, []);

  const saveSettings = async (newSettings) => {
    const ref = doc(db, 'settings', 'store');
    const cleaned = sanitizeFirestoreData(newSettings);
    await setDoc(ref, cleaned, { merge: true });
  };

  return { settings, loading, saveSettings };
};
