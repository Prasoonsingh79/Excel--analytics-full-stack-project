// src/components/Chart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function Chart({ data }) {
  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="Department" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="Salary" fill="#8884d8" />
    </BarChart>
  );
}

export default Chart;
