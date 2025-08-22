// Frontend debugger utility

/**
 * Enhanced debugging utility for the Frontend
 */
class AppDebugger {
  constructor() {
    this.isEnabled = true;
    this.logLevel = localStorage.getItem('debugLogLevel') || 'info';
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
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
      debug: console.debug
    };

    // Add timestamp and caller info to logs
    console.log = (...args) => {
      if (this.shouldLog('info')) {
        originalConsole.log(
          `%c[LOG ${this.getTimestamp()}]`,
          'color: #3498db',
          ...args
        );
      }
    };

    console.info = (...args) => {
      if (this.shouldLog('info')) {
        originalConsole.info(
          `%c[INFO ${this.getTimestamp()}]`,
          'color: #2ecc71',
          ...args
        );
      }
    };

    console.warn = (...args) => {
      if (this.shouldLog('warn')) {
        originalConsole.warn(
          `%c[WARN ${this.getTimestamp()}]`,
          'color: #f39c12',
          ...args
        );
      }
    };

    console.error = (...args) => {
      if (this.shouldLog('error')) {
        originalConsole.error(
          `%c[ERROR ${this.getTimestamp()}]`,
          'color: #e74c3c',
          ...args,
          this.getStackTrace()
        );
      }
    };

    console.debug = (...args) => {
      if (this.shouldLog('debug')) {
        originalConsole.debug(
          `%c[DEBUG ${this.getTimestamp()}]`,
          'color: #9b59b6',
          ...args
        );
      }
    };

    // Add global error handling
    window.addEventListener('error', (event) => {
      this.logError('Uncaught Error', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason);
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
    return now.toISOString().split('T')[1].split('Z')[0];
  }

  getStackTrace() {
    try {
      throw new Error('Stack trace');
    } catch (error) {
      return error.stack.split('\n').slice(2).join('\n');
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
      
      console.debug(`🌐 Fetch Request: ${options.method || 'GET'} ${url}`);
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (response.ok) {
          console.debug(`✅ Fetch Success: ${options.method || 'GET'} ${url} (${duration.toFixed(2)}ms)`);
        } else {
          console.warn(`❌ Fetch Failed: ${options.method || 'GET'} ${url} - Status ${response.status} (${duration.toFixed(2)}ms)`);
        }
        
        // Clone the response so we can still use it in the app
        return response.clone();
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.error(`❌ Fetch Error: ${options.method || 'GET'} ${url} (${duration.toFixed(2)}ms)`, error);
        throw error;
      }
    };

    // Monitor axios if it's being used
    if (window.axios) {
      const originalAxiosRequest = window.axios.request;
      
      window.axios.request = async (config) => {
        const startTime = performance.now();
        console.debug(`🌐 Axios Request: ${config.method || 'GET'} ${config.url}`);
        
        try {
          const response = await originalAxiosRequest(config);
          const endTime = performance.now();
          const duration = endTime - startTime;
          console.debug(`✅ Axios Success: ${config.method || 'GET'} ${config.url} (${duration.toFixed(2)}ms)`);
          return response;
        } catch (error) {
          const endTime = performance.now();
          const duration = endTime - startTime;
          console.error(`❌ Axios Error: ${config.method || 'GET'} ${config.url} (${duration.toFixed(2)}ms)`, error);
          throw error;
        }
      };
    }
  }

  // Set log level dynamically
  setLogLevel(level) {
    if (this.logLevels[level] !== undefined) {
      this.logLevel = level;
      localStorage.setItem('debugLogLevel', level);
      console.info(`Log level set to: ${level}`);
    } else {
      console.warn(`Invalid log level: ${level}. Valid levels are: ${Object.keys(this.logLevels).join(', ')}`);
    }
  }

  // Enable/disable debugging
  enable() {
    this.isEnabled = true;
    localStorage.setItem('debugEnabled', 'true');
    console.info('Debugging enabled');
  }

  disable() {
    this.isEnabled = false;
    localStorage.setItem('debugEnabled', 'false');
    console.info('Debugging disabled');
  }

  // Component rendering debugger
  logRender(componentName, props) {
    if (this.shouldLog('debug')) {
      console.debug(`🔄 Rendering ${componentName}`, props);
    }
  }

  // State change debugger
  logStateChange(componentName, prevState, newState) {
    if (this.shouldLog('debug')) {
      console.debug(`🔄 State changed in ${componentName}`, { 
        prev: prevState, 
        new: newState,
        changed: this.getChangedProperties(prevState, newState)
      });
    }
  }

  getChangedProperties(prevObj, newObj) {
    const changes = {};
    
    // Find changed or added properties
    Object.keys(newObj).forEach(key => {
      if (JSON.stringify(prevObj[key]) !== JSON.stringify(newObj[key])) {
        changes[key] = {
          from: prevObj[key],
          to: newObj[key]
        };
      }
    });
    
    // Find removed properties
    Object.keys(prevObj).forEach(key => {
      if (newObj[key] === undefined) {
        changes[key] = {
          from: prevObj[key],
          to: undefined
        };
      }
    });
    
    return changes;
  }
}

// Create and export singleton instance
export const appDebugger = new AppDebugger();

// Export a React hook for component debugging
export function useDebugger(componentName) {
  return {
    logRender: (props) => appDebugger.logRender(componentName, props),
    logStateChange: (prevState, newState) => appDebugger.logStateChange(componentName, prevState, newState)
  };
}

// Expose debugger to window for console access
window.appDebugger = appDebugger;

export default appDebugger;
