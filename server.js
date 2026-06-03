/**
 * Express Server with Strategic Logging Integration
 * Demonstrates comprehensive logging across all application layers
 */

const express = require('express');
const { log, logDebug, logInfo, logWarn, logError } = require('./logger');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Server startup with detailed context logging
app.listen(PORT, async () => {
    const startMessage = `Express server successfully initialized on port ${PORT} | Node environment: ${process.env.NODE_ENV || 'development'} | Timestamp: ${new Date().toISOString()}`;
    await logInfo('ServerBootstrap', startMessage);
});

process.on('uncaughtException', async (error) => {
    await logError('ProcessErrorHandler', `Uncaught exception detected | Error name: ${error.name} | Stack: ${error.stack.split('\n').slice(0, 3).join(' | ')}`);
});


// Request tracking middleware with detailed logging
app.use(async (req, res, next) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req.id = requestId;
    const userAgent = req.get('user-agent') || 'unknown';
    const contentLength = req.get('content-length') || '0';

    await logDebug(
        'RequestMiddleware',
        `[${requestId}] Incoming ${req.method} request to ${req.url} | IP: ${req.ip} | User-Agent: ${userAgent} | Content-Length: ${contentLength}B | Query params: ${JSON.stringify(req.query)}`
    );

    // Track response time
    const startTime = Date.now();
    res.on('finish', async () => {
        const duration = Date.now() - startTime;
        const statusMessage = res.statusCode >= 400 ? 'WARN' : 'INFO';
        await logDebug(
            'RequestMiddleware',
            `[${requestId}] Response sent | Status: ${res.statusCode} | Duration: ${duration}ms`
        );
    });

    next();
});
});


/**
 * POST /api/users/checkout
 * Handles e-commerce checkout with comprehensive logging at each decision point
 */
app.post('/api/users/checkout', async (req, res) => {
    const { userId, cartId, amount } = req.body;
    const requestId = req.id;

    // Log checkout initiation with full payload context
    await logInfo(
        'CheckoutService',
        `[${requestId}] Checkout initiated | UserID: ${userId} | CartID: ${cartId} | Amount: $${amount} | Headers: ${JSON.stringify({ 'content-type': req.get('content-type') })}`
    );

    try {
        // Validation phase logging
        if (!userId) {
            await logWarn(
                'CheckoutService',
                `[${requestId}] Validation failed | Missing userID | CartID: ${cartId} | Payload received: ${JSON.stringify(req.body)}`
            );
            return res.status(400).json({ error: 'Missing userId', requestId });
        }

        if (!cartId) {
            await logWarn(
                'CheckoutService',
                `[${requestId}] Validation failed | Missing cartId | UserID: ${userId} | Payload received: ${JSON.stringify(req.body)}`
            );
            return res.status(400).json({ error: 'Missing cartId', requestId });
        }

        if (!amount || amount <= 0) {
            await logWarn(
                'CheckoutService',
                `[${requestId}] Validation failed | Invalid amount: ${amount} | UserID: ${userId} | CartID: ${cartId}`
            );
            return res.status(400).json({ error: 'Invalid amount', requestId });
        }

        await logDebug(
            'CheckoutService',
            `[${requestId}] All validations passed | Processing payment for UserID: ${userId}`
        );

        // Payment processing phase
        await logDebug(
            'PaymentGateway',
            `[${requestId}] Initiating payment processor call | Amount: $${amount} | Currency: USD`
        );

        const paymentSuccess = true; // Simulated payment processor response

        if (paymentSuccess) {
            await logInfo(
                'PaymentGateway',
                `[${requestId}] Payment authorization successful | TransactionID: TXN-${Date.now()} | UserID: ${userId} | Amount: $${amount}`
            );

            await logDebug(
                'CheckoutService',
                `[${requestId}] Updating database | CartID: ${cartId} marked as completed`
            );

            const responsePayload = {
                message: 'Checkout successful',
                transactionId: `TXN-${Date.now()}`,
                amount: amount,
                requestId: requestId
            };

            await logInfo(
                'CheckoutService',
                `[${requestId}] Checkout completed successfully | Response: ${JSON.stringify(responsePayload)}`
            );

            res.status(200).json(responsePayload);
        } else {
            await logError(
                'PaymentGateway',
                `[${requestId}] Payment authorization failed | Reason: Declined by processor | UserID: ${userId}`
            );
            return res.status(402).json({ error: 'Payment declined', requestId });
        }
    } catch (error) {
        await logError(
            'CheckoutService',
            `[${requestId}] Critical error in checkout flow | UserID: ${userId} | CartID: ${cartId} | Error: ${error.message} | Stack trace (first 5 lines): ${error.stack.split('\n').slice(0, 5).join(' | ')}`
        );
        res.status(500).json({ error: 'Internal server error', requestId });
    }
});

/**
 * GET /health
 * Health check endpoint with operational logging
 */
app.get('/health', async (req, res) => {
    await logDebug(
        'HealthCheck',
        `[${req.id}] Health check requested | Uptime: ${Math.floor(process.uptime())}s | Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    );
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * 404 Handler with logging
 */
app.use(async (req, res) => {
    await logWarn(
        'RouteHandler',
        `[${req.id}] Route not found | Method: ${req.method} | Path: ${req.path} | Full URL: ${req.originalUrl}`
    );
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method,
        requestId: req.id
    });
});