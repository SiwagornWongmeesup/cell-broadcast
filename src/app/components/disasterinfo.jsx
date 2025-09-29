// components/disasterinfo.jsx
import React from 'react';

// Component นี้จะรับ props ที่ชื่อว่า title และ steps
export default function DisasterInfo({ title, steps, onclose }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-gray-100">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button 
          className="text-red-500 font-bold" 
          onClick={onclose}
        >
          ✖
        </button>
      </div>
      <ul className="list-disc pl-5">
        {steps.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ul>
    </div>
  );
}