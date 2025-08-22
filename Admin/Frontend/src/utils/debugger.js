// Admin Frontend debugger utility

/**
 * Enhanced debugging utility for the Admin Frontend
 */
class AdminDebugger {
  constructor() {
    this.isEnabled = true;
    this.logLevel = localStorage.getItem("adminDebugLogLevel") || "info";
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4,
    };

    // Initialize
    this.init();
  }

  init() {
    // Override console methods to add additional context
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    // Add timestamp and caller info to logs
    console.log = (...args) => {
      if (this.shouldLog("info")) {
        originalConsole.log(
          `%c[ADMIN LOG ${this.getTimestamp()}]`,
          "color: #3498db",
          ...args
        );
      }
    };

    console.info = (...args) => {
      if (this.shouldLog("info")) {
        originalConsole.info(
          `%c[ADMIN INFO ${this.getTimestamp()}]`,
          "color: #2ecc71",
          ...args
        );
      }
    };

    console.warn = (...args) => {
      if (this.shouldLog("warn")) {
        originalConsole.warn(
          `%c[ADMIN WARN ${this.getTimestamp()}]`,
          "color: #f39c12",
          ...args
        );
      }
    };

    console.error = (...args) => {
      if (this.shouldLog("error")) {
        originalConsole.error(
          `%c[ADMIN ERROR ${this.getTimestamp()}]`,
          "color: #e74c3c",
          ...args,
          this.getStackTrace()
        );
      }
    };

    console.debug = (...args) => {
      if (this.shouldLog("debug")) {
        originalConsole.debug(
          `%c[ADMIN DEBUG ${this.getTimestamp()}]`,
          "color: #9b59b6",
          ...args
        );
      }
    };

    // Add global error handling
    window.addEventListener("error", (event) => {
      this.logError("Uncaught Error", event.error);
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.logError("Unhandled Promise Rejection", event.reason);
    });

    // Add network request monitoring
    this.monitorNetworkRequests();
  }

  shouldLog(level) {
    if (!this.isEnabled) return false;
    return this.logLevels[level] <= this.logLevels[this.logLevel];
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().split("T")[1].split("Z")[0];
  }

  getStackTrace() {
    try {
      throw new Error("Stack trace");
    } catch (error) {
      return error.stack.split("\n").slice(2).join("\n");
    }
  }

  logError(type, error) {
    console.error(`${type}:`, error);

    // You could send this to a logging service
    // this.sendToLoggingService({
    //   type,
    //   message: error.message,
    //   stack: error.stack,
    //   timestamp: new Date()
    // });
  }

  monitorNetworkRequests() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const url = args[0];
      const options = args[1] || {};
      const startTime = performance.now();

      console.debug(
        `🌐 Admin Fetch Request: ${options.method || "GET"} ${url}`
      );

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (response.ok) {
          console.debug(
            `✅ Admin Fetch Success: ${
              options.method || "GET"
            } ${url} (${duration.toFixed(2)}ms)`
          );
        } else {
          console.warn(
            `❌ Admin Fetch Failed: ${
              options.method || "GET"
            } ${url} - Status ${response.status} (${duration.toFixed(2)}ms)`
          );
          // Try to get response body for more debug info
          try {
            const clonedResponse = response.clone();
            clonedResponse.text().then((text) => {
              try {
                const data = JSON.parse(text);
                console.warn("Response data:", data);
              } catch (e) {
                console.warn("Response text:", text);
              }
            });
          } catch (e) {
            console.warn("Could not read response body");
          }
        }

        // Clone the response so we can still use it in the app
        return response.clone();
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.error(
          `❌ Admin Fetch Error: ${
            options.method || "GET"
          } ${url} (${duration.toFixed(2)}ms)`,
          error
        );
        throw error;
      }
    };

    // Monitor API calls from our service
    if (window.adminAPI) {
      const originalApiCall = window.adminAPI.apiCall;

      window.adminAPI.apiCall = async (endpoint, options) => {
        const startTime = performance.now();
        console.debug(
          `🌐 Admin API Call: ${options?.method || "GET"} ${endpoint}`
        );

        try {
          const response = await originalApiCall.call(
            window.adminAPI,
            endpoint,
            options
          );
          const endTime = performance.now();
          const duration = endTime - startTime;
          console.debug(
            `✅ Admin API Success: ${
              options?.method || "GET"
            } ${endpoint} (${duration.toFixed(2)}ms)`
          );
          return response;
        } catch (error) {
          const endTime = performance.now();
          const duration = endTime - startTime;
          console.error(
            `❌ Admin API Error: ${
              options?.method || "GET"
            } ${endpoint} (${duration.toFixed(2)}ms)`,
            error
          );
          throw error;
        }
      };
    }
  }

  // Set log level dynamically
  setLogLevel(level) {
    if (this.logLevels[level] !== undefined) {
      this.logLevel = level;
      localStorage.setItem("adminDebugLogLevel", level);
      console.info(`Admin log level set to: ${level}`);
    } else {
      console.warn(
        `Invalid log level: ${level}. Valid levels are: ${Object.keys(
          this.logLevels
        ).join(", ")}`
      );
    }
  }

  // Enable/disable debugging
  enable() {
    this.isEnabled = true;
    localStorage.setItem("adminDebugEnabled", "true");
    console.info("Admin debugging enabled");
  }

  disable() {
    this.isEnabled = false;
    localStorage.setItem("adminDebugEnabled", "false");
    console.info("Admin debugging disabled");
  }

  // Component rendering debugger
  logRender(componentName, props) {
    if (this.shouldLog("debug")) {
      console.debug(`🔄 Admin Rendering ${componentName}`, props);
    }
  }

  // State change debugger
  logStateChange(componentName, prevState, newState) {
    if (this.shouldLog("debug")) {
      console.debug(`🔄 Admin State changed in ${componentName}`, {
        prev: prevState,
        new: newState,
        changed: this.getChangedProperties(prevState, newState),
      });
    }
  }

  getChangedProperties(prevObj, newObj) {
    const changes = {};

    // Find changed or added properties
    Object.keys(newObj).forEach((key) => {
      if (JSON.stringify(prevObj[key]) !== JSON.stringify(newObj[key])) {
        changes[key] = {
          from: prevObj[key],
          to: newObj[key],
        };
      }
    });

    // Find removed properties
    Object.keys(prevObj).forEach((key) => {
      if (newObj[key] === undefined) {
        changes[key] = {
          from: prevObj[key],
          to: undefined,
        };
      }
    });

    return changes;
  }

  // CORS debugging helper
  checkCorsConfig() {
    console.info("🔍 Checking CORS configuration...");

    const adminApiUrl = "http://localhost:5000/api/health";
    console.info(`Testing connection to Admin API: ${adminApiUrl}`);

    fetch(adminApiUrl)
      .then((response) => {
        if (response.ok) {
          console.info("✅ Admin API connection successful!");
          return response.json();
        } else {
          console.error(
            `❌ Admin API connection failed with status: ${response.status}`
          );
          throw new Error(`Status ${response.status}`);
        }
      })
      .then((data) => {
        console.info("📊 Admin API health data:", data);
      })
      .catch((error) => {
        console.error("❌ Admin API connection error:", error);
        console.info("💡 Possible solutions:");
        console.info("1. Make sure Backend is running on port 5000");
        console.info("2. Check CORS configuration in Admin Backend");
        console.info(
          "3. Verify that http://localhost:3001 is in the allowed origins list"
        );
      });
  }
}

// Create and export singleton instance
export const adminAppDebugger = new AdminDebugger();

// Export a React hook for component debugging
export function useAdminDebugger(componentName) {
  return {
    logRender: (props) => adminAppDebugger.logRender(componentName, props),
    logStateChange: (prevState, newState) =>
      adminAppDebugger.logStateChange(componentName, prevState, newState),
  };
}

// Expose debugger to window for console access
window.adminDebugger = adminAppDebugger;

export default adminAppDebugger;
