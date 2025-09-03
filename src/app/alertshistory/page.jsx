'use client'
import { useEffect, useState } from 'react';
import Navbar from "../components/navbar";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AlertsHistoryPage() {
  const { data: session, status } = useSession();
  const [allDisasterAlerts, setAllDisasterAlerts] = useState([]);
  const [filterType, setFilterType] = useState("all"); // สำหรับกรองประเภท
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

  if (status === 'loading') return <div>Loading...</div>;
  if (!session || session.user.role !== 'user') {
    router.push('/');
    return null;
  }

  // กรองประเภทเหตุการณ์
  const filteredAlerts = allDisasterAlerts.filter(alert =>
    filterType === "all" ? true : alert.type === filterType
  );

  // หา unique types สำหรับ dropdown
  const alertTypes = ["all", ...new Set(allDisasterAlerts.map(a => a.type))];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar session={session} />
      <div className="px-4 py-4">
        <h2 className="text-2xl font-bold mb-2">รายละเอียดการแจ้งเตือน</h2>

        {/* Filter Dropdown */}
        <div className="mb-4">
          <label className="mr-2 font-medium">กรองตามประเภท:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-md p-1"
          >
            {alertTypes.map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Alerts Grid */}
        {filteredAlerts.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีการแจ้งเตือน</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAlerts.map((alert, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition duration-200">
                <div className="mb-1">
                  <span className="font-semibold">ประเภทเหตุการณ์:</span>
                  <p className="text-gray-700">{alert.type}</p>
                </div>
                <div className="mb-1">
                  <span className="font-semibold">ข้อความแจ้งเตือน:</span>
                  <p className="text-red-600 font-bold">{alert.message}</p>
                </div>
                <div className="mb-1">
                  <span className="font-semibold">รัศมีที่ได้รับผลกระทบ:</span>
                  <p className="text-gray-700">{alert.radius} เมตร</p>
                </div>
                <div>
                  <span className="font-semibold">วันที่:</span>
                  <p className="text-gray-500 text-sm">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
