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

      const disasterAlert = nearby.find(a => ["น้ำท่วม", "แผ่นดินไหว", "ไฟป่า", "พายุ", "ภูเขาไฟระเบิด", "อื่นๆ"].includes(a.type));
      setDisaster(disasterAlert ? disasterAlert.type : null);

    } catch (error) {
      console.error("Fetch alerts error:", error);
      setAlerts([]); setCurrentAlert(null); setAlertQueue([]);
      setMarkers([]); setLatestAlert(null); setDisaster(null);
    }
  };

  // useEffect สำหรับ GPS และ watchPosition
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (!navigator.geolocation) {
      alert("อุปกรณ์นี้ไม่รองรับ GPS");
      setHasFetchedLocation(true);
      return;
    }

    // ตรวจสอบสิทธิ์ตำแหน่ง
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        // popup ให้ผู้ใช้อนุญาต
        navigator.geolocation.getCurrentPosition(
          (pos) => {
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
          },
          (err) => {
            alert("กรุณาอนุญาต GPS และเปิดตำแหน่งเพื่อใช้งานแผนที่");
            setHasFetchedLocation(true);
          }
        );
      } else if (result.state === "denied") {
        // ถ้า block ไปแล้ว → แจ้งให้เปิดใน Settings
        alert("คุณต้องเปิดสิทธิ์ตำแหน่งใน Settings ของแอปเพื่อใช้งานแผนที่");
        setHasFetchedLocation(true);
      }
    });

    // watchPosition สำหรับอัปเดต location ใหม่ ๆ
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
        }, 3000);
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

  if (status === 'loading' || !hasFetchedLocation) return <div className="text-center text-gray-700 text-lg mt-9">Loading map and alerts...</div>;
  if (!session) return null;

  const disasterData = disaster ? disasterRecommendations[disaster] : null;

  return (
    <div className="flex flex-col min-h-screen relative">
      <div className="flex flex-col md:flex-row flex-1">
        {/* ส่วนแผนที่ */}
        <div className="w-full md:w-1/2 p-2 sm:p-4 md:p-6 border-b md:border-b-0 md:border-r ">
           <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4">
            แผนที่แจ้งเตือนสำหรับคุณ {session?.user.name}
          </h2>

        {/* ปุ่มขอสิทธิ์ตำแหน่ง */}
        {!userLocation && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <button
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition"
              onClick={() => {
                if (!navigator.geolocation) {
                  alert("อุปกรณ์นี้ไม่รองรับ GPS");
                  return;
                }

                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const { latitude, longitude } = pos.coords;
                    console.log("User Location:", latitude, longitude);
                    setUserLocation({ lat: latitude, lng: longitude });
                    setHasFetchedLocation(true);
                    fetchAlerts(latitude, longitude);

                    if (session?.user?.id) {
                      fetch("/api/update-location", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: session.user.id, lat: latitude, lng: longitude }),
                      }).catch(err => console.error("Failed to update location:", err));
                    }
                  },
                  (err) => {
                    console.error("Geolocation error:", err);
                    alert("กรุณาอนุญาต GPS และเปิดตำแหน่งเพื่อใช้งานแผนที่");
                  },
                  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
              }}
            >
              ใช้ตำแหน่งปัจจุบัน
            </button>
          </div>
        )}

        {/* แผนที่ */}
        <div className="w-full h-[250px] sm:h-[400px] md:h-[500px] bg-gray-200 rounded-lg relative z-0">
          {hasFetchedLocation && <UserMapComponent markers={markers} userLocation={userLocation} />}
        </div>
          
          <div className="w-full h-[250px] sm:h-[400px] md:h-[500px] bg-gray-200 rounded-lg relative z-0">
            {hasFetchedLocation && <UserMapComponent markers={markers} userLocation={userLocation} />}
          </div>
        </div>

        {/* ส่วนคู่มือการรับมือ */}
        <div className="w-full md:w-1/2 p-2 sm:p-4 md:p-6 overflow-y-auto pt-27">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4">
            คู่มือการรับมือสถานการณ์
          </h2>
          {disasterData ? (
            <DisasterInfo title={disasterData.title} steps={disasterData.steps} />
          ) : (
            <p className="text-sm sm:text-base md:text-lg">ไม่มีการแจ้งเตือนภัยพิบัติในพื้นที่</p>
          )}
        </div>
      </div>

      {/* Alert Box ลอยกลางจอ */}
      {currentAlert && (
        <div className="absolute top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-[90%] md:max-w-xl">
          <AlertBox alert={currentAlert} onDismiss={handleDismissAlert} />
        </div>
      )}
    </div>
  );
}
