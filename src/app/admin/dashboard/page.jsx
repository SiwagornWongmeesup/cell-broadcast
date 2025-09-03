'use client';

import { Line, Bar } from 'react-chartjs-2';
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

// ข้อมูลสำหรับกราฟเส้น (Line Chart) ที่แสดงจำนวนการแจ้งเตือนรายเดือน
const lineChartData = {
  labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'],
  datasets: [
    {
      label: 'จำนวนการแจ้งเตือน', // เปลี่ยน label
      data: [120, 190, 30, 50, 20, 30, 150], // ข้อมูลสมมติจำนวนการแจ้งเตือน
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
    {
      label: 'ผู้ใช้งานที่ได้รับแจ้งเตือน', // เพิ่ม label
      data: [80, 150, 20, 40, 10, 20, 100], // ข้อมูลสมมติจำนวนผู้ใช้งานที่ได้รับ
      fill: false,
      borderColor: 'rgb(153, 102, 255)',
      tension: 0.1,
    },
  ],
};

const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'สถิติการแจ้งเตือนและผู้ใช้งานรายเดือน', // เปลี่ยน title
    },
  },
};

// ข้อมูลสำหรับกราฟแท่ง (Bar Chart) ที่แสดงเหตุการณ์ที่แจ้งเตือนบ่อยที่สุด
const barChartData = {
  labels: ['ภัยน้ำท่วม', 'แผ่นดินไหว', 'ไฟไหม้', 'อุบัติเหตุ'], // เปลี่ยน label เป็นประเภทการแจ้งเตือน
  datasets: [
    {
      label: 'จำนวนการแจ้งเตือน', // เปลี่ยน label
      data: [500, 350, 280, 420], // ข้อมูลสมมติจำนวนครั้งของแต่ละเหตุการณ์
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
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'เหตุการณ์ที่แจ้งเตือนบ่อยที่สุด', // เปลี่ยน title
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// ข้อมูลสำหรับ Card Metrics
const metrics = [
  { title: 'จำนวนการแจ้งเตือนทั้งหมด', value: '1200', icon: '🚨' },
  { title: 'การแจ้งเตือนสำเร็จ', value: '1150', icon: '✅' }, 
  { title: 'ความล้มเหลวในการส่ง', value: '50', icon: '❌' }, 
  { title: 'ผู้ใช้งานที่ได้รับแจ้งเตือน', value: '1,000,000+', icon: '👥' },
];

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ภาพรวม Dashboard</h1>

      {/* Grid สำหรับ Card Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{metric.title}</p>
              <h2 className="text-2xl font-semibold text-gray-900">{metric.value}</h2>
            </div>
            <div className="text-4xl text-blue-500">
              {metric.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Grid สำหรับกราฟ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* กราฟเส้น */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>

        {/* กราฟแท่ง */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
    </>
  );
}