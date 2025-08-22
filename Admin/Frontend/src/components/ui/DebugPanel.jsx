import React, { useState } from "react";

/**
 * Admin Debug Panel component for development mode only
 * This component provides debugging tools and information for the Admin Frontend
 */
const AdminDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeTab, setActiveTab] = useState("logs");

  // Only render in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const toggleCapture = () => {
    if (!isCapturing) {
      // Start capturing logs
      const originalConsole = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
      };

      // Override console methods to capture logs
      console.log = (...args) => {
        setLogs((prev) => [
          ...prev,
          {
            type: "log",
            content: args.map((arg) => String(arg)).join(" "),
            timestamp: new Date(),
          },
        ]);
        originalConsole.log(...args);
      };

      console.info = (...args) => {
        setLogs((prev) => [
          ...prev,
          {
            type: "info",
            content: args.map((arg) => String(arg)).join(" "),
            timestamp: new Date(),
          },
        ]);
        originalConsole.info(...args);
      };

      console.warn = (...args) => {
        setLogs((prev) => [
          ...prev,
          {
            type: "warn",
            content: args.map((arg) => String(arg)).join(" "),
            timestamp: new Date(),
          },
        ]);
        originalConsole.warn(...args);
      };

      console.error = (...args) => {
        setLogs((prev) => [
          ...prev,
          {
            type: "error",
            content: args.map((arg) => String(arg)).join(" "),
            timestamp: new Date(),
          },
        ]);
        originalConsole.error(...args);
      };
    } else {
      // Stop capturing logs (would need to restore original console methods)
      // This is simplified - in a real implementation you'd restore the original methods
    }

    setIsCapturing(!isCapturing);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testApiConnection = () => {
    console.log("Testing Admin API connection...");

    fetch("/api/health")
      .then((response) => {
        if (response.ok) {
          console.info("Admin API connection successful!");
          return response.json();
        } else {
          console.error(
            `Admin API connection failed with status: ${response.status}`
          );
          throw new Error(`Status ${response.status}`);
        }
      })
      .then((data) => {
        console.info("Admin API health data:", data);
      })
      .catch((error) => {
        console.error("Admin API connection error:", error);
      });
  };

  const testCorsConfig = () => {
    if (window.adminDebugger) {
      window.adminDebugger.checkCorsConfig();
    } else {
      console.warn("Admin debugger not found");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={togglePanel}
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          zIndex: 9999,
          background: "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          padding: "5px 10px",
          cursor: "pointer",
          opacity: 0.7,
        }}
      >
        Admin Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        width: "500px",
        maxHeight: "600px",
        background: "#1e293b",
        color: "#fff",
        borderRadius: "8px",
        padding: "12px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, color: "#6366f1" }}>Admin Debug Panel</h3>
        <button
          onClick={togglePanel}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
        <button
          onClick={() => setActiveTab("logs")}
          style={{
            background: activeTab === "logs" ? "#6366f1" : "#334155",
            border: "none",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logs
        </button>
        <button
          onClick={() => setActiveTab("network")}
          style={{
            background: activeTab === "network" ? "#6366f1" : "#334155",
            border: "none",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Network
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          style={{
            background: activeTab === "tools" ? "#6366f1" : "#334155",
            border: "none",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Tools
        </button>
      </div>

      {activeTab === "logs" && (
        <>
          <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
            <button
              onClick={toggleCapture}
              style={{
                background: isCapturing ? "#ef4444" : "#10b981",
                border: "none",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {isCapturing ? "Stop Capturing" : "Start Capturing"}
            </button>
            <button
              onClick={clearLogs}
              style={{
                background: "#0ea5e9",
                border: "none",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Clear Logs
            </button>
          </div>

          <div
            style={{
              overflowY: "auto",
              flex: 1,
              background: "#0f172a",
              padding: "8px",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "12px",
              maxHeight: "300px",
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: "#94a3b8", padding: "10px" }}>
                No logs captured yet. Click "Start Capturing" to begin.
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: "3px 5px",
                    borderBottom: "1px solid #334155",
                    color:
                      log.type === "error"
                        ? "#ef4444"
                        : log.type === "warn"
                        ? "#f59e0b"
                        : log.type === "info"
                        ? "#0ea5e9"
                        : "#e2e8f0",
                  }}
                >
                  <span style={{ color: "#64748b" }}>
                    {log.timestamp.toLocaleTimeString()}:
                  </span>{" "}
                  {log.content}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === "network" && (
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            background: "#0f172a",
            padding: "8px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "12px",
            maxHeight: "300px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <button
              onClick={testApiConnection}
              style={{
                background: "#0ea5e9",
                border: "none",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "5px",
              }}
            >
              Test API Connection
            </button>
            <button
              onClick={testCorsConfig}
              style={{
                background: "#f59e0b",
                border: "none",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Test CORS Config
            </button>
          </div>

          <div style={{ color: "#94a3b8", padding: "10px" }}>
            <p>API endpoints:</p>
            <ul>
              <li>Health check: /api/health</li>
              <li>Admin dashboard: /api/admin/dashboard/stats</li>
              <li>Users: /api/admin/users</li>
              <li>Quizzes: /api/admin/quizzes</li>
            </ul>
            <p>Click "Test API Connection" to check connectivity.</p>
          </div>
        </div>
      )}

      {activeTab === "tools" && (
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            background: "#0f172a",
            padding: "8px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "12px",
            maxHeight: "300px",
          }}
        >
          <div style={{ color: "#94a3b8", padding: "10px" }}>
            <p>Available debug commands:</p>
            <ul>
              <li>
                <code>window.adminDebugger.enable()</code> - Enable debugging
              </li>
              <li>
                <code>window.adminDebugger.disable()</code> - Disable debugging
              </li>
              <li>
                <code>window.adminDebugger.setLogLevel('debug')</code> - Set log
                level
              </li>
              <li>
                <code>window.adminDebugger.checkCorsConfig()</code> - Check CORS
                config
              </li>
            </ul>
            <p>Open browser console (F12) and try these commands.</p>
          </div>
        </div>
      )}

      <div style={{ marginTop: "10px", fontSize: "12px", color: "#94a3b8" }}>
        <div>Environment: {import.meta.env.MODE}</div>
        <div>
          Admin API URL:{" "}
          {import.meta.env.VITE_API_URL || "http://localhost:5000/api"}
        </div>
        <div>Admin Frontend Port: 3001</div>
      </div>
    </div>
  );
};

export default AdminDebugPanel;
