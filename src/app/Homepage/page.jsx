'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import AlertBox from '../components/alertsbox';
import DisasterInfo from '../components/disasterinfo';
import { disasterRecommendations } from '../components/Data/disasterData';

// Dynamic Import สำหรับ MapUser
const UserMapComponent = dynamic(() => import('../components/mapuser'), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
}); 

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [alerts, setAlerts] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertQueue, setAlertQueue] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [hasFetchedLocation, setHasFetchedLocation] = useState(false);
  const [dismissed, setDismissed] = useState(false); 

  const [handbookQueue, setHandbookQueue] = useState([]);
  const [currentHandbook, setCurrentHandbook] = useState(null);
  const [handbookDismissed, setHandbookDismissed] = useState(false); // track if user closed handbook

  // -------------------------
  // ฟังก์ชัน subscribe push notification
  const subscribeUser = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;

      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        console.log('Old subscription removed');
      }

      const publicKeyRes = await fetch('/api/push/public-key');
      const { publicKey } = await publicKeyRes.json();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      console.log('User subscribed to push notifications');
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
  };
  // -------------------------

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('SW registered for push', reg))
        .catch(err => console.error('SW registration failed', err));
    }
  
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('User allowed notifications');
          subscribeUser();
        }
      });
    }
  }, []);

  // ฟังก์ชัน dismiss alert
  const handleDismissAlert = () => {
    if (!currentAlert || !session?.user?.id) return;

    setTimeout(() => {
      const nextQueue = alertQueue.filter(a => a._id !== currentAlert._id);
      const dismissedAlert = currentAlert;

      const nextAlert = nextQueue[0] || null;

      setCurrentAlert(nextQueue[0] || null);
      setAlertQueue(nextQueue.slice(1));
      setDismissed(false);

      if (handbookDismissed && nextAlert && ["น้ำท่วม","แผ่นดินไหว","ไฟป่า","พายุ","ดินถล่ม","คลื่นสึนามิ","อื่นๆ"].includes(nextAlert.type)) {
        setCurrentHandbook({
          type: nextAlert.type
        });
        setHandbookDismissed(false); // รีเซ็ตให้โชว์คู่มือใหม่
      }

      fetch(`/api/alerts/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: dismissedAlert._id, userId: session.user.id })
      }).catch(err => console.error("Dismiss alert error:", err));
    }, 200); 
  };

  // ปิด handbook
  const handleCloseHandbook = () => {
    setHandbookDismissed(true); // user กดปิด

    if (currentAlert && ["แผ่นดินไหว","คลื่นสึนามิ","น้ำท่วม","ไฟป่า","ดินถล่ม","พายุ","อื่นๆ"].includes(currentAlert.type)) {
      setCurrentHandbook(currentAlert); // โชว์คู่มือของ alert ปัจจุบัน
      setHandbookDismissed(false); // รีเซ็ต flag เพื่อให้โชว์คู่มือใหม่
    } else if (alertQueue.length > 0) {
      const nextAlert = alertQueue[0];
      if (["แผ่นดินไหว","คลื่นสึนามิ","น้ำท่วม","ไฟป่า","ดินถล่ม","พายุ","อื่นๆ"].includes(nextAlert.type)) {
        setCurrentHandbook(nextAlert);
        setHandbookDismissed(false);
      } else {
        setCurrentHandbook(null);
      }
    } else {
      setCurrentHandbook(null);
    }
  };

  // ฟังก์ชัน fetch alerts
  const fetchAlerts = async (latitude, longitude) => {
    if (!session?.user?.id) return;
  
    try {
      const res = await fetch(`/api/alerts?lat=${latitude}&lng=${longitude}&userId=${session.user.id}`);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();

      const nearby = data.nearbyAlerts || [];
      const now = new Date();

      const validAlerts = nearby.filter(a => (!a.dismissedByUser) && (!a.expireAt || new Date(a.expireAt) > now));
      setAlerts(validAlerts);
      setCurrentAlert(validAlerts[0] || null);
      setAlertQueue(validAlerts.slice(1));

      const activeMarkers = nearby.filter(a => !a.expireAt || new Date(a.expireAt) > now)
        .map(alert => ({
          id: alert._id,
          position: { lat: alert.location.lat, lng: alert.location.lng },
          type: alert.type,
          message: alert.message,
          radius: alert.radius,
          createdAt: alert.createdAt,
          expireAt: alert.expireAt
        }));
      setMarkers(activeMarkers);

      // ตั้งคู่มือ
      const disasterAlerts = validAlerts.filter(a => ["แผ่นดินไหว", "คลื่นสึนามิ", "น้ำท่วม",  "ไฟป่า",  "ดินถล่ม","พายุ", "อื่นๆ"].includes(a.type));
      setHandbookQueue(disasterAlerts);
      
      setCurrentHandbook(prev => {
        if (handbookDismissed) return prev;      // user ปิดแล้ว
        if (prev) return prev;                    // มีอยู่แล้ว ไม่แก้
        return disasterAlerts[0] || null;
      });   

    } catch (error) {
      console.error("Fetch alerts error:", error);
      setAlerts([]); setCurrentAlert(null); setAlertQueue([]);
      setMarkers([]); setHandbookQueue([]); 
      // if (!handbookDismissed) setCurrentHandbook(null);
    }
  };

  // Geolocation
  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/"); return; }
    if (!navigator.geolocation) { setHasFetchedLocation(true); return; }

    let debounceTimeout;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setHasFetchedLocation(true);
          fetchAlerts(latitude, longitude);

          if (session?.user?.id) {
            fetch("/api/update-location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: session.user.id, lat: latitude, lng: longitude })
            }).catch(err => console.error("Failed to update location:", err));
          }
        }, 2000);
      },
      (err) => { console.error("Geolocation error:", err); setHasFetchedLocation(true); }
    );

    return () => { clearTimeout(debounceTimeout); navigator.geolocation.clearWatch(watchId); };
  }, [status, session]);

  // refresh alerts ทุก 1 วินาที
  useEffect(() => {
    if (!userLocation || !session?.user?.id) return;
    const interval = setInterval(() => { fetchAlerts(userLocation.lat, userLocation.lng); }, 1000);
    return () => clearInterval(interval);
  }, [userLocation, session]);

  if (status === 'loading') return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="text-lg sm:text-xl font-semibold text-white p-6 sm:p-8 bg-red-700 rounded-lg shadow-lg">
        กำลังโหลดข้อมูล...
      </div>
    </div>
  );
  if (!session) return null;

  return (
    <div className="flex flex-col min-h-screen relative bg-gradient-to-b from-black via-gray-900 to-red-900">
      <div className="flex flex-col md:flex-row flex-1 ">
        {/* Map */}
        <div className="w-full md:w-1/2 p-2 sm:p-4 md:p-6 border-b md:border-b-0 md:border-r border-red-700 flex-shrink-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 text-gray-100">
            แผนที่แจ้งเตือนสำหรับคุณ {session?.user.name}
          </h2>
          <div className="w-full h-64 sm:h-80 md:h-[500px] bg-gray-800 rounded-lg relative overflow-hidden z-0">
            {hasFetchedLocation && (
              <div className="absolute inset-0">
                <UserMapComponent markers={markers} userLocation={userLocation} />
              </div>
            )}
          </div>    
        </div>

        {/* คู่มือ */}
        <div className="w-full md:w-1/2 p-2 sm:p-4 md:p-6 overflow-y-auto mt-4 md:mt-0 flex-1 relative z-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 text-gray-100">
            คู่มือการรับมือสถานการณ์
          </h2>
          {!handbookDismissed && currentHandbook ? (
            <DisasterInfo
              title={disasterRecommendations[currentHandbook.type]?.title}
              steps={disasterRecommendations[currentHandbook.type]?.steps}
              onclose={handleCloseHandbook} // กดปิดครั้งเดียว
            />
          ) : (
            <p className="text-sm sm:text-base md:text-lg text-gray-100">
              ไม่มีการแจ้งเตือนภัยพิบัติในพื้นที่
            </p>
          )}
        </div>
      </div>

      {/* Alert Box */}
      {currentAlert && (
        <>
          <div className="absolute top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-[90%] md:max-w-xl alert-fade-container">
            <AlertBox alert={currentAlert} onDismiss={handleDismissAlert} dismissed={dismissed} />
          </div>

          {alertQueue.length > 0 && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md">
              มี {alertQueue.length} แจ้งเตือนรออ่าน
            </div>
          )}
        </>
      )}
    </div>
  );
}
