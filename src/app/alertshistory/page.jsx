'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const UserMapComponent = dynamic(() => import('../components/mapuser'), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function AlertsHistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [allDisasterAlerts, setAllDisasterAlerts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [markers, setMarkers] = useState([]);

  // ✅ ดึงข้อมูล alerts
  useEffect(() => {
    if (!session || session.user.role !== 'user') {
      router.push('/');
      return;
    }

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`/api/alerts?userId=${session.user.id}`);
        const data = await res.json();
        setAllDisasterAlerts(data.allDisasterAlerts || []);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    fetchAlerts();
  }, [session, router]);

  // ✅ สร้าง markers
  useEffect(() => {
    const newMarkers = allDisasterAlerts
      .map(alert => ({
        ...alert,
        lat: alert.location?.lat,
        lng: alert.location?.lng,
      }))
      .filter(a => a.lat && a.lng);

    setMarkers(newMarkers);
  }, [allDisasterAlerts]);

  const filteredAlerts = allDisasterAlerts.filter(alert =>
    filterType === 'all' ? true : alert.type === filterType
  );

  const alertTypes = ['all', ...new Set(allDisasterAlerts.map(a => a.type))];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-gray-900 to-red-900 px-2 sm:px-4 md:px-8 lg:px-16 py-4 text-gray-100">
      <div className="max-w-[1600px] mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center sm:text-left text-red-600">
          รายละเอียดการแจ้งเตือน
        </h2>

        {/* Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <label className="mb-2 sm:mb-0 font-medium">กรองตามประเภท:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-600 rounded-md p-2 text-sm sm:text-base w-full sm:w-auto bg-gray-800 text-gray-100"
          >
            {alertTypes.map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Alerts */}
        {filteredAlerts.length === 0 ? (
          <p className="text-gray-400 text-center sm:text-left">ยังไม่มีการแจ้งเตือน</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAlerts.map((alert, index) => (
              <div
                key={index}
                className="flex flex-col justify-between p-4 bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition duration-200"
              >
                <div className="mb-2">
                  <span className="font-semibold block">ประเภทเหตุการณ์:</span>
                  <p className="text-gray-300 text-sm sm:text-base">{alert.type}</p>
                </div>

                <div className="mb-2">
                  <span className="font-semibold block">ข้อความแจ้งเตือน:</span>
                  <p className="text-red-500 font-bold text-sm sm:text-base">{alert.message}</p>
                </div>

                <div className="mb-2">
                  <span className="font-semibold block">รัศมีที่ได้รับผลกระทบ:</span>
                  <p className="text-gray-300 text-sm sm:text-base">{alert.radius} เมตร</p>
                </div>

                <div className="mb-2">
                  <span className="font-semibold block">วันที่:</span>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Map */}
                <div className="relative w-full aspect-video mt-2 rounded-lg overflow-hidden bg-gray-800">
                  {alert.location?.lat && alert.location?.lng ? (
                    <UserMapComponent
                      markers={[{ ...alert, lat: alert.location.lat, lng: alert.location.lng }]}
                      center={{ lat: alert.location.lat, lng: alert.location.lng }}
                    />
                  ) : (
                    <p className="text-gray-400 text-xs sm:text-sm flex items-center justify-center h-full">
                      ไม่มีข้อมูลแผนที่
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
