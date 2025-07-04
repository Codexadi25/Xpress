let errorLogs = []; // In-memory array for simplicity. Use a real database for production.

const logError = (apiName, error, statusCode = 500) => {
    const errorEntry = {
        timestamp: new Date().toISOString(),
        api: apiName,
        message: error.message || 'An unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined, // Log stack in dev
        statusCode: statusCode
    };
    errorLogs.push(errorEntry);
    console.error(`SERVER ERROR [${apiName}]:`, error.message); // Log to server console
    if (errorLogs.length > 100) { // Keep logs from growing infinitely
        errorLogs = errorLogs.slice(errorLogs.length - 100);
    }
};

// Export errorLogs for the dashboard route to access
const getErrorLogs = () => errorLogs.reverse(); // Display latest errors first

module.exports = {
    logError,
    getErrorLogs
};