'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "../components/navbar";
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
  const [latestAlert, setLatestAlert] = useState(null);
  const [disaster, setDisaster] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hasFetchedLocation, setHasFetchedLocation] = useState(false);

  const handleDismissAlert = async () => {
    if (!currentAlert || !session?.user?.id) return;

    try {
      await fetch(`/api/alerts/dismiss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId: currentAlert._id,
          userId: session.user.id
        })
      });
    } catch (error) {
      console.error("Dismiss alert error:", error);
    }

    const nextQueue = alertQueue.filter(a => a._id !== currentAlert._id);
    setCurrentAlert(nextQueue[0] || null);
    setAlertQueue(nextQueue.slice(1));
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
      setLatestAlert(data.latestAlert || null);

      const disasterAlert = nearby.find(a => ["flood","earthquake","wildfire","volcanic","measure"].includes(a.type));
      setDisaster(disasterAlert ? disasterAlert.type : null);

    } catch (error) {
      console.error("Fetch alerts error:", error);
      setAlerts([]); setCurrentAlert(null); setAlertQueue([]);
      setMarkers([]); setLatestAlert(null); setDisaster(null);
    }
  };

  // 🔹 useEffect สำหรับ geolocation พร้อม debounce + cleanup
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
        }, 3000); // ส่งหลังผู้ใช้หยุดเคลื่อนไหว 3 วินาที
      },
      (err) => {
        console.error("Geolocation error:", err);
        setHasFetchedLocation(true);
      }
    );

    // Cleanup
    return () => {
      clearTimeout(debounceTimeout);
      navigator.geolocation.clearWatch(watchId);
    };
  }, [status, session]);

  // 🔹 refresh alerts ทุก 30 วินาที
  useEffect(() => {
    if (!userLocation || !session?.user?.id) return;

    const interval = setInterval(() => {
      fetchAlerts(userLocation.lat, userLocation.lng);
    }, 30000);

    return () => clearInterval(interval);
  }, [userLocation, session]);

  if (status === 'loading' || !hasFetchedLocation) return <div>Loading map and alerts...</div>;
  if (!session) return null;

  const disasterData = disaster ? disasterRecommendations[disaster] : null;

  return (
    <div className="flex flex-col h-screen relative">
      <Navbar session={session} />
      <div className="flex flex-1">
        <div className="w-1/2 p-4 border-r">
          <h2 className="text-xl font-semibold mb-4">
            แผนที่แจ้งเตือนสำหรับคุณ {session?.user.name}
          </h2>
          <div className="w-full h-[500px] bg-gray-200 rounded-lg relative z-0">
            {hasFetchedLocation && <UserMapComponent markers={markers} userLocation={userLocation} />}
          </div>
        </div>
        <div className="w-1/2 p-4 overflow-y-auto border-l">
          <h2 className="text-xl font-semibold mb-4">
            คู่มือการรับมือสถานการณ์
          </h2>
          {disasterData ? <DisasterInfo title={disasterData.title} steps={disasterData.steps} /> :
            <p>ไม่มีการแจ้งเตือนภัยพิบัติในพื้นที่</p>}
        </div>
      </div>
      {currentAlert && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-xl">
          <AlertBox alert={currentAlert} onDismiss={handleDismissAlert} />
        </div>
      )}
    </div>
  );
}
