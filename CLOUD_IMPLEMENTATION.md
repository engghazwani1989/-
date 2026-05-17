# Cloud Integration - Implementation Guide

## 🎯 Complete Setup Instructions

### Step 1: Add Cloud Scripts to Your HTML

Add these lines to your `index.html` before the closing `</body>` tag:

```html
<!-- Cloud Integration Modules -->
<script src="cloud-integration.js"></script>
<script src="cloud-sync-enhanced.js"></script>

<!-- Cloud UI Modal -->
<div id="cloudConnectModal" class="modal">
  <!-- Include content from cloud-connection-ui.html -->
</div>
```

---

### Step 2: Update Your Menu Buttons

Add these buttons to your sidebar (around line 170):

```html
<button class="menu-btn" onclick="openCloudConnectModal()">☁️ اتصال السحابة</button>
<button class="menu-btn" onclick="syncNowWithCloud()">🔄 مزامنة سريعة</button>
<button class="menu-btn" onclick="exportSessionToCloud()">💾 نسخ احتياطي</button>
```

---

### Step 3: Update Login Handler

Replace your `doLogin()` function with:

```javascript
async function doLogin() {
  let email = document.getElementById("emailLogin").value.trim().toLowerCase();
  if (!email.endsWith("@uj.edu.sa")) {
    document.getElementById("loginError").innerText = "بريد مؤسسي مطلوب";
    return;
  }
  
  currentUser = email;
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("platformApp").style.display = "block";
  document.getElementById("userName").innerText = email;
  
  if (email === "nfjambi@uj.edu.sa") {
    document.getElementById("userRoleText").innerHTML =
      "🎉 مديرة إدارة المنح والتبادل الطلابي | أ. نوف فاضل جمبي";
    alert("🌟 أهلاً وسهلاً يا مديرة الإدارة الموقرة أ. نوف فاضل جمبي. نرحب بعودتك.");
  }
  
  // NEW: Load with cloud sync
  await loadInitialDataWithCloud();
  
  // NEW: Show cloud status
  updateCloudStatusUI();
}
```

---

### Step 4: Configure SharePoint URLs

Update these URLs in `cloud-integration.js` (lines 6-8):

```javascript
constructor() {
  // Your SharePoint site
  this.sharePointUrl = "https://jeddahu-my.sharepoint.com";
  this.siteUrl = "https://jeddahu-my.sharepoint.com/sites/GrantManagement";
  this.documentLibrary = "Shared Documents";
  this.isAuthenticated = false;
}
```

---

## 🔐 Azure AD Setup (For Production)

### 1. Register App in Azure Portal

```
1. Go to: https://portal.azure.com
2. Select: Azure Active Directory → App registrations → New registration
3. Name: "Admin Platform SharePoint"
4. Supported account types: "Accounts in any organizational directory"
5. Redirect URI: https://yourdomain.com/callback
6. Register
```

### 2. Get Credentials

```
1. Copy Application (client) ID
2. Go to Certificates & secrets → New client secret
3. Copy the secret value
```

### 3. Configure API Permissions

```
1. API permissions → Add a permission
2. Select "Microsoft Graph"
3. Add permissions:
   - Files.ReadWrite
   - Sites.ReadWrite
   - User.Read
```

### 4. Update Configuration

```javascript
// In cloud-integration.js
const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID_HERE",
    clientSecret: "YOUR_CLIENT_SECRET_HERE",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: "https://yourdomain.com/callback",
  },
};
```

---

## 📊 Testing the Integration

### Test 1: Connection Test

```javascript
// In browser console
await cloudIntegration.connectToSharePoint("your@uj.edu.sa", "password");
// Should return: true
```

### Test 2: Upload Test

```javascript
// Upload a test file
const blob = new Blob(["Test content"], { type: "text/plain" });
const url = await cloudIntegration.uploadFileToSharePoint(
  "test.txt",
  blob,
  "Documents"
);
console.log(url);
```

### Test 3: List Files Test

```javascript
// List files in Documents folder
const files = await cloudIntegration.listSharePointFiles("Documents");
console.log(files);
```

---

## 🔄 Auto-Sync Configuration

### Default Configuration (Every 5 Minutes):

```javascript
// In your main script
cloudIntegration.setupAutoSync(db, 300000);
```

### Custom Configuration:

```javascript
// Sync every 10 minutes
cloudIntegration.setupAutoSync(db, 600000);

// Sync every 1 minute (for testing)
cloudIntegration.setupAutoSync(db, 60000);

// Manual sync only
// Don't call setupAutoSync, just use:
await syncNowWithCloud();
```

---

## 🛡️ Security Best Practices

### 1. Store Credentials Securely

```javascript
// ✅ GOOD - Use browser's secure storage
localStorage.setItem("cloudToken", encryptedToken);

// ❌ BAD - Never hardcode credentials
const password = "actualpassword"; // NEVER!
```

### 2. Use HTTPS Only

```javascript
// ✅ Only use HTTPS URLs
const url = "https://jeddahu-my.sharepoint.com/...";

// ❌ Never use HTTP
const url = "http://..."; // NEVER!
```

### 3. Validate File Types

```javascript
// ✅ Validate before upload
const allowedTypes = [
  "application/pdf",
  "application/msword",
  "image/jpeg",
];
if (!allowedTypes.includes(file.type)) {
  throw new Error("Invalid file type");
}
```

---

## 📈 Monitoring & Debugging

### Enable Debug Logging

```javascript
// Add to cloud-integration.js
class CloudIntegration {
  constructor() {
    this.debug = true; // Enable debug mode
    this.logLevel = "info"; // or "debug", "error"
  }

  log(message, level = "info") {
    if (this.debug) {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }
}
```

### Check Sync Status

```javascript
// View last sync time
const lastSync = localStorage.getItem("lastSyncTime");
console.log("Last sync:", new Date(lastSync));

// View sync count
const syncCount = localStorage.getItem("syncCount");
console.log("Total syncs:", syncCount);
```

### View Audit Log

```javascript
// Get all cloud operations
const auditLog = await db.auditLog
  .where("action")
  .equals("cloud_sync")
  .toArray();

auditLog.forEach(log => {
  console.log(`${log.timestamp}: ${log.details}`);
});
```

---

## 🚀 Deployment Checklist

- [ ] Update SharePoint URLs for production
- [ ] Configure Azure AD app credentials
- [ ] Set up API permissions in Azure
- [ ] Test connection with real SharePoint
- [ ] Enable auto-sync
- [ ] Create backup folder in SharePoint
- [ ] Add error notifications to UI
- [ ] Test with production data
- [ ] Set up monitoring
- [ ] Create user documentation

---

## 📞 Troubleshooting

### Issue: "403 Forbidden"

```
Solution:
1. Check API permissions in Azure AD
2. Verify user has access to SharePoint site
3. Ensure credentials are correct
4. Try again after waiting 5 minutes
```

### Issue: "Invalid Credentials"

```
Solution:
1. Verify @uj.edu.sa email format
2. Check password is correct
3. Reset password if needed
4. Clear browser cache and try again
```

### Issue: "Upload Fails"

```
Solution:
1. Check file size (max 100MB)
2. Verify folder exists in SharePoint
3. Check internet connection
4. Try uploading via SharePoint directly
```

### Issue: "Auto-sync Not Working"

```
Solution:
1. Check if connected to cloud
2. Verify internet connection
3. Check browser console for errors
4. Restart browser and login again
```

---

## 📚 Resources

- [Microsoft Graph API Docs](https://docs.microsoft.com/en-us/graph/)
- [SharePoint REST API](https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/get-to-know-the-sharepoint-rest-service)
- [Azure AD Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)

---

## ✅ Verification Steps

1. **After connecting to SharePoint:**
   - [ ] See green "Connected" indicator
   - [ ] Files appear in SharePoint
   - [ ] Auto-sync runs every 5 minutes

2. **After uploading a document:**
   - [ ] File appears in SharePoint
   - [ ] Cloud status shows "synced"
   - [ ] Can access from SharePoint

3. **After first auto-sync:**
   - [ ] Check timestamp in status
   - [ ] View audit log entries
   - [ ] Files backed up in SharePoint

---

**Platform Version:** 2.1 | **Cloud Edition**
**Last Updated:** May 2026
**Maintained by:** Jeddah University Admin Team

For support: admin@uj.edu.sa
