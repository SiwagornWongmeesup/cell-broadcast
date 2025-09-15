'use client'
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AlertsHistoryPage() {
  const { data: session, status } = useSession();
  const [allDisasterAlerts, setAllDisasterAlerts] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const fetchAlerts = () => {
      if (!session?.user?.id) return;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            (async () => {
              try {
                const res = await fetch(
                  `/api/alerts?lat=${lat}&lng=${lng}&userId=${session.user.id}`
                );
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                setAllDisasterAlerts(data.allDisasterAlerts || []);
              } catch (err) {
                console.error('Failed to fetch alerts:', err);
              }
            })();
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      }
    };

    fetchAlerts();
  }, [session]);

  useEffect(() => {
    if (!session || session.user.role !== 'user') {
      router.push('/');
    }
  }, [session, router]);

  const filteredAlerts = allDisasterAlerts.filter(alert =>
    filterType === "all" ? true : alert.type === filterType
  );

  const alertTypes = ["all", ...new Set(allDisasterAlerts.map(a => a.type))];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-2 sm:px-4 md:px-8 lg:px-16 py-4">
      <div className="max-w-[1600px] mx-auto w-full">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center sm:text-left">รายละเอียดการแจ้งเตือน</h2>

        {/* Filter Dropdown */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <label className="mb-2 sm:mb-0 font-medium">กรองตามประเภท:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-md p-2 text-sm sm:text-base w-full sm:w-auto"
          >
            {alertTypes.map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Alerts Grid */}
        {filteredAlerts.length === 0 ? (
          <p className="text-gray-500 text-center sm:text-left">ยังไม่มีการแจ้งเตือน</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAlerts.map((alert, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition duration-200 flex flex-col justify-between">
                <div className="mb-2">
                  <span className="font-semibold block">ประเภทเหตุการณ์:</span>
                  <p className="text-gray-700 text-sm sm:text-base">{alert.type}</p>
                </div>
                <div className="mb-2">
                  <span className="font-semibold block">ข้อความแจ้งเตือน:</span>
                  <p className="text-red-600 font-bold text-sm sm:text-base">{alert.message}</p>
                </div>
                <div className="mb-2">
                  <span className="font-semibold block">รัศมีที่ได้รับผลกระทบ:</span>
                  <p className="text-gray-700 text-sm sm:text-base">{alert.radius} เมตร</p>
                </div>
                <div>
                  <span className="font-semibold block">วันที่:</span>
                  <p className="text-gray-500 text-xs sm:text-sm">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
