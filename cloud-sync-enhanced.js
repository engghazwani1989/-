/**
 * Cloud Sync Enhanced Module
 * Enhanced save functions with automatic cloud synchronization
 * Version: 2.1 | Cloud Edition
 */

// ==================== ENHANCED SAVE FUNCTIONS ====================

async function saveEditWithCloudSync(storeName, id) {
  try {
    let updates = {};

    // Collect fields based on entity type
    if (storeName === "documents") {
      updates.title = document.getElementById("editTitle")?.value;
      updates.type = document.getElementById("editType")?.value;
      updates.unit = document.getElementById("editUnit")?.value;
      updates.year = document.getElementById("editYear")?.value;
      updates.content = document.getElementById("editContent")?.value;
    } else if (storeName === "procedures") {
      updates.title = document.getElementById("editTitle")?.value;
      updates.type = document.getElementById("editType")?.value;
      updates.unit = document.getElementById("editUnit")?.value;
      updates.content = document.getElementById("editContent")?.value;
      updates.editCount = ((await db.procedures.get(id)).editCount || 0) + 1;
    } else if (storeName === "operationalGuides") {
      updates.title = document.getElementById("editTitle")?.value;
      updates.category = document.getElementById("editCategory")?.value;
      updates.unit = document.getElementById("editUnit")?.value;
      updates.content = document.getElementById("editContent")?.value;
    } else if (storeName === "tasks") {
      updates.title = document.getElementById("editTitle")?.value;
      updates.assignedTo = document.getElementById("editAssignedTo")?.value;
      updates.dueDate = document.getElementById("editDueDate")?.value;
      updates.status = document.getElementById("editStatus")?.value;
      updates.description = document.getElementById("editContent")?.value;
    } else if (storeName === "adminOrders") {
      updates.title = document.getElementById("editTitle")?.value;
      updates.employeeName = document.getElementById("editEmployee")?.value;
      updates.orderDescription = document.getElementById("editOrderDesc")?.value;
      updates.startDate = document.getElementById("editStartDate")?.value;
      updates.endDate = document.getElementById("editEndDate")?.value;
      updates.description = document.getElementById("editContent")?.value;
    }

    // Add file if uploaded
    if (window.tempFileBase64) {
      updates.fileBase64 = window.tempFileBase64;
      updates.fileType = window.tempFileType;
      delete window.tempFileBase64;
      delete window.tempFileType;
    }

    updates.syncStatus = "pending";
    updates.updatedAt = new Date();

    // Save to local database
    await db[storeName].update(id, updates);

    // Auto-sync with cloud
    if (cloudIntegration.isAuthenticated) {
      showCloudStatus("⏳ جاري المزامنة مع السحابة...", "pending");
      
      const item = await db[storeName].get(id);
      const jsonBlob = new Blob([JSON.stringify(item)], { type: "application/json" });
      const fileName = `${item.id}_${item.title || item.orderDescription}.json`;

      const folderMap = {
        documents: "Documents",
        procedures: "Procedures",
        operationalGuides: "OperationalGuides",
        tasks: "Tasks",
        adminOrders: "AdminOrders",
      };

      const fileUrl = await cloudIntegration.uploadFileToSharePoint(
        fileName,
        jsonBlob,
        folderMap[storeName]
      );

      if (fileUrl) {
        await db[storeName].update(id, {
          cloudUrl: fileUrl,
          syncStatus: "synced",
          lastSynced: new Date(),
        });

        showCloudStatus("✅ تم المزامنة مع السحابة!", "success");
      } else {
        await db[storeName].update(id, { syncStatus: "pending" });
        showCloudStatus("⚠️ فشلت المزامنة، سيتم المحاولة لاحقاً", "error");
      }
    }

    // Log action
    await logAction("تعديل وحفظ", storeName, id, "تم التعديل وحفظ الملف");

    closeModal();

    // Refresh table
    if (storeName === "documents") renderDocumentsTable();
    else if (storeName === "procedures") {
      renderProceduresTable();
      generateRecommendations();
    } else if (storeName === "operationalGuides") renderOperationalGuidesTable();
    else if (storeName === "tasks") renderTasksTable();
    else if (storeName === "adminOrders") renderAdminOrdersTable();

    alert("✅ تم حفظ التعديلات بنجاح!");
  } catch (error) {
    console.error("Error saving:", error);
    alert("❌ خطأ في الحفظ: " + error.message);
  }
}

// ==================== LOAD WITH CLOUD ====================

async function loadInitialDataWithCloud() {
  try {
    console.log("📦 جاري تحميل البيانات...");

    // Load from local database first
    await loadInitialData();

    // If connected to cloud, sync with cloud
    if (cloudIntegration.isAuthenticated) {
      showCloudStatus("🔄 جاري مزامنة البيانات من السحابة...", "pending");
      await cloudIntegration.syncAllChanges(db);
      showCloudStatus("✅ تم المزامنة!", "success");
    }

    updateCloudStatusUI();
  } catch (error) {
    console.error("Error loading with cloud:", error);
  }
}

// ==================== CLOUD UI FUNCTIONS ====================

function openCloudConnectModal() {
  const modal = document.getElementById("detailModal");
  const status = cloudIntegration.getStatus();

  modal.querySelector("#modalContent").innerHTML = `
    <h3>☁️ اتصال السحابة</h3>
    <div style="background: #f1f5f9; padding: 15px; border-radius: 12px; margin: 15px 0;">
      <div style="margin: 8px 0;"><strong>الحالة:</strong> 
        <span style="color: ${cloudIntegration.isAuthenticated ? 'green' : 'red'};">
          ${cloudIntegration.isAuthenticated ? '🟢 متصل' : '🔴 غير متصل'}
        </span>
      </div>
      <div style="margin: 8px 0;"><strong>البريد:</strong> ${status.email}</div>
      <div style="margin: 8px 0;"><strong>آخر مزامنة:</strong> ${status.lastSync}</div>
      <div style="margin: 8px 0;"><strong>إجمالي المزامنات:</strong> ${status.totalSyncs}</div>
    </div>

    ${!cloudIntegration.isAuthenticated ? `
      <div>
        <label>البريد الإلكتروني (@uj.edu.sa):</label>
        <input type="email" id="cloudEmail" placeholder="name@uj.edu.sa" style="width: 100%; padding: 8px; margin: 8px 0; border-radius: 8px; border: 1px solid #ccc;">
        
        <label>كلمة المرور:</label>
        <input type="password" id="cloudPassword" placeholder="••••••••" style="width: 100%; padding: 8px; margin: 8px 0; border-radius: 8px; border: 1px solid #ccc;">
      </div>
    ` : ''}

    <div style="margin-top: 15px;">
      ${!cloudIntegration.isAuthenticated ? `
        <button class="btn-primary" onclick="connectToCloudPlatform()">🔐 الاتصال</button>
      ` : `
        <button class="btn-primary" onclick="disconnectFromCloud()">🚪 قطع الاتصال</button>
        <button class="btn-primary" onclick="syncNowWithCloud()">🔄 مزامنة فورية</button>
        <button class="btn-primary" onclick="createBackupNow()">💾 نسخة احتياطية</button>
      `}
      <button class="btn-primary" onclick="closeModal()">إغلاق</button>
    </div>
  `;

  modal.style.display = "flex";
}

async function connectToCloudPlatform() {
  const email = document.getElementById("cloudEmail")?.value;
  const password = document.getElementById("cloudPassword")?.value;

  if (!email || !password) {
    alert("❌ الرجاء إدخال البريد وكلمة المرور");
    return;
  }

  showCloudStatus("⏳ جاري الاتصال...", "pending");
  const result = await cloudIntegration.connectToSharePoint(email, password);

  if (result) {
    showCloudStatus("✅ تم الاتصال بنجاح!", "success");
    setTimeout(() => {
      closeModal();
      openCloudConnectModal();
      cloudIntegration.setupAutoSync(db, 300000);
    }, 1000);
  } else {
    showCloudStatus("❌ فشل الاتصال", "error");
  }
}

function disconnectFromCloud() {
  if (confirm("هل تريد قطع الاتصال بـ SharePoint؟")) {
    cloudIntegration.disconnectFromSharePoint();
    closeModal();
    updateCloudStatusUI();
    alert("✅ تم قطع الاتصال");
  }
}

async function syncNowWithCloud() {
  if (!cloudIntegration.isAuthenticated) {
    alert("❌ يجب الاتصال بـ SharePoint أولاً");
    return;
  }

  showCloudStatus("🔄 جاري المزامنة...", "pending");
  const count = await cloudIntegration.syncAllChanges(db);
  showCloudStatus(`✅ تم مزامنة ${count} عنصر`, "success");

  // Refresh all tables
  await renderDocumentsTable();
  await renderProceduresTable();
  await renderOperationalGuidesTable();
  await renderTasksTable();
  await renderAdminOrdersTable();
}

async function createBackupNow() {
  if (!cloudIntegration.isAuthenticated) {
    alert("❌ يجب الاتصال بـ SharePoint أولاً");
    return;
  }

  showCloudStatus("💾 جاري إنشاء نسخة احتياطية...", "pending");
  const backupUrl = await cloudIntegration.backupAllData(db);

  if (backupUrl) {
    showCloudStatus("✅ تمت النسخة الاحتياطية بنجاح!", "success");
    alert(`✅ تمت النسخة الاحتياطية: ${backupUrl}`);
  } else {
    showCloudStatus("❌ فشلت النسخة الاحتياطية", "error");
  }
}

// ==================== UI STATUS FUNCTIONS ====================

function showCloudStatus(message, type = "info") {
  let statusDiv = document.getElementById("cloudStatus");
  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "cloudStatus";
    statusDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      padding: 15px 20px;
      border-radius: 12px;
      z-index: 9999;
      font-weight: bold;
      animation: slideIn 0.3s;
    `;
    document.body.appendChild(statusDiv);
  }

  const colors = {
    success: "#dcfce7",
    error: "#fee2e2",
    pending: "#fed7aa",
    info: "#dbeafe",
  };

  statusDiv.style.backgroundColor = colors[type] || colors.info;
  statusDiv.textContent = message;

  setTimeout(() => {
    statusDiv.style.opacity = "0";
    statusDiv.style.transition = "opacity 0.3s";
  }, 3000);
}

function updateCloudStatusUI() {
  const status = cloudIntegration.getStatus();
  let statusBar = document.getElementById("cloudStatusBar");

  if (!statusBar) {
    statusBar = document.createElement("div");
    statusBar.id = "cloudStatusBar";
    statusBar.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 15px;
      background: ${cloudIntegration.isAuthenticated ? "#dcfce7" : "#fee2e2"};
      border-radius: 20px;
      font-size: 12px;
      z-index: 1000;
      border: 1px solid ${cloudIntegration.isAuthenticated ? "#86efac" : "#fca5a5"};
    `;
    document.body.appendChild(statusBar);
  }

  statusBar.innerHTML = `
    ${cloudIntegration.isAuthenticated ? '☁️ متصل' : '☁️ غير متصل'} | 
    آخر مزامنة: ${new Date(status.lastSync).toLocaleTimeString("ar-SA")}
  `;
}

// Make functions global
window.openCloudConnectModal = openCloudConnectModal;
window.connectToCloudPlatform = connectToCloudPlatform;
window.disconnectFromCloud = disconnectFromCloud;
window.syncNowWithCloud = syncNowWithCloud;
window.createBackupNow = createBackupNow;
window.saveEditWithCloudSync = saveEditWithCloudSync;
window.loadInitialDataWithCloud = loadInitialDataWithCloud;
window.showCloudStatus = showCloudStatus;
window.updateCloudStatusUI = updateCloudStatusUI;
