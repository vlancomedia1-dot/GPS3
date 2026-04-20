'use client';

import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

const TrackerMap = dynamic(() => import('@/components/TrackerMap'), { ssr: false });

type TrackingPoint = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  trackedAt: string;
};

export default function HomePage() {
  const [isTracking, setIsTracking] = useState(false);
  const [points, setPoints] = useState<TrackingPoint[]>([]);
  const [status, setStatus] = useState('جاهز لبدء التتبع');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const latestPoint = points[points.length - 1];

  const stats = useMemo(
    () => [
      { label: 'حالة التتبع', value: isTracking ? 'يعمل الآن' : 'متوقف' },
      { label: 'عدد النقاط المحفوظة', value: String(points.length) },
      {
        label: 'آخر تحديث',
        value: latestPoint ? new Date(latestPoint.trackedAt).toLocaleTimeString('ar-SA') : '-'
      },
      {
        label: 'الدقة',
        value: latestPoint?.accuracy ? `${Math.round(latestPoint.accuracy)} متر` : '-'
      }
    ],
    [isTracking, latestPoint, points.length]
  );

  const savePoint = async (point: TrackingPoint) => {
    setIsSaving(true);
    setError('');

    const { error: insertError } = await supabase.from('agent_locations').insert({
      latitude: point.latitude,
      longitude: point.longitude,
      accuracy: point.accuracy,
      tracked_at: point.trackedAt
    });

    setIsSaving(false);

    if (insertError) {
      setError(`فشل حفظ الموقع في Supabase: ${insertError.message}`);
      return;
    }

    setPoints((current) => [...current, point]);
  };

  const startTracking = async () => {
    if (!navigator.geolocation) {
      setError('المتصفح الحالي لا يدعم خدمة الموقع.');
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    setStatus('جارٍ طلب إذن الموقع...');
    setError('');

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const nextPoint: TrackingPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? null,
          trackedAt: new Date().toISOString()
        };

        setStatus('جارٍ تتبع الموقع وحفظ النقاط...');
        setIsTracking(true);
        await savePoint(nextPoint);
      },
      (geoError) => {
        setError(`تعذر الوصول إلى الموقع: ${geoError.message}`);
        setStatus('فشل بدء التتبع');
        setIsTracking(false);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracking(false);
    setStatus('تم إيقاف التتبع');
  };

  return (
    <main className="page">
      <div className="container">
        <section className="card hero">
          <h1>تتبع المناديب</h1>
          <p>
            اضغط على بدء التتبع لمشاركة موقع المندوب وحفظ المسار كاملًا داخل Supabase.
            تأكد من السماح بإذن الموقع من المتصفح.
          </p>

          <div className="actions">
            <button className="button button-primary" onClick={startTracking} disabled={isTracking || isSaving}>
              ابدأ التتبع
            </button>
            <button className="button button-danger" onClick={stopTracking} disabled={!isTracking}>
              إيقاف التتبع
            </button>
          </div>
        </section>

        <section className="card">
          <div className="statusRow">
            {stats.map((item) => (
              <div className="stat" key={item.label}>
                <div className="statLabel">{item.label}</div>
                <div className="statValue">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className={`notice ${error ? 'error' : ''}`}>{error || status}</div>
        </section>

        <section className="card">
          <h2>الخريطة</h2>
          <p className="muted">سيظهر المسار كاملًا بعد وصول أول نقطة من جهاز المندوب.</p>
          <TrackerMap points={points} />
        </section>

        <section className="card">
          <h2>سجل آخر النقاط</h2>
          <div className="historyList">
            {points.length === 0 ? (
              <div className="muted">لا توجد نقاط بعد. ابدأ التتبع أولًا.</div>
            ) : (
              [...points].reverse().slice(0, 10).map((point, index) => (
                <div className="historyItem" key={`${point.trackedAt}-${index}`}>
                  <div>
                    <strong>خط العرض:</strong> {point.latitude}
                  </div>
                  <div>
                    <strong>خط الطول:</strong> {point.longitude}
                  </div>
                  <div>
                    <strong>الوقت:</strong> {new Date(point.trackedAt).toLocaleString('ar-SA')}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
