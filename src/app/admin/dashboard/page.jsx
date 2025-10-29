'use client';

import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import Sidebar from '../../components/Sidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const [metrics, setMetrics] = useState([]);
  const [lineChartData, setLineChartData] = useState(null);
  const [lineChartDatauser, setLineChartDataUser] = useState(null);
  const [pieAdminData, setPieAdminData] = useState(null);
  const [pieUserData, setPieUserData] = useState(null);
  const [pieAreaData, setPieAreaData] = useState(null);
  const [instagramList, setInstagramList] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topAreas, setTopAreas] = useState([]);
  const [filters, setFilters] = useState({ month: '', type: '' });

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/admin/dashboard?month=${filters.month}&type=${filters.type}`);
        const data = await res.json();

        const top5Users = (data.topUsers || [])
  .sort((a, b) => b.alertCount - a.alertCount) // เรียงจากมากไปน้อย
  .slice(0, 5); // เอา 5 อันดับแรก

        // Metrics
        setMetrics([
          { title: 'จำนวนแจ้งเตือนทั้งหมด', value: data.totalAlerts, icon: '🚨' },
          { title: 'ผู้ใช้งานทั้งหมด', value: data.totalUsers, icon: '👤' },
          { title: 'รายงานจากผู้ใช้ทั้งหมด', value: data.totalUserreports, icon: '📝' },
          { title: 'ผู้ใช้ที่มี IG', value: data.totalUserprofiles, icon: '📸' },
        ]);

        // Line Chart: แจ้งเตือนรายเดือน
        setLineChartData({
          labels: data.labels || [], 
          datasets: [{
            label: 'จำนวนแจ้งเตือนต่อเดือน',
            data: Object.values(data.countsByMonth || {}),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF'
            ],
          }]
        });
        setLineChartDataUser({
          labels: top5Users.map(u => u.name),
          datasets: [{
            label: 'Top 5 user ที่ส่งแจ้งเตือนมากที่สุด',
            data:top5Users.map(u => u.alertCount),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF'
            ],
            borderColor: '#333',
            borderWidth: 1,
            barThickness: 40
          }]
        });
        // Pie Charts
        setPieAdminData({
          labels: Object.keys(data.typeStats || {}),
          datasets: [{
            label: 'จำนวนรายงานเหตุการณ์จากแอดมิน',
            data: Object.values(data.typeStats || {}),
            backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF'],
          }]
        });
        
        setPieUserData({
          labels: Object.keys(data.statsReports || {}),
          datasets: [{
            label: 'จำนวนรายงานเหตุการณ์จากผู้ใช้',
            data: Object.values(data.statsReports || {}),
            backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF'],
          }]
        });

        setPieAreaData({
          labels: Object.keys(data.allStats || {}),
          datasets: [{
            label: 'รวมจำนวนเหตุการณ์ที่ถูกส่งมากที่สุด',
            data: Object.values(data.allStats || {}),
            backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF'],
          }]
        });

        setInstagramList(data.instagramList || []);
        setTopUsers(data. enrichedTopUsers || []);
        setTopAreas(data.topAreas || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchDashboard();
  }, [filters]);

  if (!lineChartData || !pieAdminData || !pieUserData || !pieAreaData) {
    return <div className="flex justify-center items-center min-h-screen text-gray-800">กำลังโหลด Dashboard...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 border-r border-gray-700">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">ภาพรวม Dashboard</h1>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, i) => (
            <div key={i} className="bg-white p-4 md:p-6 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base text-gray-500">{metric.title}</p>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{metric.value}</h2>
              </div>
              <div className="text-3xl md:text-4xl">{metric.icon}</div>
            </div>
          ))}
        </div>

        {/* Line Chart */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
          <Bar data={lineChartData} 
          options={{
            indexAxis: 'x',
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1, // หรือ 5 ถ้า max เยอะ
                  precision: 0 // ให้เป็นจำนวนเต็ม
                }
              }
            }
          }} 
          />
        </div>
        
        {/* Line Chart */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
          <Bar data={lineChartDatauser} 
          options={{
            indexAxis: 'x',
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1, // หรือ 5 ถ้า max เยอะ
                  precision: 0 // ให้เป็นจำนวนเต็ม
                }
              }
            }
          }} 
          />
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <Pie 
              data={pieAdminData} 
              options={{
                plugins: {
                  title: {
                    display: true,
                    text: 'จำนวนรายงานเหตุการณ์จากแอดมิน',
                    font: {
                      size: 18,
                    }
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <Pie 
              data={pieUserData} 
              options={{
                plugins: {
                  title: {
                    display: true,
                    text: 'จำนวนรายงานเหตุการณ์จากผู้ใช้',
                    font: {
                      size: 18,
                    }
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <Pie 
              data={pieAreaData} 
              options={{
                plugins: {
                  title: {
                    display: true,
                    text: 'รวมจำนวนเหตุการณ์ที่ถูกส่งมากที่สุด',
                    font: {
                      size: 18,
                    }
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Instagram List */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Instagram ของผู้ใช้งาน</h2>
          {instagramList.length === 0 ? (
            <p className="text-gray-500">ยังไม่มี IG</p>
          ) : (
            <ul className="list-disc list-inside max-h-52 overflow-y-auto">
              {instagramList.map((ig, i) => (
                <li key={i} className="text-gray-800 hover:text-blue-500 cursor-pointer">@{ig}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Top 5 Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">รายระเอียดUser</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="border px-2 py-1">User</th>
                  <th className="border px-2 py-1">เขตที่รายงานบ่อย</th>
                  <th className="border px-2 py-1">จำนวนแจ้งเตือน</th>
                  <th className="border px-2 py-1">เขตอื่นที่เคยรายงาน</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u, i) => (
                  <tr key={u._id || i}>
                    <td className="border px-2 py-1">{u.name}</td>
                    <td className="border px-2 py-1">{u.mainDistrict}</td>
                    <td className="border px-2 py-1">{u.alertCount}</td>
                    <td className="border px-2 py-1">{u.otherDistricts.join(", ")}</td>
                  </tr> 
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
