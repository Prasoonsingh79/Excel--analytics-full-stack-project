import React, { useState, useEffect } from 'react';
import './App.css';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadHistory, setUploadHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverStatus, setServerStatus] = useState('checking');

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/test`);
      if (response.ok) {
        setServerStatus('connected');
        const data = await response.json();
        console.log('Server response:', data);
      } else {
        setServerStatus('disconnected');
      }
    } catch (error) {
      setServerStatus('disconnected');
      console.error('Server connection failed:', error);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid Excel (.xlsx, .xls) or CSV file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
        setUploadHistory(prev => [...prev, {
          id: Date.now(),
          filename: result.originalName,
          uploadTime: new Date().toLocaleString(),
          recordCount: result.data?.length || 0
        }]);
        
        setActiveTab('analytics');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please check your server connection.');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleChart = () => {
    if (!data || data.length === 0) return null;

    const chartData = data.slice(0, 5);
    const keys = Object.keys(data[0] || {});
    const numericKey = keys.find(key => 
      data.some(item => !isNaN(parseFloat(item[key])))
    );

    if (!numericKey) return null;

    const maxValue = Math.max(...chartData.map(item => parseFloat(item[numericKey]) || 0));

    return (
      <div className="simple-chart">
        <h4>📊 Data Visualization</h4>
        {chartData.map((item, index) => {
          const value = parseFloat(item[numericKey]) || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="chart-bar">
              <span className="bar-label">{item[keys[0]] || `Row ${index + 1}`}</span>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${percentage}%` }}
                ></div>
                <span className="bar-value">{value}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📊 Excel Analytics Platform</h1>
        <div className="server-status">
          <span className={`status-indicator ${serverStatus}`}></span>
          Server: {serverStatus}
        </div>
      </header>

      <nav className="nav-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📈 Dashboard
        </button>
        <button 
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          📁 Upload
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          🕒 History
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <h2>Welcome to Excel Analytics</h2>
            <div className="dashboard-cards">
              <div className="card">
                <h3>📁 Total Uploads</h3>
                <p className="metric">{uploadHistory.length}</p>
              </div>
              <div className="card">
                <h3>📊 Records Processed</h3>
                <p className="metric">{uploadHistory.reduce((sum, item) => sum + item.recordCount, 0)}</p>
              </div>
              <div className="card">
                <h3>🔗 Server Status</h3>
                <p className={`metric ${serverStatus}`}>{serverStatus}</p>
              </div>
            </div>
            <div className="quick-actions">
              <button onClick={() => setActiveTab('upload')} className="primary-btn">
                📤 Upload New File
              </button>
              <button onClick={checkServerStatus} className="secondary-btn">
                🔄 Check Server
              </button>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="upload-section">
            <h2>Upload Excel or CSV File</h2>
            <div className="upload-area">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="file-input"
              />
              
              {file && (
                <div className="file-info">
                  <p>📄 Selected: {file.name}</p>
                  <p>📏 Size: {(file.size / 1024).toFixed(2)} KB</p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="upload-btn"
              >
                {loading ? '⏳ Uploading...' : '📤 Upload & Analyze'}
              </button>
            </div>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Data Analytics</h2>
            
            {data.length === 0 ? (
              <div className="no-data">
                <p>📊 No data available</p>
                <p>Upload a file to see analytics and visualizations</p>
              </div>
            ) : (
              <>
                <div className="data-summary">
                  <h3>📋 Data Summary</h3>
                  <p><strong>Total Records:</strong> {data.length}</p>
                  <p><strong>Columns:</strong> {Object.keys(data[0] || {}).length}</p>
                  <p><strong>Fields:</strong> {Object.keys(data[0] || {}).join(', ')}</p>
                </div>

                {generateSampleChart()}

                <div className="data-table">
                  <h4>📋 Data Preview (First 10 rows)</h4>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(data[0] || {}).map(key => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, i) => (
                              <td key={i}>{String(value)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <h2>Upload History</h2>
            
            {uploadHistory.length === 0 ? (
              <div className="no-data">
                <p>🕒 No upload history</p>
                <p>Your uploaded files will appear here</p>
              </div>
            ) : (
              <div className="history-list">
                {uploadHistory.map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-info">
                      <h4>📄 {item.filename}</h4>
                      <p>⏰ Uploaded: {item.uploadTime}</p>
                      <p>📊 Records: {item.recordCount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
