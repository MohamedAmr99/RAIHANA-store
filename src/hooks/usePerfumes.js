import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { perfumesData as localPerfumes } from '../data/perfumes';

export const usePerfumes = () => {
  const [perfumesData, setPerfumesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const perfumesRef = collection(db, 'perfumes');
    
    // Safety fallback: if Firebase hangs (not configured properly), use local data after 3s
    let timeoutId = setTimeout(() => {
      setPerfumesData(localPerfumes);
      setLoading(false);
      console.warn("Firebase took too long, falling back to local data.");
    }, 3000);

    const unsubscribe = onSnapshot(perfumesRef, (snapshot) => {
      clearTimeout(timeoutId);

      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by the 'order' field created via the Admin panel drag-and-drop
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // If the database is completely empty (user hasn't synced yet), use local data seamlessly
      if (data.length === 0) {
        setPerfumesData(localPerfumes);
      } else {
        setPerfumesData(data);
      }
      setLoading(false);
    }, (err) => {
      clearTimeout(timeoutId);
      console.error("Firestore Fetch Error: ", err);
      setError(err);
      setPerfumesData(localPerfumes); // Fallback on error
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return { perfumesData, loading, error };
};
