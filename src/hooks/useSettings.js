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
  categories: [
    { id: 'men', nameAr: 'رجالي', nameEn: 'Men' },
    { id: 'women', nameAr: 'نسائي', nameEn: 'Women' },
    { id: 'unisex', nameAr: 'للجنسين', nameEn: 'Unisex' },
    { id: 'incense', nameAr: 'بخور', nameEn: 'Incense' },
    { id: 'diffusers', nameAr: 'فواحات', nameEn: 'Diffusers' },
  ],
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
    await setDoc(ref, newSettings, { merge: true });
  };

  return { settings, loading, saveSettings };
};
