# Frontend E-Commerce Platform with Reusable Logging

A production-ready frontend application demonstrating **strategic, context-rich logging** integrated throughout the user experience.

## 📁 Project Structure

```
├── logger.js          # Reusable logging package (browser-compatible)
├── app.js             # Frontend application logic with logging
├── index.html         # Interactive web interface
└── README.md          # This file
```

## 🚀 Quick Start

1. **Open the application:**
   ```bash
   # Simply open index.html in a web browser
   open index.html
   # or
   start index.html
   ```

2. **View live logs:**
   - Open **Browser Developer Tools** (F12 or Cmd+Option+I)
   - Go to **Console** tab to see formatted logs with colors
   - Logs also appear in the "Live Log Console" section on the page

## 📊 Reusable Logging Package

### Usage Pattern

```javascript
// Function signature
await log(stack, level, package, message)

// Examples:
await log('Frontend', 'INFO', 'UserAuth', 'User logged in | Email: user@example.com');
await logInfo('ShoppingCart', `Item added | ItemID: PROD-001 | Qty: 2`);
await logError('PaymentProcessor', `[TXN-12345] Payment failed | Reason: Insufficient funds`);
```

### Log Levels

- **DEBUG** - Detailed diagnostic information (cyan)
- **INFO** - General informational messages (green)
- **WARN** - Warning messages, potential issues (orange)
- **ERROR** - Error conditions (red)
- **CRITICAL** - Critical failures (purple)

### Convenience Functions

```javascript
logDebug(package, message)    // Frontend, DEBUG
logInfo(package, message)     // Frontend, INFO
logWarn(package, message)     // Frontend, WARN
logError(package, message)    // Frontend, ERROR
logCritical(package, message) // Frontend, CRITICAL
```

## 🎯 Strategic Logging Throughout the App

### 1. **Page Lifecycle**
- ✓ Page initialization with URL and referrer
- ✓ Session duration tracking
- ✓ Global error handlers
- ✓ Unhandled promise rejections

### 2. **User Authentication**
- ✓ Login attempts with email logging
- ✓ Validation failures with specific errors
- ✓ Successful authentication with UserID
- ✓ Logout events with duration

### 3. **Shopping Cart Management**
- ✓ Add to cart with product details and quantity
- ✓ Quantity updates for duplicate items
- ✓ Item removal tracking
- ✓ Cart state changes

### 4. **Checkout Process**
- ✓ Checkout initiation with transaction ID
- ✓ Validation of user, cart, address
- ✓ Payment processing with method and amount
- ✓ Payment authorization/decline events
- ✓ Order completion with delivery estimate
- ✓ Error handling with full context

### 5. **Payment Processing**
- ✓ API calls with method and amount
- ✓ Success/failure with authorization codes
- ✓ Payment gateway error handling
- ✓ Timeout protection

## 🔍 Log Payload Structure

Each log sent to the test server includes:

```javascript
{
  timestamp: "2026-06-03T15:30:45.123Z",
  stack: "Frontend",
  level: "INFO",
  package: "CheckoutService",
  message: "Checkout completed | OrderID: ORD-1717422645123",
  environment: "browser",
  browser: {
    userAgent: "Mozilla/5.0...",
    platform: "Win32",
    language: "en-US",
    screenSize: "1920x1080",
    documentReadyState: "complete",
    sessionDuration: 342,
    url: "file:///path/to/index.html",
    referrer: "direct"
  }
}
```

## 🎨 Features

### 1. **Color-Coded Console Output**
Browser DevTools console shows:
- 🔵 **DEBUG** (Cyan) - Diagnostic info
- 🟢 **INFO** (Green) - Success messages
- 🟠 **WARN** (Orange) - Warnings
- 🔴 **ERROR** (Red) - Errors
- 🟣 **CRITICAL** (Purple) - Critical issues

### 2. **Live Log Console on Page**
- Real-time log display below the checkout section
- Scrollable with max-height constraint
- Clear Logs button to reset
- Timestamp and formatting for each entry

### 3. **Request Tracking**
- Unique transaction IDs for tracing
- Session duration tracking
- Browser context (screen size, user agent, language)
- URL and referrer information

### 4. **Error Resilience**
- Timeout protection (5 seconds) for log server calls
- Graceful fallback if logging server is unavailable
- App continues functioning even if logs can't be sent

## 💻 Test the Application

### Login Flow
1. Enter email: `demo@example.com`
2. Enter password: `password123`
3. Click "Login"
4. Watch logs: Authentication validation → Success message

### Shopping Flow
1. Fill in item details:
   - Item ID: `PROD-001`
   - Name: `Wireless Headphones`
   - Price: `49.99`
   - Quantity: `2`
2. Click "Add to Cart"
3. Observe logs showing item validation and cart update

### Checkout Flow
1. After logging in and adding items
2. Enter delivery address
3. Select payment method
4. Click "Complete Checkout"
5. Watch entire checkout flow with logs:
   - Validation phase
   - Payment processing
   - Authorization
   - Order completion

## 🔧 Configuration

### Environment Variables (if running on a server)
```javascript
LOG_SERVER_URL  // Default: https://4.224.186.213/evaluation-service/logs
LOG_TIMEOUT     // Default: 5000ms (5 seconds)
ENABLE_CONSOLE  // Default: true
```

### Browser Storage
- **localStorage**: Used for auth token and userID
- **sessionStartTime**: Tracked on window object for session duration

## 📝 Example Log Outputs

### Successful Login
```
[15:30:45.123] [DEBUG] UserAuth.login: Login attempt initiated | Email: demo@example.com | Browser: Mozilla/5.0...
[15:30:45.234] [DEBUG] UserAuth.login: Validation passed | Sending credentials to auth server
[15:30:45.567] [INFO] UserAuth.login: Login successful | UserID: USER-12345 | Token stored in localStorage
```

### Failed Checkout
```
[15:31:12.456] [INFO] CheckoutService.processCheckout: Checkout initiated | TransactionID: TXN-1717422672456 | UserID: USER-12345 | Items: 2 | Total: $99.98
[15:31:12.567] [DEBUG] CheckoutService.processCheckout: [TXN-1717422672456] All validations passed | Processing payment
[15:31:12.678] [DEBUG] PaymentProcessor: [TXN-1717422672456] Payment processing started | Method: credit_card | Amount: $99.98
[15:31:13.234] [ERROR] PaymentProcessor: [TXN-1717422672456] Payment authorization declined | Reason: Insufficient funds
[15:31:13.345] [ERROR] CheckoutService.processCheckout: [TXN-1717422672456] Checkout failed | UserID: USER-12345 | Error: Payment declined
```

## 🎯 Key Benefits of This Logging System

✅ **Reusable** - Copy `logger.js` to any frontend project
✅ **Context-Rich** - Every log contains specific, descriptive information
✅ **Non-Intrusive** - Doesn't break app if logging server fails
✅ **Browser-Compatible** - Uses native fetch API
✅ **Traceable** - Transaction IDs enable request tracking
✅ **Structured** - Consistent JSON format for all logs
✅ **Low-Overhead** - Fire-and-forget with timeout protection
✅ **Developer-Friendly** - Colored console output and browser integration

## 🔗 Remote Logging

All logs are sent to:
```
POST https://4.224.186.213/evaluation-service/logs
```

Expected payload for each log call ✓

---

**Built with ❤️ for production-ready frontend logging**
