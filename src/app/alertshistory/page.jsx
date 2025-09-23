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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allDisasterAlerts, setAllDisasterAlerts] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!session || session.user.role !== 'user') {
      router.push('/');
      return;
    }

    // ดึงข้อมูล alerts
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`/api/alerts?userId=${session.user.id}`);
        if (!res.ok) throw new Error('Network response not ok');
        const data = await res.json();
        setAllDisasterAlerts(data.allDisasterAlerts || []);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    fetchAlerts();
  }, [session, router]);

  const filteredAlerts = allDisasterAlerts.filter(alert =>
    filterType === 'all' ? true : alert.type === filterType
  );

  const alertTypes = ['all', ...new Set(allDisasterAlerts.map(a => a.type))];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-2 sm:px-4 md:px-8 lg:px-16 py-4">
      <div className="max-w-[1600px] mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center sm:text-left">
          รายละเอียดการแจ้งเตือน
        </h2>

        {/* Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <label className="mb-2 sm:mb-0 font-medium text-gray-700">กรองตามประเภท:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-md p-2 text-sm sm:text-base w-full sm:w-auto"
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
          <p className="text-gray-500 text-center sm:text-left">ยังไม่มีการแจ้งเตือน</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAlerts.map((alert, index) => (
              <div
                key={index}
                className="flex flex-col justify-between p-4 bg-white rounded-lg shadow hover:shadow-lg transition duration-200"
              >
                <div className="mb-2">
                  <span className="font-semibold block text-gray-800">ประเภทเหตุการณ์:</span>
                  <p className="text-gray-700 text-sm sm:text-base">{alert.type}</p>
                </div>

                <div className="mb-2">
                  <span className="font-semibold block text-gray-800">ข้อความแจ้งเตือน:</span>
                  <p className="text-red-600 font-bold text-sm sm:text-base">{alert.message}</p>
                </div>

                <div className="mb-2">
                  <span className="font-semibold block text-gray-800">รัศมีที่ได้รับผลกระทบ:</span>
                  <p className="text-gray-700 text-sm sm:text-base">{alert.radius} เมตร</p>
                </div>

                <div className="mb-2">
                  <span className="font-semibold block text-gray-800">วันที่:</span>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>

               {/* Map */}
              <div className="relative w-full aspect-video mt-2 rounded-lg overflow-hidden">
                {alert.location?.lat && alert.location?.lng ? (
                  <UserMapComponent
                    markers={[{ lat: alert.location.lat, lng: alert.location.lng }]}
                    center={{ lat: alert.location.lat, lng: alert.location.lng }}
                  />
                ) : (
                  <p className="text-gray-500 text-xs sm:text-sm flex items-center justify-center h-full">
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
