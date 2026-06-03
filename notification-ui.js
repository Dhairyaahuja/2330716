/**
 * Notification UI Component
 * Renders and manages the visual display of notifications
 */

class NotificationUI {
    constructor(containerId = 'notification-container') {
        this.containerId = containerId;
        this.container = null;
        this.notificationElements = new Map();

        logInfo(
            'NotificationUI.constructor',
            `Notification UI initialized | Container: ${containerId}`
        );

        this.initializeContainer();
    }

    /**
     * Initialize the notification container
     */
    initializeContainer() {
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            container.className = 'notification-container';
            document.body.appendChild(container);

            logDebug(
                'NotificationUI.initializeContainer',
                `Notification container created and appended to body`
            );
        }
        this.container = container;
    }

    /**
     * Display a notification
     */
    async displayNotification(notification) {
        const notifElement = this.createNotificationElement(notification);
        this.container.appendChild(notifElement);
        this.notificationElements.set(notification.id, notifElement);

        await logDebug(
            'NotificationUI.displayNotification',
            `[${notification.id}] Notification element created and displayed | Type: ${notification.type}`
        );

        // Trigger animation
        setTimeout(() => {
            notifElement.classList.add('show');
        }, 10);

        // Listen for removal
        if (notification.duration > 0 && !notification.persistent) {
            setTimeout(() => this.removeNotification(notification.id), notification.duration + 300);
        }
    }

    /**
     * Create notification element
     */
    createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = `notification notification-${notification.type}`;
        div.id = `notification-${notification.id}`;

        const typeColor = {
            'success': '#4caf50',
            'error': '#f44336',
            'warning': '#ff9800',
            'info': '#2196f3',
            'loading': '#9c27b0'
        };

        div.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon" style="color: ${typeColor[notification.type]};">
                    ${this.getAnimatedIcon(notification.type)}
                </div>
                <div class="notification-body">
                    <h4 class="notification-title">${this.escapeHtml(notification.title)}</h4>
                    <p class="notification-message">${this.escapeHtml(notification.message)}</p>
                    ${notification.action ? `<button class="notification-action" onclick="NotificationUI.instance.performAction('${notification.id}')">
                        ${this.escapeHtml(notification.actionLabel)}
                    </button>` : ''}
                </div>
                <button class="notification-close" onclick="NotificationUI.instance.removeNotification('${notification.id}')" title="Close">
                    ✕
                </button>
            </div>
        `;

        return div;
    }

    /**
     * Get animated icon based on type
     */
    getAnimatedIcon(type) {
        const icons = {
            'success': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            'error': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            'warning': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            'info': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            'loading': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinner"><circle cx="12" cy="12" r="10"></circle></svg>'
        };
        return icons[type] || icons['info'];
    }

    /**
     * Remove notification
     */
    async removeNotification(notificationId) {
        const element = this.notificationElements.get(notificationId);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                element.remove();
                this.notificationElements.delete(notificationId);

                logDebug(
                    'NotificationUI.removeNotification',
                    `[${notificationId}] Notification element removed from DOM`
                );
            }, 300);
        }
    }

    /**
     * Perform notification action
     */
    async performAction(notificationId) {
        await logDebug(
            'NotificationUI.performAction',
            `[${notificationId}] Performing notification action`
        );

        try {
            await NotificationManager.performAction(notificationId);
        } catch (error) {
            await logError(
                'NotificationUI.performAction',
                `[${notificationId}] Action error: ${error.message}`
            );
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clear all notifications from UI
     */
    async clearAll() {
        const count = this.notificationElements.size;
        for (const id of this.notificationElements.keys()) {
            await this.removeNotification(id);
        }

        await logInfo(
            'NotificationUI.clearAll',
            `Cleared ${count} notification elements from UI`
        );
    }
}

// Create global instance
NotificationUI.instance = new NotificationUI();

// Listen for notifications from NotificationManager
if (window.NotificationManager) {
    const originalShow = NotificationManager.show.bind(NotificationManager);
    NotificationManager.show = async function(type, title, message, options) {
        const notification = await originalShow(type, title, message, options);
        await NotificationUI.instance.displayNotification(notification);
        return notification;
    };
}
