/**
 * E-Commerce App - Integrated with Notification System
 * Demonstrates real-world usage of notifications with logging
 */

// ============================================
// ENHANCED APP.JS WITH NOTIFICATIONS
// ============================================

// Initialize logging on page load
document.addEventListener('DOMContentLoaded', async () => {
    await logInfo(
        'PageLoad',
        `Application initialized | URL: ${window.location.href} | Referrer: ${document.referrer || 'direct'}`
    );

    // Show welcome notification
    await NotificationManager.info(
        'Welcome Back!',
        'Your session has been restored. Continue shopping!',
        { duration: 3000 }
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

// Global error handler with notification
window.addEventListener('error', async (event) => {
    await logError(
        'GlobalErrorHandler',
        `Uncaught JavaScript error | Message: ${event.message} | File: ${event.filename} | Line: ${event.lineno}:${event.colno}`
    );

    await NotificationManager.error(
        'Something Went Wrong',
        'An unexpected error occurred. Please refresh the page.',
        { duration: 0, persistent: true }
    );
});

// ============================================
// USER AUTHENTICATION SERVICE
// ============================================

const UserAuth = {
    login: async (email, password) => {
        const loadingNotif = await NotificationManager.loading(
            'Authenticating',
            'Verifying your credentials...'
        );

        await logDebug(
            'UserAuth.login',
            `Login attempt initiated | Email: ${email}`
        );

        try {
            // Validation phase
            if (!email || !email.includes('@')) {
                await NotificationManager.dismiss(loadingNotif.id);
                await NotificationManager.warning(
                    'Invalid Email',
                    'Please enter a valid email address.'
                );
                await logWarn(
                    'UserAuth.login',
                    `Validation failed | Invalid email format: ${email}`
                );
                throw new Error('Invalid email format');
            }

            if (!password || password.length < 6) {
                await NotificationManager.dismiss(loadingNotif.id);
                await NotificationManager.warning(
                    'Invalid Password',
                    'Password must be at least 6 characters.'
                );
                await logWarn(
                    'UserAuth.login',
                    `Validation failed | Password too short`
                );
                throw new Error('Password too short');
            }

            await logDebug(
                'UserAuth.login',
                `Validation passed | Sending credentials to auth server`
            );

            // Simulate API call
            await new Promise(r => setTimeout(r, 1500));

            // Simulated response
            const data = {
                token: 'auth-token-' + Math.random().toString(36).substr(2, 9),
                userId: 'USER-' + Math.random().toString(36).substr(2, 9)
            };

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.userId);

            await NotificationManager.dismiss(loadingNotif.id);

            await NotificationManager.success(
                'Login Successful',
                `Welcome back, ${email.split('@')[0]}!`
            );

            await logInfo(
                'UserAuth.login',
                `Login successful | UserID: ${data.userId}`
            );

            return { success: true, userId: data.userId };
        } catch (error) {
            await NotificationManager.dismiss(loadingNotif.id);
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

        await NotificationManager.info(
            'Logged Out',
            'You have been successfully logged out.'
        );

        await logInfo(
            'UserAuth.logout',
            `Logout completed | Cleared authentication tokens`
        );
    }
};

// ============================================
// SHOPPING CART SERVICE WITH NOTIFICATIONS
// ============================================

const ShoppingCart = {
    items: [],

    addItem: async (itemId, itemName, price, quantity) => {
        await logDebug(
            'ShoppingCart.addItem',
            `Add to cart initiated | ItemID: ${itemId} | Qty: ${quantity}`
        );

        try {
            // Validation
            if (!itemId || !itemName || price <= 0 || quantity <= 0) {
                await NotificationManager.warning(
                    'Invalid Item',
                    'Please check the item details and try again.'
                );
                await logWarn(
                    'ShoppingCart.addItem',
                    `Invalid parameters | ItemID: ${itemId} | Price: $${price}`
                );
                throw new Error('Invalid item parameters');
            }

            const existingItem = ShoppingCart.items.find(i => i.id === itemId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
                
                await NotificationManager.info(
                    'Quantity Updated',
                    `${itemName} quantity increased to ${existingItem.quantity}.`,
                    { duration: 2000 }
                );

                await logDebug(
                    'ShoppingCart.addItem',
                    `Quantity updated | ItemID: ${itemId} | New qty: ${existingItem.quantity}`
                );
            } else {
                ShoppingCart.items.push({ id: itemId, name: itemName, price, quantity });
                
                await NotificationManager.success(
                    'Added to Cart',
                    `${itemName} has been added to your cart.`,
                    {
                        duration: 3000,
                        actionLabel: 'Continue Shopping',
                        action: async () => {
                            await logInfo(
                                'UserAction',
                                'User clicked continue shopping from add to cart notification'
                            );
                        }
                    }
                );

                await logInfo(
                    'ShoppingCart.addItem',
                    `Item added | ItemID: ${itemId} | Cart items: ${ShoppingCart.items.length}`
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

        const item = ShoppingCart.items.find(i => i.id === itemId);
        ShoppingCart.items = ShoppingCart.items.filter(i => i.id !== itemId);

        await NotificationManager.info(
            'Item Removed',
            `${item.name} has been removed from your cart.`,
            { duration: 2000 }
        );

        await logInfo(
            'ShoppingCart.removeItem',
            `Item removed | ItemID: ${itemId} | Remaining items: ${ShoppingCart.items.length}`
        );
    },

    getTotal: () => ShoppingCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
};

// ============================================
// CHECKOUT SERVICE WITH COMPREHENSIVE NOTIFICATIONS
// ============================================

const CheckoutService = {
    processCheckout: async (userId, deliveryAddress, paymentMethod) => {
        const transactionId = `TXN-${Date.now()}`;
        const cartTotal = ShoppingCart.getTotal();
        const itemCount = ShoppingCart.items.length;

        // Initial loading notification
        const checkoutNotif = await NotificationManager.loading(
            'Processing Order',
            'Initializing checkout process...'
        );

        await logInfo(
            'CheckoutService.processCheckout',
            `[${transactionId}] Checkout initiated | UserID: ${userId} | Items: ${itemCount} | Total: $${cartTotal.toFixed(2)}`
        );

        try {
            // Validation phase
            if (!userId || !localStorage.getItem('authToken')) {
                await NotificationManager.dismiss(checkoutNotif.id);
                await NotificationManager.warning(
                    'Authentication Required',
                    'Please log in to complete your purchase.'
                );
                await logWarn(
                    'CheckoutService.processCheckout',
                    `[${transactionId}] User not authenticated`
                );
                throw new Error('User not authenticated');
            }

            if (ShoppingCart.items.length === 0) {
                await NotificationManager.dismiss(checkoutNotif.id);
                await NotificationManager.warning(
                    'Empty Cart',
                    'Please add items to your cart before checking out.'
                );
                await logWarn(
                    'CheckoutService.processCheckout',
                    `[${transactionId}] Cart is empty`
                );
                throw new Error('Cart is empty');
            }

            if (!deliveryAddress) {
                await NotificationManager.dismiss(checkoutNotif.id);
                await NotificationManager.warning(
                    'Address Required',
                    'Please provide a delivery address.'
                );
                await logWarn(
                    'CheckoutService.processCheckout',
                    `[${transactionId}] Missing delivery address`
                );
                throw new Error('Delivery address required');
            }

            // Payment processing phase
            await NotificationManager.dismiss(checkoutNotif.id);
            const paymentNotif = await NotificationManager.loading(
                'Processing Payment',
                `Charging $${cartTotal.toFixed(2)} to your ${paymentMethod}...`
            );

            await logDebug(
                'PaymentProcessor',
                `[${transactionId}] Payment processing started | Method: ${paymentMethod}`
            );

            // Simulate payment processing
            await new Promise(r => setTimeout(r, 2000));

            const paymentResult = await CheckoutService.processPayment(transactionId, cartTotal, paymentMethod);

            if (!paymentResult.success) {
                await NotificationManager.dismiss(paymentNotif.id);
                
                await NotificationManager.error(
                    'Payment Declined',
                    `Your ${paymentMethod} was declined. Please try a different payment method.`,
                    {
                        actionLabel: 'Try Again',
                        action: async () => {
                            await CheckoutService.processCheckout(userId, deliveryAddress, paymentMethod);
                        },
                        duration: 0,
                        persistent: true
                    }
                );

                await logError(
                    'PaymentProcessor',
                    `[${transactionId}] Payment declined | Reason: ${paymentResult.reason}`
                );
                throw new Error('Payment declined');
            }

            await logInfo(
                'PaymentProcessor',
                `[${transactionId}] Payment authorized | Amount: $${cartTotal.toFixed(2)}`
            );

            // Order creation phase
            await NotificationManager.dismiss(paymentNotif.id);
            const orderNotif = await NotificationManager.loading(
                'Creating Order',
                'Finalizing your order...'
            );

            await new Promise(r => setTimeout(r, 1500));

            const orderId = `ORD-${Date.now()}`;
            const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString();
            
            ShoppingCart.items = [];

            await NotificationManager.dismiss(orderNotif.id);

            // Success notification with action
            await NotificationManager.success(
                'Order Confirmed!',
                `Order #${orderId} placed successfully. Estimated delivery: ${estimatedDelivery}`,
                {
                    actionLabel: 'View Details',
                    action: async () => {
                        await logInfo(
                            'UserAction',
                            `User clicked view order details for ${orderId}`
                        );
                        await NotificationManager.info(
                            'Order Details',
                            `Order ID: ${orderId}\nTotal: $${cartTotal.toFixed(2)}\nDelivery: ${estimatedDelivery}`
                        );
                    },
                    duration: 0,
                    persistent: false
                }
            );

            await logInfo(
                'CheckoutService.processCheckout',
                `[${transactionId}] Checkout completed successfully | OrderID: ${orderId}`
            );

            return {
                success: true,
                transactionId,
                orderId,
                amount: cartTotal,
                estimatedDelivery
            };

        } catch (error) {
            await NotificationManager.dismiss(checkoutNotif.id);

            await logError(
                'CheckoutService.processCheckout',
                `[${transactionId}] Checkout failed | Error: ${error.message}`
            );

            throw error;
        }
    },

    processPayment: async (transactionId, amount, method) => {
        await logDebug(
            'PaymentProcessor.API',
            `[${transactionId}] Calling payment gateway API | Amount: $${amount}`
        );

        try {
            await new Promise(r => setTimeout(r, 1000));

            // Simulated payment result (90% success)
            const success = Math.random() > 0.1;
            if (success) {
                return { 
                    success: true, 
                    authCode: `AUTH-${Math.random().toString(36).substr(2, 9)}` 
                };
            } else {
                const reasons = ['Insufficient funds', 'Invalid card', 'Expired card'];
                return { 
                    success: false, 
                    reason: reasons[Math.floor(Math.random() * reasons.length)] 
                };
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

// ============================================
// WISHLIST SERVICE WITH NOTIFICATIONS
// ============================================

const WishlistService = {
    items: [],

    addToWishlist: async (itemId, itemName) => {
        if (!this.items.find(i => i.id === itemId)) {
            this.items.push({ id: itemId, name: itemName, addedAt: new Date() });

            await NotificationManager.info(
                'Added to Wishlist',
                `${itemName} has been added to your wishlist.`,
                { duration: 2000 }
            );

            await logInfo(
                'WishlistService.addToWishlist',
                `Item added | ItemID: ${itemId} | Total wishlist items: ${this.items.length}`
            );
        }
    },

    removeFromWishlist: async (itemId) => {
        const item = this.items.find(i => i.id === itemId);
        this.items = this.items.filter(i => i.id !== itemId);

        await NotificationManager.info(
            'Removed from Wishlist',
            `${item.name} has been removed from your wishlist.`,
            { duration: 2000 }
        );

        await logInfo(
            'WishlistService.removeFromWishlist',
            `Item removed | ItemID: ${itemId}`
        );
    }
};

// ============================================
// NOTIFICATION HELPER FUNCTIONS
// ============================================

/**
 * Show a confirmation dialog with notifications
 */
async function showConfirmation(title, message, onConfirm, onCancel) {
    const notif = await NotificationManager.show('warning', title, message, {
        actionLabel: 'Confirm',
        action: async () => {
            await NotificationManager.dismiss(notif.id);
            if (onConfirm) await onConfirm();
        },
        duration: 0,
        persistent: true
    });

    return notif;
}

/**
 * Show a loading state with automatic completion
 */
async function showAsyncOperation(title, message, asyncFn) {
    const loadingNotif = await NotificationManager.loading(title, message);

    try {
        const result = await asyncFn();
        await NotificationManager.dismiss(loadingNotif.id);
        return result;
    } catch (error) {
        await NotificationManager.dismiss(loadingNotif.id);
        throw error;
    }
}

/**
 * Queue multiple notifications
 */
async function queueNotifications(notifications) {
    for (const notif of notifications) {
        await NotificationManager.show(
            notif.type,
            notif.title,
            notif.message,
            notif.options || {}
        );
        // Stagger notifications by 500ms
        await new Promise(r => setTimeout(r, 500));
    }
}
