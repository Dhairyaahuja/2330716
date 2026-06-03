/**
 * Reusable Frontend Logging Package
 * Provides structured logging with remote server integration for browser environments
 * 
 * Usage: await log('Frontend', 'INFO', 'ServiceName', 'Descriptive context-rich message');
 *        await logInfo('UserAuth', 'User logged in | Email: user@example.com');
 */

const TEST_SERVER_URL = 'https://4.224.186.213/evaluation-service/logs';
const LOG_TIMEOUT = 5000;
const ENABLE_CONSOLE = true;

/**
 * Get browser and session context
 * @returns {object} Browser context information
 */
const getBrowserContext = () => {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        documentReadyState: document.readyState,
        sessionDuration: Math.round((Date.now() - window.sessionStartTime) / 1000),
        url: window.location.href,
        referrer: document.referrer || 'direct'
    };
};

/**
 * Validates log parameters before sending
 * @param {string} stack - Infrastructure tier
 * @param {string} level - Log severity level
 * @param {string} pkg - Package/module name
 * @param {string} message - Log message
 * @returns {object} Validation result
 */
const validateLog = (stack, level, pkg, message) => {
    const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const errors = [];

    if (!stack || typeof stack !== 'string') errors.push('stack must be a non-empty string');
    if (!level || !validLevels.includes(level)) errors.push(`level must be one of: ${validLevels.join(', ')}`);
    if (!pkg || typeof pkg !== 'string') errors.push('package must be a non-empty string');
    if (!message || typeof message !== 'string') errors.push('message must be a non-empty string');

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Sends a structured log to the remote test server.
 * Provides automatic timestamp, structured format, and error resilience.
 * 
 * @param {string} stack - The infrastructure tier (e.g., 'Frontend', 'API', 'Storage')
 * @param {string} level - Severity level ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL')
 * @param {string} pkg - The logical package/module (e.g., 'CheckoutForm', 'UserService', 'PaymentUI')
 * @param {string} message - Descriptive, context-rich message with specific data
 * @returns {Promise<object>} Response status object
 */
const log = async (stack, level, pkg, message) => {
    // Validate inputs
    const validation = validateLog(stack, level, pkg, message);
    if (!validation.isValid) {
        console.error('[LOGGER ERROR] Invalid log parameters:', validation.errors);
        return { success: false, error: validation.errors };
    }

    const payload = {
        timestamp: new Date().toISOString(),
        stack: stack.trim(),
        level: level.toUpperCase(),
        package: pkg.trim(),
        message: message.trim(),
        environment: 'browser',
        browser: getBrowserContext()
    };

    // Local console output for browser developer tools
    if (ENABLE_CONSOLE) {
        const colorMap = {
            'DEBUG': 'color: #00BCD4; font-weight: bold;',      // Cyan
            'INFO': 'color: #4CAF50; font-weight: bold;',       // Green
            'WARN': 'color: #FF9800; font-weight: bold;',       // Orange
            'ERROR': 'color: #F44336; font-weight: bold;',      // Red
            'CRITICAL': 'color: #9C27B0; font-weight: bold;'    // Purple
        };
        const style = colorMap[level] || '';
        console.log(`%c[${payload.timestamp}] [${level}] ${pkg}: ${message}`, style);
    }

    try {
        // Fire-and-forget API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), LOG_TIMEOUT);

        const response = await fetch(TEST_SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(`%c[LOGGER WARN] Log server returned status ${response.status}`, 'color: #FF9800;');
        }

        return { success: true, status: response.status };
    } catch (networkError) {
        // Safe fallback: If the logging server goes down, don't crash the app
        if (networkError.name === 'AbortError') {
            console.warn(`%c[LOGGER WARN] Log server request timeout (${LOG_TIMEOUT}ms)`, 'color: #FF9800;');
        } else {
            console.warn(`%c[LOGGER WARN] Failed to reach log server: ${networkError.message}`, 'color: #FF9800;');
        }
        return { success: false, error: networkError.message };
    }
};

/**
 * Convenience functions for common log levels
 */
const logDebug = (pkg, message) => log('Frontend', 'DEBUG', pkg, message);
const logInfo = (pkg, message) => log('Frontend', 'INFO', pkg, message);
const logWarn = (pkg, message) => log('Frontend', 'WARN', pkg, message);
const logError = (pkg, message) => log('Frontend', 'ERROR', pkg, message);
const logCritical = (pkg, message) => log('Frontend', 'CRITICAL', pkg, message);

// Initialize session start time on page load
window.sessionStartTime = Date.now();