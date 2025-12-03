'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar';

// Dynamic import ChartJS components
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });

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
  const [lineChartDataUser, setLineChartDataUser] = useState(null);
  const [pieAdminData, setPieAdminData] = useState(null);
  const [pieUserData, setPieUserData] = useState(null);
  const [pieAreaData, setPieAreaData] = useState(null);
  const [instagramList, setInstagramList] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [filters, setFilters] = useState({ month: '', type: '' });

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try { 
        const res = await fetch(`/api/admin/dashboard?month=${filters.month}&type=${filters.type}`);
        const data = await res.json();

        // Metrics
        setMetrics([
          { title: 'จำนวนแจ้งเตือนทั้งหมด', value: data.totalAlerts, icon: '🚨' },
          { title: 'ผู้ใช้งานทั้งหมด', value: data.totalUsers, icon: '👤' },
          { title: 'รายงานจากผู้ใช้ทั้งหมด', value: data.totalUserreports, icon: '📝' },
          { title: 'รอความช่วยเหลือ', value: data.totalPendingHelp, icon: '' },
          { title: 'ได้รับการช่วยเหลือแล้ว', value: data.totalResolvedHelp, icon: '' },
          { title: 'ผู้ใช้ที่มี IG', value: data.totalUserprofiles, icon: '📸' },
        ]);

        // Line Chart: แจ้งเตือนรายเดือน
        const countsByMonth = data.countsByMonth || {};
        const sortedKeys = Object.keys(countsByMonth).sort();
        const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
        setLineChartData({
          labels: sortedKeys.map(k => {
            const [year, month] = k.split("-");
            return `${months[parseInt(month)-1]} ${year}`;
          }),
          datasets: [{
            label: 'จำนวนแจ้งเตือนต่อเดือน',
            data: sortedKeys.map(k => countsByMonth[k]),
            backgroundColor: '#36A2EB'
          }]
        });

        // Top Users
        const enrichedTopUsers = data.enrichedTopUsers || [];
        setTopUsers(enrichedTopUsers);

        setLineChartDataUser({
          labels: enrichedTopUsers.map(u => u.name),
          datasets: [{
            label: 'Top 5 user ที่ส่งแจ้งเตือนมากที่สุด',
            data: enrichedTopUsers.map(u => u.alertCount),
            backgroundColor: [
              '#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF'
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
      <div className="w-full md:w-64 bg-gray-900 border-r border-gray-700">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
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

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <Bar data={lineChartData} options={{
              indexAxis: 'x',
              responsive: true,
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }}/>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <Bar data={lineChartDataUser} options={{
              indexAxis: 'x',
              responsive: true,
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }}/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <Pie data={pieAdminData} options={{ plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'จำนวนรายงานเหตุการณ์จากแอดมิน' } }}}/>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <Pie data={pieUserData} options={{ plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'จำนวนรายงานเหตุการณ์จากผู้ใช้' } }}}/>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <Pie data={pieAreaData} options={{ plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'รวมจำนวนเหตุการณ์ที่ถูกส่งมากที่สุด' } }}}/>
          </div>
        </div>

        {/* Instagram List */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 max-h-52 overflow-y-auto">
          <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Instagram ของผู้ใช้งาน</h2>
          {instagramList.length === 0 ? (
            <p className="text-gray-500">ยังไม่มี IG</p>
          ) : (
            <ul className="list-disc list-inside">
              {instagramList.map((ig, i) => (
                <li key={i} className="text-gray-800 hover:text-blue-500 cursor-pointer">@{ig}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Users Table */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md overflow-x-auto mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">รายระเอียดUser</h2>
          <table className="w-full text-left border-collapse">
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

      </main>
    </div>
  );
}
