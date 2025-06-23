import React, { useState } from 'react';
import axios from 'axios';
import Chart from './chart';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

await axios.post("http://localhost:5000/upload", formData);
await axios.post("https://excel-backend.onrender.com/upload", formData);

function Upload() {
  const [file, setFile] = useState();
  const [result, setResult] = useState(null);
  const [filterDept, setFilterDept] = useState("All");

  const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(filteredData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "FilteredData");

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(fileData, "Filtered_Data.xlsx");
};


  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post("http://localhost:5000/upload", formData);
    setResult(res.data);
  };

  // Step 5: Filtered data logic
  const filteredData = result?.data?.filter((item) =>
    filterDept === "All" ? true : item.Department === filterDept
  );

  const departments = [...new Set(result?.data?.map(item => item.Department))];

  return (
    <div className="p-4">
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} className="bg-blue-500 text-white p-2 ml-2">Upload</button>

      {result && (
        <>
          <div className="mt-4">
            <h2>Summary:</h2>
            <p>Rows: {result.summary.rowCount}</p>
            <p>Columns: {result.summary.columns.join(", ")}</p>
          </div>

          {/* Step 5: Filter dropdown */}
          <div className="mt-4">
            <label className="font-medium mr-2">Filter by Department:</label>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border px-2 py-1">
              <option value="All">All</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Chart with filtered data */}
          <Chart data={filteredData} />
<button onClick={exportToExcel} className="mt-2 bg-green-600 text-white px-4 py-2">
  Download Excel
</button>

  </>
      )}
    </div>
  );
}

export default Upload;

