# Notification System - Quick Reference Guide

## 🚀 Quick Start (30 seconds)

### 1. Add to HTML
```html
<script src="logger.js"></script>
<script src="notification-manager.js"></script>
<script src="notification-ui.js"></script>
```

### 2. Show Notification
```javascript
// Success
await NotificationManager.success('Great!', 'Operation completed');

// Error
await NotificationManager.error('Oops!', 'Something went wrong');

// Loading
const notif = await NotificationManager.loading('Processing...', 'Please wait');
// ... do work ...
await NotificationManager.dismiss(notif.id);
```

---

## 📚 API Cheat Sheet

### Basic Methods

```javascript
// Show with type
await NotificationManager.show(type, title, message, options)

// Convenience functions
await NotificationManager.success(title, message, options)
await NotificationManager.error(title, message, options)
await NotificationManager.warning(title, message, options)
await NotificationManager.info(title, message, options)
await NotificationManager.loading(title, message, options)

// Management
await NotificationManager.dismiss(id)
await NotificationManager.dismissAll()
NotificationManager.getActive()
NotificationManager.getHistory(limit)
NotificationManager.getNotificationById(id)
```

### Configuration

```javascript
NotificationManager.setSoundEnabled(true)      // Enable/disable sounds
NotificationManager.setDefaultDuration(5000)   // Set default timeout
```

### Analytics

```javascript
const stats = await NotificationManager.getStats()
const data = await NotificationManager.exportData()
await NotificationManager.clearHistory()
```

---

## 🎨 Notification Types

| Type | Color | Usage |
|------|-------|-------|
| `success` | Green | Successful operations |
| `error` | Red | Failures, errors |
| `warning` | Orange | Warnings, cautions |
| `info` | Blue | Information, hints |
| `loading` | Purple | Async operations |

---

## 📋 Common Patterns

### Pattern 1: Simple Success
```javascript
await NotificationManager.success(
    'Payment Complete',
    'Your order has been confirmed.'
);
```

### Pattern 2: Loading with Result
```javascript
const loading = await NotificationManager.loading(
    'Saving',
    'Please wait...'
);

try {
    const result = await saveData();
    await NotificationManager.dismiss(loading.id);
    
    await NotificationManager.success(
        'Saved',
        'Data saved successfully.'
    );
} catch (error) {
    await NotificationManager.dismiss(loading.id);
    await NotificationManager.error(
        'Error',
        error.message
    );
}
```

### Pattern 3: With Action Button
```javascript
await NotificationManager.error(
    'Connection Lost',
    'Check your internet connection.',
    {
        actionLabel: 'Retry',
        action: async () => {
            // Handle retry
        },
        duration: 0,
        persistent: true
    }
);
```

### Pattern 4: Persistent Notification
```javascript
await NotificationManager.show('warning', 'Alert', 'Important message', {
    duration: 0,        // Never auto-dismiss
    persistent: true,
    actionLabel: 'Dismiss',
    action: async () => {
        // Handle action
    }
});
```

### Pattern 5: Queue Multiple
```javascript
const notifications = [
    { type: 'info', title: 'Step 1', message: 'Processing...' },
    { type: 'info', title: 'Step 2', message: 'Validating...' },
    { type: 'success', title: 'Done', message: 'All complete!' }
];

for (const n of notifications) {
    await NotificationManager.show(n.type, n.title, n.message);
    await new Promise(r => setTimeout(r, 500));
}
```

---

## 🎯 Options Reference

```javascript
await NotificationManager.show(type, title, message, {
    duration: 5000,           // ms to show (0 = never auto-dismiss)
    persistent: false,        // Don't auto-dismiss
    icon: '✓',               // Custom icon
    actionLabel: 'Action',   // Button text
    action: async () => {},  // Button action
})
```

---

## 🔧 Common Use Cases

### Form Validation
```javascript
if (!email.includes('@')) {
    await NotificationManager.warning(
        'Invalid Email',
        'Please enter a valid email address.'
    );
    return;
}
```

### API Error Handling
```javascript
try {
    await fetchData();
} catch (error) {
    await NotificationManager.error(
        'Failed to Load',
        error.message,
        {
            actionLabel: 'Retry',
            action: () => fetchData()
        }
    );
}
```

### File Upload
```javascript
const notif = await NotificationManager.loading(
    'Uploading',
    `${file.name}...`
);

try {
    await uploadFile(file);
    await NotificationManager.dismiss(notif.id);
    await NotificationManager.success(
        'Upload Complete',
        `${file.name} uploaded successfully`
    );
} catch (error) {
    await NotificationManager.dismiss(notif.id);
    await NotificationManager.error('Upload Failed', error.message);
}
```

### Authentication
```javascript
try {
    const result = await login(email, password);
    
    await NotificationManager.success(
        'Welcome!',
        `Logged in as ${email}`
    );
} catch (error) {
    await NotificationManager.error(
        'Login Failed',
        'Invalid email or password',
        {
            actionLabel: 'Try Again',
            action: () => showLoginForm()
        }
    );
}
```

---

## 📊 Getting Data

### Active Notifications
```javascript
const active = NotificationManager.getActive();
console.log(active.length); // Number of active notifications
```

### History
```javascript
const last20 = NotificationManager.getHistory(20);
last20.forEach(n => {
    console.log(`${n.type}: ${n.title}`);
});
```

### Statistics
```javascript
const stats = await NotificationManager.getStats();
console.log(stats);
// {
//   activeCount: 2,
//   historyCount: 42,
//   typeBreakdown: {
//     success: 25,
//     error: 10,
//     warning: 5,
//     info: 2
//   }
// }
```

### Export All Data
```javascript
const data = await NotificationManager.exportData();
console.log(JSON.stringify(data, null, 2));
// Save to file, send to server, etc.
```

---

## 🎵 Sound Control

```javascript
// Enable/disable
NotificationManager.setSoundEnabled(true);
NotificationManager.setSoundEnabled(false);

// Check current state
console.log(NotificationManager.soundEnabled);
```

---

## 🐛 Debugging

### Log All Operations
```javascript
// All operations automatically log to console and log server
// Check browser console (F12) for detailed logs
```

### View Notification Details
```javascript
const notif = NotificationManager.getNotificationById('NOTIF-xxx');
console.log(notif);
```

### Track Active Count
```javascript
setInterval(() => {
    console.log(`Active notifications: ${NotificationManager.getActive().length}`);
}, 1000);
```

---

## ⚙️ Configuration Examples

### Disable Auto-Hide
```javascript
NotificationManager.setDefaultDuration(0);
```

### Set 10 Second Timeout
```javascript
NotificationManager.setDefaultDuration(10000);
```

### Disable Sounds
```javascript
NotificationManager.setSoundEnabled(false);
```

---

## 🚨 Error Handling

### Validation Errors Logged Automatically
```javascript
// Invalid type throws error
try {
    await NotificationManager.show('invalid', 'Title', 'Message');
} catch (error) {
    console.log(error.message);
    // "Invalid notification type. Must be one of: success, error, warning, info, loading"
}
```

---

## 📱 Mobile Considerations

- Notifications slide in from right (adapts to mobile)
- Touch-friendly buttons (44px minimum)
- Full width on small screens
- Works on all modern mobile browsers

---

## 🔗 Integration with Logger

```javascript
// Notifications automatically log when:
// - Created: logDebug()
// - Displayed: logInfo()
// - Dismissed: logDebug()
// - Action clicked: logInfo()

// Check browser console and log server for details
```

---

## 📚 File Structure

```
notification-manager.js    # ← Core service (include this)
notification-ui.js         # ← UI rendering (include this)
notifications-demo.html    # ← Interactive demo
app-with-notifications.js  # ← Integration examples
NOTIFICATION-SYSTEM.md     # ← Full documentation
QUICK-REFERENCE.md         # ← This file
```

---

## ✅ Integration Checklist

- [ ] Include all 3 script files
- [ ] Test each notification type
- [ ] Test with action buttons
- [ ] Test on mobile device
- [ ] Check browser console for logs
- [ ] Verify sound works
- [ ] Test persistence
- [ ] View exported data

---

## 🎓 Examples by Framework

### React
```javascript
import NotificationManager from './notification-manager';

export const useNotification = () => ({
    success: (title, msg) => NotificationManager.success(title, msg),
    error: (title, msg) => NotificationManager.error(title, msg),
    loading: (title, msg) => NotificationManager.loading(title, msg),
});
```

### Vue
```javascript
export default {
    methods: {
        notify(type, title, message) {
            NotificationManager[type](title, message);
        }
    }
}
```

### Angular
```typescript
export class NotificationService {
    success(title: string, message: string) {
        NotificationManager.success(title, message);
    }
    
    error(title: string, message: string) {
        NotificationManager.error(title, message);
    }
}
```

---

**Keep this guide handy! 📌**
