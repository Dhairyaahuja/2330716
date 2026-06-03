/**
 * Frontend E-commerce Application with Strategic Logging Integration
 * Demonstrates comprehensive logging across user interactions, forms, API calls, and errors
 */

// Initialize logging on page load
document.addEventListener('DOMContentLoaded', async () => {
    await logInfo(
        'PageLoad',
        `Application initialized | URL: ${window.location.href} | Referrer: ${document.referrer || 'direct'}`
    );
});

// Log when user leaves the page
window.addEventListener('beforeunload', async () => {
    const sessionDuration = Math.round((Date.now() - window.sessionStartTime) / 1000);
    await logInfo(
        'SessionEnd',
        `User session ended | Duration: ${sessionDuration}s | Page: ${window.location.pathname}`
    );
});

// Global error handler with detailed logging
window.addEventListener('error', async (event) => {
    await logError(
        'GlobalErrorHandler',
        `Uncaught JavaScript error | Message: ${event.message} | File: ${event.filename} | Line: ${event.lineno}:${event.colno}`
    );
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', async (event) => {
    await logError(
        'PromiseRejectionHandler',
        `Unhandled promise rejection | Reason: ${event.reason}`
    );
});

/**
 * User Authentication Service
 */
const UserAuth = {
    login: async (email, password) => {
        await logDebug(
            'UserAuth.login',
            `Login attempt initiated | Email: ${email} | Browser: ${navigator.userAgent.substring(0, 50)}`
        );

        try {
            if (!email || !email.includes('@')) {
                await logWarn(
                    'UserAuth.login',
                    `Validation failed | Invalid email format: ${email}`
                );
                throw new Error('Invalid email format');
            }

            if (!password || password.length < 6) {
                await logWarn(
                    'UserAuth.login',
                    `Validation failed | Password too short for email: ${email}`
                );
                throw new Error('Password must be at least 6 characters');
            }

            await logDebug(
                'UserAuth.login',
                `Validation passed | Sending credentials to auth server`
            );

            // Simulated API call
            const response = await fetch('https://api.example.com/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                await logError(
                    'UserAuth.login',
                    `Authentication failed | Status: ${response.status} | Email: ${email}`
                );
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.userId);

            await logInfo(
                'UserAuth.login',
                `Login successful | UserID: ${data.userId} | Token stored in localStorage`
            );

            return { success: true, userId: data.userId };
        } catch (error) {
            await logError(
                'UserAuth.login',
                `Login failed | Email: ${email} | Error: ${error.message}`
            );
            throw error;
        }
    },

    logout: async () => {
        const userId = localStorage.getItem('userId');
        await logInfo(
            'UserAuth.logout',
            `Logout initiated | UserID: ${userId}`
        );

        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');

        await logInfo(
            'UserAuth.logout',
            `Logout completed | Cleared authentication tokens`
        );
    }
};

/**
 * Shopping Cart Service
 */
const ShoppingCart = {
    items: [],

    addItem: async (itemId, itemName, price, quantity) => {
        await logDebug(
            'ShoppingCart.addItem',
            `Add to cart initiated | ItemID: ${itemId} | Name: ${itemName} | Price: $${price} | Qty: ${quantity}`
        );

        try {
            if (!itemId || !itemName || price <= 0 || quantity <= 0) {
                await logWarn(
                    'ShoppingCart.addItem',
                    `Invalid item parameters | ItemID: ${itemId} | Price: $${price} | Qty: ${quantity}`
                );
                throw new Error('Invalid item parameters');
            }

            const existingItem = ShoppingCart.items.find(i => i.id === itemId);
            if (existingItem) {
                existingItem.quantity += quantity;
                await logDebug(
                    'ShoppingCart.addItem',
                    `Item quantity updated | ItemID: ${itemId} | New qty: ${existingItem.quantity}`
                );
            } else {
                ShoppingCart.items.push({ id: itemId, name: itemName, price, quantity });
                await logInfo(
                    'ShoppingCart.addItem',
                    `Item added to cart | ItemID: ${itemId} | Cart now has ${ShoppingCart.items.length} items`
                );
            }
        } catch (error) {
            await logError(
                'ShoppingCart.addItem',
                `Failed to add item | ItemID: ${itemId} | Error: ${error.message}`
            );
            throw error;
        }
    },

    removeItem: async (itemId) => {
        await logDebug(
            'ShoppingCart.removeItem',
            `Remove from cart initiated | ItemID: ${itemId}`
        );

        ShoppingCart.items = ShoppingCart.items.filter(i => i.id !== itemId);

        await logInfo(
            'ShoppingCart.removeItem',
            `Item removed from cart | ItemID: ${itemId} | Cart now has ${ShoppingCart.items.length} items`
        );
    },

    getTotal: () => ShoppingCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
};

/**
 * Checkout Service with comprehensive logging
 */
const CheckoutService = {
    processCheckout: async (userId, deliveryAddress, paymentMethod) => {
        const transactionId = `TXN-${Date.now()}`;
        const cartTotal = ShoppingCart.getTotal();
        const itemCount = ShoppingCart.items.length;

        await logInfo(
            'CheckoutService.processCheckout',
            `Checkout initiated | TransactionID: ${transactionId} | UserID: ${userId} | Items: ${itemCount} | Total: $${cartTotal.toFixed(2)}`
        );

        try {
            // Validation phase
            if (!userId || !localStorage.getItem('authToken')) {
                await logWarn(
                    'CheckoutService.processCheckout',
                    `[${transactionId}] Validation failed | User not authenticated`
                );
                throw new Error('User not authenticated');
            }

            if (ShoppingCart.items.length === 0) {
                await logWarn(
                    'CheckoutService.processCheckout',
                    `[${transactionId}] Validation failed | Cart is empty`
                );
                throw new Error('Cart is empty');
            }

            if (!deliveryAddress) {
                await logWarn(
                    'CheckoutService.processCheckout',
                    `[${transactionId}] Validation failed | Delivery address not provided`
                );
                throw new Error('Delivery address required');
            }

            await logDebug(
                'CheckoutService.processCheckout',
                `[${transactionId}] All validations passed | Processing payment`
            );

            // Payment processing phase
            await logDebug(
                'PaymentProcessor',
                `[${transactionId}] Payment processing started | Method: ${paymentMethod} | Amount: $${cartTotal.toFixed(2)}`
            );

            const paymentResult = await CheckoutService.processPayment(transactionId, cartTotal, paymentMethod);

            if (!paymentResult.success) {
                await logError(
                    'PaymentProcessor',
                    `[${transactionId}] Payment authorization declined | Reason: ${paymentResult.reason}`
                );
                throw new Error('Payment declined');
            }

            await logInfo(
                'PaymentProcessor',
                `[${transactionId}] Payment authorized | Amount: $${cartTotal.toFixed(2)} | Auth code: ${paymentResult.authCode}`
            );

            // Order creation phase
            await logDebug(
                'OrderService',
                `[${transactionId}] Creating order record | UserID: ${userId} | Delivery: ${deliveryAddress}`
            );

            const orderId = `ORD-${Date.now()}`;
            ShoppingCart.items = [];

            await logInfo(
                'CheckoutService.processCheckout',
                `[${transactionId}] Checkout completed successfully | OrderID: ${orderId} | Items shipped: ${itemCount}`
            );

            return {
                success: true,
                transactionId,
                orderId,
                amount: cartTotal,
                estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
            };
        } catch (error) {
            await logError(
                'CheckoutService.processCheckout',
                `[${transactionId}] Checkout failed | UserID: ${userId} | Error: ${error.message}`
            );
            throw error;
        }
    },

    processPayment: async (transactionId, amount, method) => {
        // Simulated payment API call
        await logDebug(
            'PaymentProcessor.API',
            `[${transactionId}] Calling payment gateway API | Method: ${method} | Amount: $${amount}`
        );

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const success = Math.random() > 0.1; // 90% success rate
            if (success) {
                return { success: true, authCode: `AUTH-${Math.random().toString(36).substr(2, 9)}` };
            } else {
                return { success: false, reason: 'Insufficient funds' };
            }
        } catch (error) {
            await logError(
                'PaymentProcessor.API',
                `[${transactionId}] Payment gateway error | Error: ${error.message}`
            );
            throw error;
        }
    }
};
