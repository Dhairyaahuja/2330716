/**
 * Reusable Notification System Package
 * Provides structured notifications with persistence, history tracking, and strategic logging
 * 
 * Usage: 
 *   NotificationManager.show('success', 'Order Confirmed', 'Your order has been placed');
 *   NotificationManager.error('Payment Failed', 'Your card was declined');
 *   NotificationManager.warning('Low Stock', 'Only 2 items left');
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.history = [];
        this.maxNotifications = 5;
        this.maxHistorySize = 100;
        this.defaultDuration = 5000;
        this.soundEnabled = true;
        this.initialized = false;

        await logInfo(
            'NotificationManager.constructor',
            `Notification system initialized | Max concurrent: ${this.maxNotifications} | History size: ${this.maxHistorySize}`
        );
    }

    /**
     * Show a notification with specified type
     * @param {string} type - 'success', 'error', 'warning', 'info', 'loading'
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {object} options - { duration, action, actionLabel, icon, persistent }
     */
    async show(type, title, message, options = {}) {
        const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const duration = options.duration !== undefined ? options.duration : this.defaultDuration;
        const timestamp = new Date().toISOString();

        // Validation
        if (!title || typeof title !== 'string') {
            await logWarn(
                'NotificationManager.show',
                `[${notificationId}] Invalid notification title | Type: ${type} | Title: ${title}`
            );
            throw new Error('Notification title is required');
        }

        if (!message || typeof message !== 'string') {
            await logWarn(
                'NotificationManager.show',
                `[${notificationId}] Invalid notification message | Type: ${type} | Message: ${message}`
            );
            throw new Error('Notification message is required');
        }

        const validTypes = ['success', 'error', 'warning', 'info', 'loading'];
        if (!validTypes.includes(type)) {
            await logWarn(
                'NotificationManager.show',
                `[${notificationId}] Invalid notification type: ${type}`
            );
            throw new Error(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
        }

        const notification = {
            id: notificationId,
            type,
            title,
            message,
            timestamp,
            duration,
            action: options.action || null,
            actionLabel: options.actionLabel || 'Action',
            icon: options.icon || this.getDefaultIcon(type),
            persistent: options.persistent || false,
            read: false,
            createdAt: Date.now()
        };

        await logDebug(
            'NotificationManager.show',
            `[${notificationId}] Creating notification | Type: ${type} | Title: ${title} | Duration: ${duration}ms`
        );

        // Add to active notifications
        this.notifications.push(notification);

        // Add to history
        this.addToHistory(notification);

        // Log to server
        await logInfo(
            'NotificationManager.show',
            `[${notificationId}] Notification displayed | Type: ${type} | Title: ${title} | Message: ${message.substring(0, 50)}...`
        );

        // Play sound if enabled
        if (this.soundEnabled && type !== 'loading') {
            this.playSound(type);
        }

        // Remove notification after duration (unless persistent)
        if (duration > 0 && !notification.persistent) {
            setTimeout(() => this.dismiss(notificationId), duration);
        }

        return notification;
    }

    /**
     * Show success notification
     */
    async success(title, message, options = {}) {
        await logDebug('NotificationManager.success', `Success notification | Title: ${title}`);
        return this.show('success', title, message, options);
    }

    /**
     * Show error notification
     */
    async error(title, message, options = {}) {
        await logWarn('NotificationManager.error', `Error notification | Title: ${title} | Message: ${message}`);
        return this.show('error', title, message, options);
    }

    /**
     * Show warning notification
     */
    async warning(title, message, options = {}) {
        await logWarn('NotificationManager.warning', `Warning notification | Title: ${title} | Message: ${message}`);
        return this.show('warning', title, message, options);
    }

    /**
     * Show info notification
     */
    async info(title, message, options = {}) {
        await logInfo('NotificationManager.info', `Info notification | Title: ${title}`);
        return this.show('info', title, message, options);
    }

    /**
     * Show loading notification
     */
    async loading(title, message, options = {}) {
        await logDebug('NotificationManager.loading', `Loading notification | Title: ${title}`);
        return this.show('loading', title, message, { ...options, persistent: true, duration: 0 });
    }

    /**
     * Dismiss a notification
     */
    async dismiss(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            const notification = this.notifications.splice(index, 1)[0];
            await logDebug(
                'NotificationManager.dismiss',
                `[${notificationId}] Notification dismissed | Type: ${notification.type}`
            );
        }
    }

    /**
     * Dismiss all notifications
     */
    async dismissAll() {
        const count = this.notifications.length;
        this.notifications = [];
        await logInfo(
            'NotificationManager.dismissAll',
            `Dismissed all notifications | Count: ${count}`
        );
    }

    /**
     * Add notification to history
     */
    async addToHistory(notification) {
        this.history.push({
            ...notification,
            read: true
        });

        // Keep history size manageable
        if (this.history.length > this.maxHistorySize) {
            const removed = this.history.splice(0, this.history.length - this.maxHistorySize);
            await logDebug(
                'NotificationManager.addToHistory',
                `History pruned | Removed: ${removed.length} | Total history: ${this.history.length}`
            );
        }
    }

    /**
     * Get all active notifications
     */
    getActive() {
        return this.notifications;
    }

    /**
     * Get notification history
     */
    getHistory(limit = 20) {
        return this.history.slice(-limit);
    }

    /**
     * Get notification by ID
     */
    getNotificationById(id) {
        return this.notifications.find(n => n.id === id) || this.history.find(n => n.id === id);
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        const notification = this.getNotificationById(notificationId);
        if (notification) {
            notification.read = true;
            await logDebug(
                'NotificationManager.markAsRead',
                `[${notificationId}] Notification marked as read`
            );
        }
    }

    /**
     * Perform notification action
     */
    async performAction(notificationId) {
        const notification = this.getNotificationById(notificationId);
        if (notification && notification.action) {
            await logInfo(
                'NotificationManager.performAction',
                `[${notificationId}] Action triggered | Title: ${notification.title}`
            );
            
            try {
                if (typeof notification.action === 'function') {
                    await notification.action();
                }
            } catch (error) {
                await logError(
                    'NotificationManager.performAction',
                    `[${notificationId}] Action failed | Error: ${error.message}`
                );
                throw error;
            }
        }
    }

    /**
     * Get statistics
     */
    async getStats() {
        const stats = {
            activeCount: this.notifications.length,
            historyCount: this.history.length,
            typeBreakdown: {},
            averageReadTime: 0
        };

        // Count by type
        this.history.forEach(n => {
            stats.typeBreakdown[n.type] = (stats.typeBreakdown[n.type] || 0) + 1;
        });

        await logInfo(
            'NotificationManager.getStats',
            `Stats retrieved | Active: ${stats.activeCount} | History: ${stats.historyCount} | Breakdown: ${JSON.stringify(stats.typeBreakdown)}`
        );

        return stats;
    }

    /**
     * Clear all history
     */
    async clearHistory() {
        const count = this.history.length;
        this.history = [];
        await logInfo(
            'NotificationManager.clearHistory',
            `History cleared | Removed: ${count} notifications`
        );
    }

    /**
     * Export notifications as JSON
     */
    async exportData() {
        const data = {
            exported: new Date().toISOString(),
            active: this.notifications,
            history: this.history,
            stats: await this.getStats()
        };

        await logInfo(
            'NotificationManager.exportData',
            `Data exported | Active: ${data.active.length} | History: ${data.history.length}`
        );

        return data;
    }

    /**
     * Get default icon based on type
     */
    getDefaultIcon(type) {
        const icons = {
            'success': '✓',
            'error': '✕',
            'warning': '⚠',
            'info': 'ℹ',
            'loading': '⟳'
        };
        return icons[type] || '•';
    }

    /**
     * Play sound notification
     */
    playSound(type) {
        // Create a simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const frequencies = {
                'success': 800,
                'error': 300,
                'warning': 600,
                'info': 500
            };

            oscillator.frequency.value = frequencies[type] || 500;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silently fail if audio context is not available
        }
    }

    /**
     * Enable/disable sounds
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        const status = enabled ? 'enabled' : 'disabled';
        logInfo('NotificationManager.setSoundEnabled', `Notification sounds ${status}`);
    }

    /**
     * Set notification duration
     */
    setDefaultDuration(duration) {
        this.defaultDuration = duration;
        logInfo('NotificationManager.setDefaultDuration', `Default duration set to ${duration}ms`);
    }
}

// Create global instance
window.NotificationManager = new NotificationManager();
