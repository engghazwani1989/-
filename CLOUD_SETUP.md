# 📋 CLOUD SETUP GUIDE

## الخطوات الأساسية

### الخطوة 1️⃣: أضف الملفات الجديدة

أضف إلى `index.html` قبل `</body>`:

```html
<script src="cloud-integration.js"></script>
<script src="cloud-sync-enhanced.js"></script>
```

---

### الخطوة 2️⃣: أضف أزرار القائمة الجانبية

في القسم `<div class="sidebar">`:

```html
<button class="menu-btn" onclick="openCloudConnectModal()">
  ☁️ اتصال السحابة
</button>
<button class="menu-btn" onclick="syncNowWithCloud()">
  🔄 مزامنة سريعة
</button>
<button class="menu-btn" onclick="createBackupNow()">
  💾 نسخة احتياطية
</button>
```

---

### الخطوة 3️⃣: غيّر دالة التحميل

**من:**
```javascript
async function doLogin() {
  // ...
  await loadInitialData();
}
```

**إلى:**
```javascript
async function doLogin() {
  // ...
  await loadInitialDataWithCloud();
}
```

---

### الخطوة 4️⃣: غيّر دالة الحفظ

**في كل مكان تستدعي `saveEdit()`:**

استبدل مع `saveEditWithCloudSync()`

---

## ✅ ميزات

| الميزة | الوصف |
|---------|-------|
| ☁️ الاتصال الآمن | اتصال آمن مع SharePoint |
| 🔄 المزامنة التلقائية | تزامن تلقائي كل 5 دقائق |
| 💾 النسخ الاحتياطية | حفظ كامل البيانات في السحابة |
| 🔐 الأمان | تشفير وتسجيل الدخول |
| 📊 التتبع | تسجيل كل العمليات |

---

## 🔗 الروابط

- **المستودع:** https://github.com/engghazwani1989/-
- **المستندات:** `/CLOUD_IMPLEMENTATION.md`
- **الدليل السريع:** `/QUICK_START.md`

