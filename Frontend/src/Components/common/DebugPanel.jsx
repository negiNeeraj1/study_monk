import React, { useState } from "react";
import api from "../../services/api";

/**
 * Debug Panel component for development mode only
 * This component provides debugging tools and information
 */
const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);

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
    console.log("Testing API connection...");

    api
      .get("/health")
      .then((response) => {
        if (response.status === 200) {
          console.info("API connection successful!");
          return response.data;
        } else {
          console.error(
            `API connection failed with status: ${response.status}`
          );
          throw new Error(`Status ${response.status}`);
        }
      })
      .then((data) => {
        console.info("API health data:", data);
      })
      .catch((error) => {
        console.error("API connection error:", error);
      });
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
          background: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          padding: "5px 10px",
          cursor: "pointer",
          opacity: 0.7,
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        width: "400px",
        maxHeight: "500px",
        background: "#333",
        color: "#fff",
        borderRadius: "4px",
        padding: "10px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0 }}>Debug Panel</h3>
        <button
          onClick={togglePanel}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          X
        </button>
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
        <button
          onClick={toggleCapture}
          style={{
            background: isCapturing ? "#f44336" : "#4caf50",
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
            background: "#2196f3",
            border: "none",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Clear Logs
        </button>
        <button
          onClick={testApiConnection}
          style={{
            background: "#ff9800",
            border: "none",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Test API
        </button>
      </div>

      <div
        style={{
          overflowY: "auto",
          flex: 1,
          background: "#222",
          padding: "5px",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: "#888", padding: "10px" }}>
            No logs captured yet. Click "Start Capturing" to begin.
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                padding: "3px 5px",
                borderBottom: "1px solid #444",
                color:
                  log.type === "error"
                    ? "#f44336"
                    : log.type === "warn"
                    ? "#ff9800"
                    : log.type === "info"
                    ? "#2196f3"
                    : "#fff",
              }}
            >
              <span style={{ color: "#888" }}>
                {log.timestamp.toLocaleTimeString()}:
              </span>{" "}
              {log.content}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "10px", fontSize: "12px", color: "#888" }}>
        <div>Environment: {import.meta.env.MODE}</div>
        <div>
          API URL:{" "}
          {import.meta.env.VITE_API_URL ||
            "https://aistudy-xfxe.onrender.com/api"}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
