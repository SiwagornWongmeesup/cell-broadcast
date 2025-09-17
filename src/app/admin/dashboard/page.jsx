'use client';

import { Line, Bar } from 'react-chartjs-2';
import Sidebar from '../../components/Sidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

// --- ข้อมูล Chart ---
const lineChartData = {
  labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'],
  datasets: [
    {
      label: 'จำนวนการแจ้งเตือน',
      data: [120, 190, 30, 50, 20, 30, 150],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
    {
      label: 'ผู้ใช้งานที่ได้รับแจ้งเตือน',
      data: [80, 150, 20, 40, 10, 20, 100],
      fill: false,
      borderColor: 'rgb(153, 102, 255)',
      tension: 0.1,
    },
  ],
};

const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'สถิติการแจ้งเตือนและผู้ใช้งานรายเดือน' },
  },
};

const barChartData = {
  labels: ['ภัยน้ำท่วม', 'แผ่นดินไหว', 'ไฟไหม้', 'อุบัติเหตุ'],
  datasets: [
    {
      label: 'จำนวนการแจ้งเตือน',
      data: [500, 350, 280, 420],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'เหตุการณ์ที่แจ้งเตือนบ่อยที่สุด' },
  },
  scales: { y: { beginAtZero: true } },
};

// --- Card Metrics ---
const metrics = [
  { title: 'จำนวนการแจ้งเตือนทั้งหมด', value: '1200', icon: '🚨' },
  { title: 'การแจ้งเตือนสำเร็จ', value: '1150', icon: '✅' },
  { title: 'ความล้มเหลวในการส่ง', value: '50', icon: '❌' },
  { title: 'ผู้ใช้งานที่ได้รับแจ้งเตือน', value: '1,000,000+', icon: '👥' },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ภาพรวม Dashboard</h1>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-500">{metric.title}</p>
                <h2 className="text-2xl font-semibold text-gray-900">{metric.value}</h2>
              </div>
              <div className="text-4xl text-blue-500">{metric.icon}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </main>
    </div>
  );
}
