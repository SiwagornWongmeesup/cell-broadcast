// components/disasterinfo.jsx
import React from 'react';

// Component นี้จะรับ props ที่ชื่อว่า title และ steps
export default function DisasterInfo({ title, steps }) {
 
  return (
    <div className="p-4 bg-red-50 border border-red-300 rounded-lg shadow-lg max-w-xs">
      <h3 className="text-lg font-bold text-red-700 mb-2">{title}</h3>
      <ul className="list-disc pl-5 text-gray-800 space-y-1">
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
    </div>
  );
}