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

  const handleDismissAlert = () => {
    if (!currentAlert || !session?.user?.id) return;

    setTimeout(() => {
      const nextQueue = alertQueue.filter(a => a._id !== currentAlert._id);
      const dismissedAlert = currentAlert;

      
      setCurrentAlert(nextQueue[0] || null);
      setAlertQueue(nextQueue.slice(1));
      setDismissed(false);

      // Fire-and-forget fetch ไป backend
      fetch(`/api/alerts/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId: dismissedAlert._id,
          userId: session.user.id
        })
      }).catch(err => console.error("Dismiss alert error:", err));
    }, 300); 
  };

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

      const disasterAlerts = nearby.filter(a => ["น้ำท่วม", "แผ่นดินไหว", "ไฟป่า", "พายุ", "ภูเขาไฟระเบิด", "อื่นๆ"].includes(a.type));
      setHandbookQueue(disasterAlerts);
      setCurrentHandbook(disasterAlerts[0] || null);
  } catch (error) {
    console.error("Fetch alerts error:", error);
    setAlerts([]); setCurrentAlert(null); setAlertQueue([]);
    setMarkers([]); setHandbookQueue([]); setCurrentHandbook(null);
  }
};  
const handleCloseHandbook = () => {
  if (!currentHandbook) return;

   // ลบ marker ของคู่มือปัจจุบัน
  setMarkers(prev => prev.filter(m => m.id !== currentHandbook._id));

  // แสดงคู่มือต่อไปใน queue
  const currentIndex = handbookQueue.findIndex(h => h._id === currentHandbook._id);
  const nextHandbook = handbookQueue[currentIndex + 1] || null;
  setCurrentHandbook(nextHandbook);
};

  // ใช้ geolocation พร้อม debounce
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      setHasFetchedLocation(true);
      return;
    }

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
      (err) => {
        console.error("Geolocation error:", err);
        setHasFetchedLocation(true);
      }
    );

    return () => {
      clearTimeout(debounceTimeout);
      navigator.geolocation.clearWatch(watchId);
    };
  }, [status, session]);

  // refresh alerts ทุก 30 วินาที
  useEffect(() => {
    if (!userLocation || !session?.user?.id) return;
    
    const interval = setInterval(() => {
      fetchAlerts(userLocation.lat, userLocation.lng);
    }, 30000);

    return () => clearInterval(interval);
  }, [userLocation, session]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-lg sm:text-xl font-semibold text-white p-6 sm:p-8 bg-red-700 rounded-lg shadow-lg">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

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
          
          {currentHandbook ? (
            <DisasterInfo title={disasterRecommendations[currentHandbook.type]?.title} steps={disasterRecommendations[currentHandbook.type]?.steps} onclose={handleCloseHandbook}/>
          ) : (
            <p className="text-sm sm:text-base md:text-lg text-gray-100">
              ไม่มีการแจ้งเตือนภัยพิบัติในพื้นที่
            </p>
          )}
        </div>
      </div>

      {/* Alert Box ลอยกลางจอ */}
      {currentAlert && (
        <>
          <div className="absolute top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-[90%] md:max-w-xl alert-fade-container">
            <AlertBox alert={currentAlert} onDismiss={handleDismissAlert} dismissed={dismissed} />
          </div>

          {/* แสดงจำนวน alert คงเหลือ */}
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
