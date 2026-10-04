/**
 * MediCare Reminder - Full Functional Web Application Logic
 * Vanilla JavaScript implementation for client-side medicine management.
 */

(function () {
  'use strict';

  // LocalStorage Key
  const STORAGE_KEY = 'medicare_app_db_v2';
  const AUTH_KEY = 'medicare_auth_session_v2';

  // Global State in memory
  let db = null;
  let activeFilterReminder = 'all';
  let activeFilterMedicine = '';
  let activeFilterRecord = '';
  let activeReportRange = '7d';
  let reminderIntervalId = null;
  let editingMedicineId = null;
  let editingPrescriptionId = null;

  // -------------------------------------------------------------
  // 1. DATA LAYER & LOCAL STORAGE INITIALIZER
  // -------------------------------------------------------------

  function getTodayDateString() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  function getInitialDemoData() {
    const today = getTodayDateString();

    // Default medicines
    const medicines = [
      {
        id: 'med-1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Daily',
        times: ['08:00'],
        startDate: today,
        endDate: '2026-12-31',
        foodTiming: 'After',
        doctor: 'Dr. Rivera',
        notes: 'Take with full glass of water in the morning',
        createdAt: new Date().toISOString()
      },
      {
        id: 'med-2',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice',
        times: ['08:00', '20:00'],
        startDate: today,
        endDate: '2026-12-31',
        foodTiming: 'After',
        doctor: 'Dr. Chen',
        notes: 'Take after meals to avoid stomach upset',
        createdAt: new Date().toISOString()
      },
      {
        id: 'med-3',
        name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Daily',
        times: ['21:00'],
        startDate: today,
        endDate: '2026-12-31',
        foodTiming: 'After',
        doctor: 'Dr. Rivera',
        notes: 'Take at night before sleep',
        createdAt: new Date().toISOString()
      },
      {
        id: 'med-4',
        name: 'Amlodipine',
        dosage: '5mg',
        frequency: 'Daily',
        times: ['09:00'],
        startDate: today,
        endDate: '2026-12-31',
        foodTiming: 'Before',
        doctor: 'Dr. Rivera',
        notes: 'Blood pressure maintenance',
        createdAt: new Date().toISOString()
      }
    ];

    // Helper SVG sample data URLs for instant previewable medical records
    const samplePrescriptionImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f4f9fc"/><rect x="20" y="20" width="560" height="360" rx="15" fill="%23ffffff" stroke="%230b6e8f" stroke-width="3"/><text x="50" y="70" font-family="sans-serif" font-size="22" font-weight="bold" fill="%23064663">MEDICARE CLINICAL RX</text><text x="50" y="110" font-family="sans-serif" font-size="14" fill="%23555">Prescribed by Dr. Rivera · Reg %2344910</text><line x1="50" y1="125" x2="550" y2="125" stroke="%23d3e2ec" stroke-width="2"/><text x="50" y="160" font-family="sans-serif" font-size="16" fill="%231e2f4e">Rx 1: Lisinopril 10mg - Take 1 tablet daily</text><text x="50" y="195" font-family="sans-serif" font-size="16" fill="%231e2f4e">Rx 2: Amlodipine 5mg - Take 1 tablet daily (Morning)</text><text x="50" y="230" font-family="sans-serif" font-size="16" fill="%231e2f4e">Rx 3: Metformin 500mg - Take 1 tablet BID</text><text x="50" y="320" font-family="sans-serif" font-size="14" fill="%232ecc71" font-weight="bold">VALID OFFICIAL DIGITAL RECORD</text></svg>';

    const sampleLabReportImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23fcfdfd"/><rect x="20" y="20" width="560" height="360" rx="15" fill="%23ffffff" stroke="%232ecc71" stroke-width="3"/><text x="50" y="70" font-family="sans-serif" font-size="22" font-weight="bold" fill="%23064663">COMPREHENSIVE LAB PANEL</text><text x="50" y="110" font-family="sans-serif" font-size="14" fill="%23555">Patient: Sarah Johnson · Date: 10/04/2026</text><line x1="50" y1="125" x2="550" y2="125" stroke="%23d3e2ec" stroke-width="2"/><text x="50" y="160" font-family="sans-serif" font-size="15" fill="%231e2f4e">HbA1c: 6.2% (Normal Control)</text><text x="50" y="195" font-family="sans-serif" font-size="15" fill="%231e2f4e">Total Cholesterol: 185 mg/dL (Desirable)</text><text x="50" y="230" font-family="sans-serif" font-size="15" fill="%231e2f4e">Blood Pressure Average: 122/78 mmHg</text><text x="50" y="320" font-family="sans-serif" font-size="14" fill="%230b6e8f" font-weight="bold">STATUS: STABLE & COMPLIANT</text></svg>';

    const medicalRecords = [
      {
        id: 'rec-1',
        name: 'Prescription 12/04/26',
        type: 'Prescription',
        date: '2026-04-12',
        doctor: 'Dr. Rivera',
        fileData: samplePrescriptionImg,
        fileName: 'prescription_rivera_apr2026.png',
        fileSize: '42 KB',
        notes: 'Follow-up prescription for hypertension & glycemic control'
      },
      {
        id: 'rec-2',
        name: 'Lab report – 10/04/26',
        type: 'Lab Report',
        date: '2026-04-10',
        doctor: 'Central Lab',
        fileData: sampleLabReportImg,
        fileName: 'lipid_glucose_panel_apr2026.png',
        fileSize: '68 KB',
        notes: 'Quarterly blood work results'
      },
      {
        id: 'rec-3',
        name: 'Visit Dr. Lee – 02/04/26',
        type: 'Doctor Note',
        date: '2026-04-02',
        doctor: 'Dr. Lee',
        fileData: samplePrescriptionImg,
        fileName: 'clinical_summary_dr_lee.png',
        fileSize: '35 KB',
        notes: 'Cardiology routine evaluation'
      }
    ];

    const prescriptions = [
      {
        id: 'rx-1',
        doctor: 'Dr. Rivera',
        date: '2026-04-12',
        medicines: 'Amlodipine 5mg, Lisinopril 10mg',
        status: 'Active',
        notes: 'Refill allowed twice. Review after 6 months.'
      },
      {
        id: 'rx-2',
        doctor: 'Dr. Chen',
        date: '2026-03-28',
        medicines: 'Metformin 500mg',
        status: 'Expired',
        notes: 'Previous course completed. Replaced with extended release.'
      }
    ];

    const profile = {
      name: 'Sarah Johnson',
      email: 'sarah.j@care.com',
      dob: '1962-07-15',
      phone: '+1 234 567 890',
      emergencyContact: '+1 987 654 321',
      avatarIcon: 'fa-user-md'
    };

    const settings = {
      notificationsEnabled: true,
      reminderOffset: 15 // minutes before
    };

    const activity = [
      {
        id: 'act-1',
        text: 'Lisinopril 10mg marked as taken',
        type: 'taken',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'act-2',
        text: 'Metformin 500mg morning dose completed',
        type: 'taken',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'act-3',
        text: 'Atorvastatin 20mg dose missed',
        type: 'missed',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];

    // Build initial reminders for today based on demo medicines
    const reminders = [];
    const now = new Date();
    const currentHours = now.getHours();

    // 1st reminder: 08:00 Lisinopril (Completed)
    reminders.push({
      id: 'rem-demo-1',
      medicineId: 'med-1',
      medicineName: 'Lisinopril',
      dosage: '10mg',
      time: '08:00',
      date: today,
      status: currentHours >= 8 ? 'completed' : 'upcoming',
      completedAt: currentHours >= 8 ? new Date().toISOString() : null
    });

    // 2nd reminder: 13:00 / 08:00 Metformin
    reminders.push({
      id: 'rem-demo-2',
      medicineId: 'med-2',
      medicineName: 'Metformin',
      dosage: '500mg',
      time: '13:00',
      date: today,
      status: 'upcoming',
      completedAt: null
    });

    // 3rd reminder: 21:00 Atorvastatin
    reminders.push({
      id: 'rem-demo-3',
      medicineId: 'med-3',
      medicineName: 'Atorvastatin',
      dosage: '20mg',
      time: '21:00',
      date: today,
      status: 'upcoming',
      completedAt: null
    });

    // 4th reminder: Amlodipine
    reminders.push({
      id: 'rem-demo-4',
      medicineId: 'med-4',
      medicineName: 'Amlodipine',
      dosage: '5mg',
      time: '09:00',
      date: today,
      status: currentHours >= 10 ? 'completed' : 'upcoming',
      completedAt: currentHours >= 10 ? new Date().toISOString() : null
    });

    return {
      medicines,
      reminders,
      medicalRecords,
      prescriptions,
      profile,
      settings,
      activity,
      demoPassword: 'password123'
    };
  }

  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        db = JSON.parse(stored);
        // Ensure all keys exist
        if (!db.medicines) db.medicines = [];
        if (!db.reminders) db.reminders = [];
        if (!db.medicalRecords) db.medicalRecords = [];
        if (!db.prescriptions) db.prescriptions = [];
        if (!db.profile) db.profile = {};
        if (!db.settings) db.settings = { notificationsEnabled: true, reminderOffset: 15 };
        if (!db.activity) db.activity = [];
      } else {
        db = getInitialDemoData();
        saveData();
      }
    } catch (e) {
      console.warn('LocalStorage error; initializing fresh demo data', e);
      db = getInitialDemoData();
      saveData();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save to LocalStorage (possibly quota exceeded):', e);
      showToast('Storage error: File may be too large for LocalStorage', 'danger');
    }
  }

  function resetDemoData() {
    if (confirm('Are you sure you want to reset all data back to demo defaults? All custom changes will be overwritten.')) {
      db = getInitialDemoData();
      saveData();
      refreshApp();
      showToast('Demo data restored successfully', 'success');
    }
  }

  function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  // -------------------------------------------------------------
  // 2. TOAST SYSTEM
  // -------------------------------------------------------------

  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'danger') iconClass = 'fa-exclamation-triangle';
    if (type === 'warning') iconClass = 'fa-bell';

    toast.innerHTML = `
      <i class="fas ${iconClass}"></i>
      <span style="flex:1;">${escapeHTML(message)}</span>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------
  // 3. MODAL SYSTEM
  // -------------------------------------------------------------

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea, button.btn-primary');
      if (firstInput) firstInput.focus();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function setupModals() {
    // Backdrop & Close buttons
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
      const closeBtn = modal.querySelector('.modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal.id));
      }
    });

    // ESC key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          closeModal(modal.id);
        });
      }
    });
  }

  // -------------------------------------------------------------
  // 4. ROUTING & SECTION NAVIGATION
  // -------------------------------------------------------------

  function switchSection(sectionId) {
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update sidebar active link
    document.querySelectorAll('.sidebar .nav-item').forEach(nav => {
      const target = nav.getAttribute('data-view');
      if (target === sectionId) {
        nav.classList.add('active');
      } else {
        nav.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    closeMobileMenu();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh corresponding views
    if (sectionId === 'view-reports') {
      renderReports();
    }
  }

  function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  }

  function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar && backdrop) {
      const isOpen = sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('active', isOpen);
    }
  }

  // -------------------------------------------------------------
  // 5. REMINDERS GENERATOR & LIVE STATE ENGINE
  // -------------------------------------------------------------

  function syncTodayReminders() {
    const today = getTodayDateString();
    if (!db.reminders) db.reminders = [];

    // Ensure all active medicines have reminder records for today
    db.medicines.forEach(med => {
      // Check start/end date bounds
      if (med.startDate && med.startDate > today) return;
      if (med.endDate && med.endDate < today) return;

      const times = med.times && med.times.length > 0 ? med.times : ['08:00'];
      times.forEach(timeStr => {
        const exists = db.reminders.some(r => r.medicineId === med.id && r.date === today && r.time === timeStr);
        if (!exists) {
          db.reminders.push({
            id: generateId('rem'),
            medicineId: med.id,
            medicineName: med.name,
            dosage: med.dosage,
            time: timeStr,
            date: today,
            status: 'upcoming',
            completedAt: null
          });
        }
      });
    });

    // Check for missed status
    checkMissedReminders();
    saveData();
  }

  function checkMissedReminders() {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMins).padStart(2, '0')}`;
    const today = getTodayDateString();

    let updated = false;

    db.reminders.forEach(rem => {
      if (rem.date === today && (rem.status === 'upcoming' || rem.status === 'due' || rem.status === 'snoozed')) {
        const [rHours, rMins] = rem.time.split(':').map(Number);
        const remTotalMin = rHours * 60 + rMins;
        const nowTotalMin = currentHours * 60 + currentMins;

        // If time passed by more than 15 minutes and still not completed/skipped -> mark missed
        if (nowTotalMin > remTotalMin + 15 && rem.status !== 'snoozed') {
          rem.status = 'missed';
          updated = true;
          logActivity(`${rem.medicineName} ${rem.dosage} dose was missed`, 'missed');
        } else if (Math.abs(nowTotalMin - remTotalMin) <= 15 && rem.status === 'upcoming') {
          rem.status = 'due';
          updated = true;
          triggerBrowserNotification(rem);
        }
      }
    });

    if (updated) {
      saveData();
      renderDashboard();
      renderReminders();
    }
  }

  function triggerBrowserNotification(reminder) {
    if (!db.settings.notificationsEnabled) return;
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification('Medicine Reminder · MediCare', {
          body: `Time to take ${reminder.medicineName} ${reminder.dosage} (${reminder.time})`,
          icon: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png'
        });
        notif.onclick = () => {
          window.focus();
          switchSection('view-reminders');
        };
      } catch (e) {
        console.log('Notification dispatch note:', e);
      }
    }
  }

  function logActivity(text, type = 'info') {
    if (!db.activity) db.activity = [];
    db.activity.unshift({
      id: generateId('act'),
      text,
      type,
      timestamp: new Date().toISOString()
    });
    // Keep last 30 activities
    if (db.activity.length > 30) db.activity.pop();
  }

  // -------------------------------------------------------------
  // 6. ADHERENCE CALCULATION
  // -------------------------------------------------------------

  function calculateAdherence(range = 'today') {
    const today = getTodayDateString();
    let relevantReminders = [];

    if (range === 'today') {
      relevantReminders = db.reminders.filter(r => r.date === today);
    } else if (range === '7d') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      relevantReminders = db.reminders.filter(r => r.date >= sevenDaysAgo);
    } else if (range === '30d') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      relevantReminders = db.reminders.filter(r => r.date >= thirtyDaysAgo);
    } else {
      relevantReminders = db.reminders;
    }

    const taken = relevantReminders.filter(r => r.status === 'completed').length;
    const missed = relevantReminders.filter(r => r.status === 'missed').length;
    const skipped = relevantReminders.filter(r => r.status === 'skipped').length;
    const totalAccounted = taken + missed + skipped;

    if (totalAccounted === 0) {
      return {
        percentage: 100,
        taken: 0,
        missed: 0,
        skipped: 0,
        total: relevantReminders.length,
        statusText: 'No doses logged yet today',
        statusColor: 'var(--secondary)'
      };
    }

    const percentage = Math.round((taken / totalAccounted) * 100);
    let statusText = 'Excellent adherence';
    let statusColor = 'var(--secondary)';

    if (percentage < 60) {
      statusText = 'Needs immediate attention';
      statusColor = 'var(--danger)';
    } else if (percentage < 80) {
      statusText = 'Good progress, keep it up';
      statusColor = 'var(--warning)';
    }

    return {
      percentage,
      taken,
      missed,
      skipped,
      total: relevantReminders.length,
      statusText,
      statusColor
    };
  }

  // -------------------------------------------------------------
  // 7. RENDER FUNCTIONS
  // -------------------------------------------------------------

  function renderDashboard() {
    const today = getTodayDateString();
    const todayReminders = db.reminders.filter(r => r.date === today);

    const totalScheduleCount = todayReminders.length;
    const takenCount = todayReminders.filter(r => r.status === 'completed').length;
    const missedCount = todayReminders.filter(r => r.status === 'missed').length;
    const totalMedicinesCount = db.medicines.length;

    // Stat numbers
    document.getElementById('dash-stat-schedule').textContent = totalScheduleCount;
    document.getElementById('dash-stat-taken').textContent = takenCount;
    document.getElementById('dash-stat-missed').textContent = missedCount;
    document.getElementById('dash-stat-total-meds').textContent = totalMedicinesCount;

    // Welcome greeting
    const welcomeHeader = document.getElementById('dash-welcome-header');
    if (welcomeHeader && db.profile && db.profile.name) {
      const firstName = db.profile.name.split(' ')[0];
      welcomeHeader.textContent = `👋 Welcome back, ${firstName}`;
    }

    // Adherence Card
    const adherence = calculateAdherence('today');
    const adherencePercentEl = document.getElementById('dash-adherence-percent');
    const adherenceBarEl = document.getElementById('dash-adherence-bar');
    const adherenceTextEl = document.getElementById('dash-adherence-text');

    if (adherencePercentEl) adherencePercentEl.textContent = `${adherence.percentage}%`;
    if (adherenceBarEl) {
      adherenceBarEl.style.width = `${adherence.percentage}%`;
      adherenceBarEl.style.background = adherence.statusColor;
    }
    if (adherenceTextEl) {
      adherenceTextEl.textContent = `${adherence.statusText} (${adherence.taken}/${adherence.total} doses taken)`;
    }

    // Render preview snippets for dashboard tables
    renderDashboardMedicinesTable();
    renderDashboardRemindersList();
    renderDashboardRecordsPreview();
    renderDashboardPrescriptionsPreview();
    renderDashboardActivity();
  }

  function renderDashboardMedicinesTable() {
    const tbody = document.getElementById('dash-medicine-tbody');
    if (!tbody) return;

    if (db.medicines.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="padding:20px 0;"><i class="fas fa-pills" style="font-size:2rem;"></i><p>No medicines added yet.</p><button class="btn btn-primary btn-sm btn-open-add-med"><i class="fas fa-plus"></i> Add First Medicine</button></td></tr>`;
      attachAddMedBtnHandlers();
      return;
    }

    // Show up to 4 medicines
    const displayList = db.medicines.slice(0, 4);
    tbody.innerHTML = displayList.map(med => {
      const timesStr = med.times ? med.times.join(', ') : '08:00';
      return `
        <tr>
          <td><strong>${escapeHTML(med.name)}</strong></td>
          <td>${escapeHTML(med.dosage)}</td>
          <td>${escapeHTML(med.frequency)}</td>
          <td>${escapeHTML(timesStr)}</td>
          <td><span class="status-badge active">Active</span></td>
          <td>
            <div class="table-actions">
              <i class="fas fa-edit btn-edit-med" data-id="${med.id}" title="Edit medicine"></i>
              <i class="fas fa-trash btn-delete-med" data-id="${med.id}" title="Delete medicine"></i>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachMedicineActionHandlers(tbody);
  }

  function renderDashboardRemindersList() {
    const container = document.getElementById('dash-reminders-container');
    if (!container) return;

    const today = getTodayDateString();
    const todayReminders = db.reminders.filter(r => r.date === today);

    if (todayReminders.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 24px 0;">
          <i class="fas fa-clock" style="font-size:2.2rem;"></i>
          <p>No reminders scheduled for today.</p>
        </div>
      `;
      return;
    }

    // Sort by time
    const sorted = [...todayReminders].sort((a, b) => a.time.localeCompare(b.time));

    container.innerHTML = sorted.map(rem => renderReminderRowHTML(rem)).join('');
    attachReminderActionHandlers(container);
  }

  function renderDashboardRecordsPreview() {
    const container = document.getElementById('dash-records-preview');
    if (!container) return;

    if (db.medicalRecords.length === 0) {
      container.innerHTML = `<p style="color:var(--gray-500); padding: 8px 0;">No records uploaded.</p>`;
      return;
    }

    container.innerHTML = db.medicalRecords.slice(0, 3).map(rec => {
      let icon = 'fa-file-medical';
      if (rec.type === 'Prescription') icon = 'fa-file-prescription';
      if (rec.type === 'Lab Report') icon = 'fa-flask';
      if (rec.type === 'Doctor Note') icon = 'fa-stethoscope';

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 0; border-bottom: 1px solid #f0f6fa;">
          <div><i class="fas ${icon}" style="color:var(--primary-light); margin-right:8px;"></i> <strong>${escapeHTML(rec.name)}</strong></div>
          <div>
            <i class="fas fa-eye btn-view-record" data-id="${rec.id}" style="cursor:pointer; color:var(--primary); margin-right:8px;" title="View record"></i>
            <i class="fas fa-trash btn-delete-record" data-id="${rec.id}" style="cursor:pointer; color:#a0aec0;" title="Delete record"></i>
          </div>
        </div>
      `;
    }).join('');

    attachRecordActionHandlers(container);
  }

  function renderDashboardPrescriptionsPreview() {
    const container = document.getElementById('dash-prescriptions-preview');
    if (!container) return;

    if (db.prescriptions.length === 0) {
      container.innerHTML = `<p style="color:var(--gray-500); padding: 8px 0;">No prescriptions stored.</p>`;
      return;
    }

    container.innerHTML = db.prescriptions.slice(0, 2).map(rx => {
      const isExpired = rx.status === 'Expired';
      return `
        <div style="border-left: 4px solid ${isExpired ? '#b0c4de' : 'var(--secondary)'}; padding-left: 14px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>${escapeHTML(rx.doctor)}</strong> · <span style="font-size:0.85rem; color:var(--gray-500);">${escapeHTML(rx.date)}</span>
            <span>
              <i class="fas fa-edit btn-edit-rx" data-id="${rx.id}" style="cursor:pointer; color:var(--primary); margin-right:8px;" title="Edit"></i>
              <i class="fas fa-trash btn-delete-rx" data-id="${rx.id}" style="cursor:pointer; color:#a0aec0;" title="Delete"></i>
            </span>
          </div>
          <div style="font-size:0.9rem; color:#1e2f4e; margin: 2px 0;">${escapeHTML(rx.medicines)}</div>
          <span class="status-badge ${isExpired ? 'missed' : 'active'}" style="font-size:0.75rem; padding: 2px 10px;">${escapeHTML(rx.status)}</span>
        </div>
      `;
    }).join('');

    attachPrescriptionActionHandlers(container);
  }

  function renderDashboardActivity() {
    const container = document.getElementById('dash-activity-container');
    if (!container) return;

    if (!db.activity || db.activity.length === 0) {
      container.innerHTML = `<p style="color:var(--gray-500);">No recent activity recorded.</p>`;
      return;
    }

    container.innerHTML = db.activity.slice(0, 4).map(act => {
      const timeAgo = formatTimeAgo(new Date(act.timestamp));
      let icon = 'fa-info';
      if (act.type === 'taken') icon = 'fa-check';
      if (act.type === 'missed') icon = 'fa-exclamation';
      if (act.type === 'skipped') icon = 'fa-forward';

      return `
        <div class="activity-item ${act.type}">
          <i class="fas ${icon}"></i>
          <span class="activity-text">${escapeHTML(act.text)}</span>
          <span class="activity-time">${timeAgo}</span>
        </div>
      `;
    }).join('');
  }

  function renderMedicines() {
    const tbody = document.getElementById('full-medicine-tbody');
    if (!tbody) return;

    let list = db.medicines;
    if (activeFilterMedicine) {
      const q = activeFilterMedicine.toLowerCase();
      list = list.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.dosage.toLowerCase().includes(q) || 
        (m.doctor && m.doctor.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <i class="fas fa-capsules"></i>
            <h4>No medicines found</h4>
            <p>${activeFilterMedicine ? 'Try adjusting your search terms.' : 'Add your prescription medications to receive reminders and track compliance.'}</p>
            <button class="btn btn-primary btn-open-add-med"><i class="fas fa-plus"></i> Add New Medicine</button>
          </td>
        </tr>
      `;
      attachAddMedBtnHandlers();
      return;
    }

    tbody.innerHTML = list.map(med => {
      const timesStr = med.times ? med.times.join(', ') : '08:00';
      return `
        <tr>
          <td><strong>${escapeHTML(med.name)}</strong></td>
          <td>${escapeHTML(med.dosage)}</td>
          <td>${escapeHTML(med.frequency)}</td>
          <td><span class="reminder-time-pill" style="font-size:0.8rem; padding:4px 10px;"><i class="fas fa-clock"></i> ${escapeHTML(timesStr)}</span></td>
          <td>${escapeHTML(med.foodTiming || 'Any')} Food</td>
          <td><span class="status-badge active">Active</span></td>
          <td>
            <div class="table-actions">
              <i class="fas fa-edit btn-edit-med" data-id="${med.id}" title="Edit"></i>
              <i class="fas fa-trash btn-delete-med" data-id="${med.id}" title="Delete"></i>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachMedicineActionHandlers(tbody);
  }

  function renderReminderRowHTML(rem) {
    let badgeClass = 'upcoming';
    let badgeLabel = 'Upcoming';

    if (rem.status === 'completed') {
      badgeClass = 'completed';
      badgeLabel = 'Completed';
    } else if (rem.status === 'missed') {
      badgeClass = 'missed';
      badgeLabel = 'Missed';
    } else if (rem.status === 'skipped') {
      badgeClass = 'skipped';
      badgeLabel = 'Skipped';
    } else if (rem.status === 'snoozed') {
      badgeClass = 'snoozed';
      badgeLabel = `Snoozed (${rem.time})`;
    } else if (rem.status === 'due') {
      badgeClass = 'upcoming';
      badgeLabel = 'Due Now';
    }

    const isDone = rem.status === 'completed' || rem.status === 'skipped';

    return `
      <div class="reminder-row" data-id="${rem.id}">
        <div class="reminder-info">
          <span class="reminder-time-pill"><i class="fas fa-clock"></i> ${escapeHTML(rem.time)}</span>
          <div class="reminder-details">
            <h4>${escapeHTML(rem.medicineName)} · ${escapeHTML(rem.dosage)}</h4>
            <p>${rem.completedAt ? `Taken at ${new Date(rem.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Scheduled for today'}</p>
          </div>
        </div>
        <span class="status-badge ${badgeClass}">${badgeLabel}</span>
        <div class="reminder-actions">
          <button class="taken btn-reminder-taken" data-id="${rem.id}" ${isDone ? 'disabled' : ''}><i class="fas fa-check"></i> Taken</button>
          <button class="skip btn-reminder-skip" data-id="${rem.id}" ${isDone ? 'disabled' : ''}><i class="fas fa-forward"></i> Skip</button>
          <button class="snooze btn-reminder-snooze" data-id="${rem.id}" ${isDone ? 'disabled' : ''}><i class="fas fa-bell"></i> Snooze</button>
        </div>
      </div>
    `;
  }

  function renderReminders() {
    const container = document.getElementById('full-reminders-container');
    if (!container) return;

    const today = getTodayDateString();
    let list = db.reminders.filter(r => r.date === today);

    if (activeFilterReminder !== 'all') {
      list = list.filter(r => r.status === activeFilterReminder);
    }

    // Sort by scheduled time
    list.sort((a, b) => a.time.localeCompare(b.time));

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-bell-slash"></i>
          <h4>No reminders in this filter</h4>
          <p>You have no ${activeFilterReminder === 'all' ? '' : activeFilterReminder} doses today.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(rem => renderReminderRowHTML(rem)).join('');
    attachReminderActionHandlers(container);
  }

  function renderRecords() {
    const container = document.getElementById('full-records-container');
    if (!container) return;

    let list = db.medicalRecords;
    if (activeFilterRecord) {
      const q = activeFilterRecord.toLowerCase();
      list = list.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.type.toLowerCase().includes(q) || 
        (r.doctor && r.doctor.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fas fa-folder-open"></i>
          <h4>No medical records found</h4>
          <p>${activeFilterRecord ? 'Try adjusting your search query.' : 'Upload clinical reports, prescriptions, and lab tests for safe local reference.'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(rec => {
      let icon = 'fa-file-medical';
      if (rec.type === 'Prescription') icon = 'fa-file-prescription';
      if (rec.type === 'Lab Report') icon = 'fa-flask';
      if (rec.type === 'Doctor Note') icon = 'fa-stethoscope';

      return `
        <div class="record-item-card">
          <div class="record-icon-box"><i class="fas ${icon}"></i></div>
          <div class="record-meta">
            <h4>${escapeHTML(rec.name)}</h4>
            <p>${escapeHTML(rec.type)} · ${escapeHTML(rec.date)} · ${escapeHTML(rec.fileSize || 'Doc')}</p>
          </div>
          <div class="record-actions">
            <button class="btn-icon btn-view-record" data-id="${rec.id}" title="View Document"><i class="fas fa-eye"></i></button>
            <button class="btn-icon btn-danger-icon btn-delete-record" data-id="${rec.id}" title="Delete Document"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `;
    }).join('');

    attachRecordActionHandlers(container);
  }

  function renderPrescriptions() {
    const container = document.getElementById('full-prescriptions-container');
    if (!container) return;

    if (db.prescriptions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-prescription-bottle-alt"></i>
          <h4>No prescriptions on file</h4>
          <p>Keep your doctor's prescriptions organized and monitor expiration statuses.</p>
          <button class="btn btn-primary" id="btn-empty-add-rx"><i class="fas fa-plus"></i> Add Prescription</button>
        </div>
      `;
      const btn = document.getElementById('btn-empty-add-rx');
      if (btn) btn.addEventListener('click', () => openPrescriptionModal());
      return;
    }

    container.innerHTML = db.prescriptions.map(rx => {
      const isExpired = rx.status === 'Expired';
      return `
        <div class="prescription-card-item ${isExpired ? 'expired' : ''}">
          <div class="prescription-top">
            <div>
              <strong style="font-size: 1.1rem; color: var(--primary-dark);">${escapeHTML(rx.doctor)}</strong>
              <span style="font-size:0.9rem; color:var(--gray-500); margin-left: 10px;"><i class="fas fa-calendar-alt"></i> ${escapeHTML(rx.date)}</span>
            </div>
            <div class="card-header-actions">
              <span class="status-badge ${isExpired ? 'missed' : 'active'}">${escapeHTML(rx.status)}</span>
              <button class="btn-icon btn-edit-rx" data-id="${rx.id}" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="btn-icon btn-danger-icon btn-delete-rx" data-id="${rx.id}" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <p style="margin: 8px 0; font-weight:600; color: #1e2f4e;">
            <i class="fas fa-pills" style="color:var(--primary); margin-right: 6px;"></i> ${escapeHTML(rx.medicines)}
          </p>
          ${rx.notes ? `<p style="font-size:0.85rem; color:var(--gray-500);"><i class="fas fa-sticky-note" style="margin-right:4px;"></i> ${escapeHTML(rx.notes)}</p>` : ''}
        </div>
      `;
    }).join('');

    attachPrescriptionActionHandlers(container);
  }

  function renderReports() {
    const adherence = calculateAdherence(activeReportRange);

    const kpiTotalMeds = document.getElementById('report-kpi-total-meds');
    const kpiTotalDoses = document.getElementById('report-kpi-total-doses');
    const kpiTaken = document.getElementById('report-kpi-taken');
    const kpiMissed = document.getElementById('report-kpi-missed');
    const kpiSkipped = document.getElementById('report-kpi-skipped');
    const kpiRate = document.getElementById('report-kpi-rate');

    if (kpiTotalMeds) kpiTotalMeds.textContent = db.medicines.length;
    if (kpiTotalDoses) kpiTotalDoses.textContent = adherence.total;
    if (kpiTaken) kpiTaken.textContent = adherence.taken;
    if (kpiMissed) kpiMissed.textContent = adherence.missed;
    if (kpiSkipped) kpiSkipped.textContent = adherence.skipped;
    if (kpiRate) kpiRate.textContent = `${adherence.percentage}%`;

    // Render pure HTML/CSS Bar Chart representing adherence over days
    renderReportChart();
  }

  function renderReportChart() {
    const chartContainer = document.getElementById('report-chart-container');
    if (!chartContainer) return;

    // Generate days depending on range (7 days or 30 days)
    const numDays = activeReportRange === '30d' ? 14 : 7;
    const daysData = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });

      const dayRems = db.reminders.filter(r => r.date === dateStr);
      const taken = dayRems.filter(r => r.status === 'completed').length;
      const missed = dayRems.filter(r => r.status === 'missed').length;
      const total = dayRems.length;
      
      let pct = 100;
      if (total > 0) {
        pct = Math.round((taken / total) * 100);
      } else if (i === 0) {
        // Today
        pct = calculateAdherence('today').percentage;
      } else {
        // Sample realistic variance for past historical days
        pct = Math.floor(75 + Math.random() * 25);
      }

      daysData.push({ label: dayLabel, pct, date: dateStr });
    }

    chartContainer.innerHTML = daysData.map(item => {
      let barClass = '';
      if (item.pct >= 85) barClass = 'high';
      if (item.pct < 60) barClass = 'low';

      return `
        <div class="chart-bar-group">
          <span class="chart-bar-value">${item.pct}%</span>
          <div class="chart-bar-wrapper">
            <div class="chart-bar ${barClass}" style="height: ${Math.max(item.pct, 8)}%;"></div>
          </div>
          <span class="chart-bar-label">${item.label}</span>
        </div>
      `;
    }).join('');
  }

  function renderProfile() {
    if (!db.profile) return;
    const p = db.profile;

    const nameEl = document.getElementById('profile-display-name');
    const emailEl = document.getElementById('profile-display-email');
    const dobEl = document.getElementById('profile-display-dob');
    const phoneEl = document.getElementById('profile-display-phone');
    const emergencyEl = document.getElementById('profile-display-emergency');

    if (nameEl) nameEl.textContent = p.name || 'Sarah Johnson';
    if (emailEl) emailEl.textContent = p.email || 'sarah.j@care.com';
    if (dobEl) dobEl.textContent = p.dob ? formatDate(p.dob) : '15/07/1962';
    if (phoneEl) phoneEl.textContent = p.phone || '+1 234 567 890';
    if (emergencyEl) emergencyEl.textContent = p.emergencyContact || '+1 987 654 321';

    // Update form fields
    const formName = document.getElementById('profile-edit-name');
    const formEmail = document.getElementById('profile-edit-email');
    const formDob = document.getElementById('profile-edit-dob');
    const formPhone = document.getElementById('profile-edit-phone');
    const formEmergency = document.getElementById('profile-edit-emergency');

    if (formName) formName.value = p.name || '';
    if (formEmail) formEmail.value = p.email || '';
    if (formDob) formDob.value = p.dob || '';
    if (formPhone) formPhone.value = p.phone || '';
    if (formEmergency) formEmergency.value = p.emergencyContact || '';
  }

  function renderSettings() {
    if (!db.settings) return;
    const notifCheckbox = document.getElementById('settings-notifications-toggle');
    const offsetSelect = document.getElementById('settings-reminder-offset');

    if (notifCheckbox) notifCheckbox.checked = !!db.settings.notificationsEnabled;
    if (offsetSelect) offsetSelect.value = String(db.settings.reminderOffset || 15);
  }

  function refreshApp() {
    syncTodayReminders();
    renderDashboard();
    renderMedicines();
    renderReminders();
    renderRecords();
    renderPrescriptions();
    renderProfile();
    renderSettings();
  }

  // -------------------------------------------------------------
  // 8. EVENT ATTACHERS & FORM HANDLERS
  // -------------------------------------------------------------

  function attachAddMedBtnHandlers() {
    document.querySelectorAll('.btn-open-add-med').forEach(btn => {
      btn.addEventListener('click', () => openMedicineModal());
    });
  }

  function attachMedicineActionHandlers(parentElement) {
    parentElement.querySelectorAll('.btn-edit-med').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openMedicineModal(id);
      });
    });

    parentElement.querySelectorAll('.btn-delete-med').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteMedicine(id);
      });
    });
  }

  function attachReminderActionHandlers(parentElement) {
    parentElement.querySelectorAll('.btn-reminder-taken').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        markReminderStatus(id, 'completed');
      });
    });

    parentElement.querySelectorAll('.btn-reminder-skip').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        markReminderStatus(id, 'skipped');
      });
    });

    parentElement.querySelectorAll('.btn-reminder-snooze').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openSnoozeModal(id);
      });
    });
  }

  function attachRecordActionHandlers(parentElement) {
    parentElement.querySelectorAll('.btn-view-record').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        viewRecordModal(id);
      });
    });

    parentElement.querySelectorAll('.btn-delete-record').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteRecord(id);
      });
    });
  }

  function attachPrescriptionActionHandlers(parentElement) {
    parentElement.querySelectorAll('.btn-edit-rx').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openPrescriptionModal(id);
      });
    });

    parentElement.querySelectorAll('.btn-delete-rx').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deletePrescription(id);
      });
    });
  }

  // -------------------------------------------------------------
  // 9. MEDICINE CRUD
  // -------------------------------------------------------------

  function openMedicineModal(medId = null) {
    editingMedicineId = medId;
    const modalTitle = document.getElementById('med-modal-title');
    const form = document.getElementById('form-medicine');
    if (!form) return;

    form.reset();

    if (medId) {
      const med = db.medicines.find(m => m.id === medId);
      if (med) {
        modalTitle.textContent = '✏️ Edit Medicine';
        document.getElementById('med-name').value = med.name || '';
        document.getElementById('med-dosage').value = med.dosage || '';
        document.getElementById('med-frequency').value = med.frequency || 'Daily';
        document.getElementById('med-start-date').value = med.startDate || '';
        document.getElementById('med-end-date').value = med.endDate || '';
        document.getElementById('med-food').value = med.foodTiming || 'After';
        document.getElementById('med-doctor').value = med.doctor || '';
        document.getElementById('med-notes').value = med.notes || '';
        renderFrequencyTimeInputs(med.frequency, med.times);
      }
    } else {
      modalTitle.textContent = '➕ Add New Medicine';
      document.getElementById('med-start-date').value = getTodayDateString();
      renderFrequencyTimeInputs('Daily', ['08:00']);
    }

    openModal('modal-medicine');
  }

  function renderFrequencyTimeInputs(frequency, existingTimes = []) {
    const container = document.getElementById('med-times-inputs-container');
    if (!container) return;

    let count = 1;
    let defaultTimes = ['08:00'];

    if (frequency === 'Twice') {
      count = 2;
      defaultTimes = ['08:00', '20:00'];
    } else if (frequency === 'Three times') {
      count = 3;
      defaultTimes = ['08:00', '13:00', '20:00'];
    } else if (frequency === 'Weekly') {
      count = 1;
      defaultTimes = ['09:00'];
    }

    const times = (existingTimes && existingTimes.length > 0) ? existingTimes : defaultTimes;

    let html = '';
    for (let i = 0; i < count; i++) {
      const val = times[i] || defaultTimes[i] || '08:00';
      html += `
        <div style="display:flex; align-items:center; gap:6px;">
          <input type="time" class="med-time-input" required value="${val}" style="padding:8px 12px; border-radius:12px; border:1px solid #d3e2ec;" />
          <span style="font-size:0.8rem; color:var(--gray-500);">Dose ${i + 1}</span>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function handleSaveMedicine(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('med-name').value.trim();
    const dosage = document.getElementById('med-dosage').value.trim();
    const frequency = document.getElementById('med-frequency').value;
    const startDate = document.getElementById('med-start-date').value;
    const endDate = document.getElementById('med-end-date').value;
    const foodTiming = document.getElementById('med-food').value;
    const doctor = document.getElementById('med-doctor').value.trim();
    const notes = document.getElementById('med-notes').value.trim();

    const timeInputs = document.querySelectorAll('.med-time-input');
    const times = Array.from(timeInputs).map(inp => inp.value).filter(Boolean);

    if (!name || !dosage || times.length === 0) {
      showToast('Please fill out medicine name, dosage, and dose time.', 'warning');
      return;
    }

    if (editingMedicineId) {
      // Edit existing
      const index = db.medicines.findIndex(m => m.id === editingMedicineId);
      if (index !== -1) {
        db.medicines[index] = {
          ...db.medicines[index],
          name,
          dosage,
          frequency,
          times,
          startDate,
          endDate,
          foodTiming,
          doctor,
          notes,
          updatedAt: new Date().toISOString()
        };
        showToast(`${name} updated successfully!`, 'success');
        logActivity(`Updated prescription details for ${name}`);
      }
    } else {
      // Add new
      const newMed = {
        id: generateId('med'),
        name,
        dosage,
        frequency,
        times,
        startDate: startDate || getTodayDateString(),
        endDate,
        foodTiming,
        doctor,
        notes,
        createdAt: new Date().toISOString()
      };
      db.medicines.push(newMed);
      showToast(`${name} added to your schedule!`, 'success');
      logActivity(`Added new medicine: ${name} (${dosage})`, 'taken');
    }

    saveData();
    closeModal('modal-medicine');
    refreshApp();
  }

  function deleteMedicine(id) {
    const med = db.medicines.find(m => m.id === id);
    if (!med) return;

    if (confirm(`Are you sure you want to delete ${med.name}? All future reminders for this medicine will also be removed.`)) {
      db.medicines = db.medicines.filter(m => m.id !== id);
      db.reminders = db.reminders.filter(r => r.medicineId !== id);
      saveData();
      refreshApp();
      showToast(`${med.name} deleted successfully`, 'info');
      logActivity(`Deleted medicine: ${med.name}`);
    }
  }

  // -------------------------------------------------------------
  // 10. REMINDER STATE ACTIONS (TAKEN, SKIP, SNOOZE)
  // -------------------------------------------------------------

  function markReminderStatus(remId, status) {
    const rem = db.reminders.find(r => r.id === remId);
    if (!rem) return;

    rem.status = status;
    if (status === 'completed') {
      rem.completedAt = new Date().toISOString();
      showToast(`Taken: ${rem.medicineName} ${rem.dosage}`, 'success');
      logActivity(`Took ${rem.medicineName} ${rem.dosage} on schedule`, 'taken');
    } else if (status === 'skipped') {
      showToast(`Skipped: ${rem.medicineName} ${rem.dosage}`, 'warning');
      logActivity(`Skipped dose of ${rem.medicineName}`, 'skipped');
    }

    saveData();
    refreshApp();
  }

  let snoozingReminderId = null;

  function openSnoozeModal(remId) {
    snoozingReminderId = remId;
    const rem = db.reminders.find(r => r.id === remId);
    if (rem) {
      document.getElementById('snooze-med-info').textContent = `${rem.medicineName} ${rem.dosage} (Current: ${rem.time})`;
    }
    openModal('modal-snooze');
  }

  function applySnooze(minutes) {
    if (!snoozingReminderId) return;
    const rem = db.reminders.find(r => r.id === snoozingReminderId);
    if (!rem) return;

    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const newHours = String(now.getHours()).padStart(2, '0');
    const newMins = String(now.getMinutes()).padStart(2, '0');
    const newTime = `${newHours}:${newMins}`;

    rem.time = newTime;
    rem.status = 'snoozed';
    rem.snoozedTo = newTime;

    saveData();
    closeModal('modal-snooze');
    refreshApp();
    showToast(`Snoozed ${rem.medicineName} by ${minutes} mins (New time: ${newTime})`, 'info');
    logActivity(`Snoozed ${rem.medicineName} until ${newTime}`);
  }

  // -------------------------------------------------------------
  // 11. MEDICAL RECORDS & FILE API
  // -------------------------------------------------------------

  function handleRecordFileUpload(file) {
    if (!file) return;

    const maxSizeBytes = 2.5 * 1024 * 1024; // 2.5MB
    if (file.size > maxSizeBytes) {
      showToast('File is too large for local browser storage (Max 2.5MB).', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      document.getElementById('record-file-data').value = dataUrl;
      document.getElementById('record-file-name').value = file.name;
      document.getElementById('record-file-size').value = `${Math.round(file.size / 1024)} KB`;
      document.getElementById('record-upload-hint').innerHTML = `<i class="fas fa-file-check" style="color:var(--secondary);"></i> <strong>${escapeHTML(file.name)}</strong> selected (${Math.round(file.size / 1024)} KB)`;
      showToast('File loaded! Fill out details and save.', 'info');
    };
    reader.readAsDataURL(file);
  }

  function handleSaveRecord(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('record-name').value.trim();
    const type = document.getElementById('record-type').value;
    const date = document.getElementById('record-date').value || getTodayDateString();
    const doctor = document.getElementById('record-doctor').value.trim();
    const notes = document.getElementById('record-notes').value.trim();
    const fileData = document.getElementById('record-file-data').value;
    const fileName = document.getElementById('record-file-name').value;
    const fileSize = document.getElementById('record-file-size').value;

    if (!name) {
      showToast('Please provide a record name', 'warning');
      return;
    }

    const newRecord = {
      id: generateId('rec'),
      name,
      type,
      date,
      doctor,
      notes,
      fileData: fileData || 'data:text/plain;base64,TWVkaWNhbCBSZWNvcmQgUGxhY2Vob2xkZXI=',
      fileName: fileName || 'document.pdf',
      fileSize: fileSize || '12 KB',
      createdAt: new Date().toISOString()
    };

    db.medicalRecords.unshift(newRecord);
    saveData();
    closeModal('modal-record');
    document.getElementById('form-record').reset();
    document.getElementById('record-upload-hint').innerHTML = `<i class="fas fa-cloud-upload-alt"></i><p>Drag & drop or click to upload</p><span>PDF, PNG, JPG (Max 2.5MB)</span>`;
    refreshApp();
    showToast('Medical record saved successfully!', 'success');
    logActivity(`Uploaded medical record: ${name}`);
  }

  function viewRecordModal(id) {
    const rec = db.medicalRecords.find(r => r.id === id);
    if (!rec) return;

    document.getElementById('view-record-title').textContent = rec.name;
    document.getElementById('view-record-meta').textContent = `${rec.type} · ${rec.date} · Doctor: ${rec.doctor || 'N/A'}`;
    
    const previewContainer = document.getElementById('view-record-content');
    if (rec.fileData.startsWith('data:image/')) {
      previewContainer.innerHTML = `<img src="${rec.fileData}" alt="${escapeHTML(rec.name)}" style="max-width:100%; border-radius:12px; border:1px solid #e3edf5; box-shadow:0 4px 12px rgba(0,0,0,0.05);" />`;
    } else if (rec.fileData.startsWith('data:application/pdf')) {
      previewContainer.innerHTML = `<iframe src="${rec.fileData}" style="width:100%; height:450px; border-radius:12px; border:1px solid #e3edf5;"></iframe>`;
    } else {
      previewContainer.innerHTML = `
        <div style="background:#f8fafc; padding:30px; border-radius:12px; text-align:center;">
          <i class="fas fa-file-medical-alt" style="font-size:3rem; color:var(--primary); margin-bottom:12px;"></i>
          <h4>${escapeHTML(rec.fileName || rec.name)}</h4>
          <p style="color:var(--gray-500); margin: 8px 0 16px;">${escapeHTML(rec.notes || 'Medical document payload stored.')}</p>
          <a href="${rec.fileData}" download="${rec.fileName || 'record.txt'}" class="btn btn-outline"><i class="fas fa-download"></i> Download Record File</a>
        </div>
      `;
    }

    openModal('modal-view-record');
  }

  function deleteRecord(id) {
    const rec = db.medicalRecords.find(r => r.id === id);
    if (!rec) return;

    if (confirm(`Delete record "${rec.name}"?`)) {
      db.medicalRecords = db.medicalRecords.filter(r => r.id !== id);
      saveData();
      refreshApp();
      showToast('Record deleted', 'info');
      logActivity(`Deleted medical record: ${rec.name}`);
    }
  }

  // -------------------------------------------------------------
  // 12. PRESCRIPTIONS CRUD
  // -------------------------------------------------------------

  function openPrescriptionModal(rxId = null) {
    editingPrescriptionId = rxId;
    const form = document.getElementById('form-prescription');
    if (!form) return;
    form.reset();

    const titleEl = document.getElementById('rx-modal-title');

    if (rxId) {
      const rx = db.prescriptions.find(p => p.id === rxId);
      if (rx) {
        titleEl.textContent = '✏️ Edit Prescription';
        document.getElementById('rx-doctor').value = rx.doctor || '';
        document.getElementById('rx-date').value = rx.date || '';
        document.getElementById('rx-medicines').value = rx.medicines || '';
        document.getElementById('rx-status').value = rx.status || 'Active';
        document.getElementById('rx-notes').value = rx.notes || '';
      }
    } else {
      titleEl.textContent = '➕ Add Prescription';
      document.getElementById('rx-date').value = getTodayDateString();
    }

    openModal('modal-prescription');
  }

  function handleSavePrescription(e) {
    if (e) e.preventDefault();

    const doctor = document.getElementById('rx-doctor').value.trim();
    const date = document.getElementById('rx-date').value;
    const medicines = document.getElementById('rx-medicines').value.trim();
    const status = document.getElementById('rx-status').value;
    const notes = document.getElementById('rx-notes').value.trim();

    if (!doctor || !medicines) {
      showToast('Please enter doctor name and medicines included.', 'warning');
      return;
    }

    if (editingPrescriptionId) {
      const index = db.prescriptions.findIndex(p => p.id === editingPrescriptionId);
      if (index !== -1) {
        db.prescriptions[index] = {
          ...db.prescriptions[index],
          doctor,
          date,
          medicines,
          status,
          notes
        };
        showToast('Prescription updated', 'success');
        logActivity(`Updated prescription from ${doctor}`);
      }
    } else {
      const newRx = {
        id: generateId('rx'),
        doctor,
        date: date || getTodayDateString(),
        medicines,
        status,
        notes,
        createdAt: new Date().toISOString()
      };
      db.prescriptions.unshift(newRx);
      showToast('Prescription added successfully', 'success');
      logActivity(`Added prescription from ${doctor}`);
    }

    saveData();
    closeModal('modal-prescription');
    refreshApp();
  }

  function deletePrescription(id) {
    const rx = db.prescriptions.find(p => p.id === id);
    if (!rx) return;

    if (confirm(`Are you sure you want to delete prescription from ${rx.doctor}?`)) {
      db.prescriptions = db.prescriptions.filter(p => p.id !== id);
      saveData();
      refreshApp();
      showToast('Prescription removed', 'info');
      logActivity(`Deleted prescription from ${rx.doctor}`);
    }
  }

  // -------------------------------------------------------------
  // 13. PROFILE & DEMO AUTH
  // -------------------------------------------------------------

  function handleSaveProfile(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('profile-edit-name').value.trim();
    const email = document.getElementById('profile-edit-email').value.trim();
    const dob = document.getElementById('profile-edit-dob').value;
    const phone = document.getElementById('profile-edit-phone').value.trim();
    const emergencyContact = document.getElementById('profile-edit-emergency').value.trim();

    if (!name) {
      showToast('Name cannot be empty', 'warning');
      return;
    }

    db.profile = {
      ...db.profile,
      name,
      email,
      dob,
      phone,
      emergencyContact
    };

    saveData();
    closeModal('modal-edit-profile');
    refreshApp();
    showToast('Profile updated successfully!', 'success');
    logActivity(`Updated profile info for ${name}`);
  }

  function handleChangePassword(e) {
    if (e) e.preventDefault();

    const currentPass = document.getElementById('pass-current').value;
    const newPass = document.getElementById('pass-new').value;
    const confirmPass = document.getElementById('pass-confirm').value;

    if (!newPass || newPass.length < 4) {
      showToast('New password must be at least 4 characters.', 'warning');
      return;
    }

    if (newPass !== confirmPass) {
      showToast('New passwords do not match.', 'danger');
      return;
    }

    db.demoPassword = newPass;
    saveData();
    closeModal('modal-password');
    document.getElementById('form-password').reset();
    showToast('Demo password changed successfully (Frontend local demo)', 'success');
    logActivity('Changed account demo password');
  }

  function handleLogin(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;

    if (!email) {
      showToast('Please enter an email address', 'warning');
      return;
    }

    // Set session in sessionStorage / localStorage
    localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: true, email }));
    closeModal('modal-login');
    showToast(`Welcome back, ${db.profile ? db.profile.name : 'User'}!`, 'success');
    switchSection('view-dashboard');
    updateAuthUI();
  }

  function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem(AUTH_KEY);
      updateAuthUI();
      openModal('modal-login');
      showToast('You have been logged out (Session cleared).', 'info');
    }
  }

  function checkAuthStatus() {
    const session = localStorage.getItem(AUTH_KEY);
    return !!session;
  }

  function updateAuthUI() {
    const isLoggedIn = checkAuthStatus();
    const logoutBtn = document.getElementById('btn-sidebar-logout');
    if (logoutBtn) {
      logoutBtn.style.display = isLoggedIn ? 'flex' : 'none';
    }
  }

  // -------------------------------------------------------------
  // 14. SETTINGS & BROWSER NOTIFICATIONS PERMISSION
  // -------------------------------------------------------------

  function setupSettingsHandlers() {
    const notifToggle = document.getElementById('settings-notifications-toggle');
    if (notifToggle) {
      notifToggle.addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        if (enabled && 'Notification' in window) {
          if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              showToast('Browser notifications enabled!', 'success');
            } else {
              showToast('Notifications permission not granted in browser.', 'warning');
            }
          }
        }
        db.settings.notificationsEnabled = enabled;
        saveData();
        showToast(`Notifications ${enabled ? 'enabled' : 'disabled'}`, 'info');
      });
    }

    const offsetSelect = document.getElementById('settings-reminder-offset');
    if (offsetSelect) {
      offsetSelect.addEventListener('change', (e) => {
        db.settings.reminderOffset = Number(e.target.value);
        saveData();
        showToast(`Reminders preference set to ${e.target.value} min before`, 'info');
      });
    }

    const resetBtn = document.getElementById('btn-reset-demo-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetDemoData);
    }
  }

  // -------------------------------------------------------------
  // 15. UTILITIES
  // -------------------------------------------------------------

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  function formatTimeAgo(dateObj) {
    const seconds = Math.floor((new Date() - dateObj) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // -------------------------------------------------------------
  // 16. APPLICATION INITIALIZATION
  // -------------------------------------------------------------

  function init() {
    loadData();

    // Setup Sidebar Nav Links
    document.querySelectorAll('.sidebar .nav-item[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        if (targetView) switchSection(targetView);
      });
    });

    // Mobile nav toggle
    const mobileToggle = document.getElementById('btn-mobile-menu-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', toggleMobileMenu);
    }
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', closeMobileMenu);
    }

    // Hero buttons
    const btnGetStarted = document.getElementById('btn-hero-get-started');
    if (btnGetStarted) {
      btnGetStarted.addEventListener('click', () => switchSection('view-medicines'));
    }
    const btnHeroLogin = document.getElementById('btn-hero-login');
    if (btnHeroLogin) {
      btnHeroLogin.addEventListener('click', () => openModal('modal-login'));
    }

    // Feature quick cards
    document.querySelectorAll('.feature-card[data-view]').forEach(card => {
      card.addEventListener('click', () => {
        const view = card.getAttribute('data-view');
        if (view) switchSection(view);
      });
    });

    // Add Medicine Header Buttons
    document.querySelectorAll('.btn-open-add-med').forEach(btn => {
      btn.addEventListener('click', () => openMedicineModal());
    });

    // Frequency Selector in Medicine Form
    const freqSelect = document.getElementById('med-frequency');
    if (freqSelect) {
      freqSelect.addEventListener('change', (e) => {
        renderFrequencyTimeInputs(e.target.value);
      });
    }

    // Forms
    const formMed = document.getElementById('form-medicine');
    if (formMed) formMed.addEventListener('submit', handleSaveMedicine);

    const formRx = document.getElementById('form-prescription');
    if (formRx) formRx.addEventListener('submit', handleSavePrescription);

    const formRecord = document.getElementById('form-record');
    if (formRecord) formRecord.addEventListener('submit', handleSaveRecord);

    const formProfile = document.getElementById('form-profile');
    if (formProfile) formProfile.addEventListener('submit', handleSaveProfile);

    const formPass = document.getElementById('form-password');
    if (formPass) formPass.addEventListener('submit', handleChangePassword);

    const formLogin = document.getElementById('form-login');
    if (formLogin) formLogin.addEventListener('submit', handleLogin);

    // Logout
    const logoutBtn = document.getElementById('btn-sidebar-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Profile Trigger Buttons
    const btnEditProfile = document.getElementById('btn-open-edit-profile');
    if (btnEditProfile) {
      btnEditProfile.addEventListener('click', () => openModal('modal-edit-profile'));
    }
    const btnChangePass = document.getElementById('btn-open-change-password');
    if (btnChangePass) {
      btnChangePass.addEventListener('click', () => openModal('modal-password'));
    }

    // Snooze Duration Buttons
    document.querySelectorAll('.btn-snooze-duration').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = Number(btn.getAttribute('data-minutes'));
        applySnooze(mins);
      });
    });

    // File Upload Area
    const uploadArea = document.getElementById('record-drop-area');
    const fileInput = document.getElementById('record-file-input');
    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleRecordFileUpload(e.target.files[0]);
        }
      });

      // Drag & Drop
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });
      ['dragleave', 'dragend'].forEach(type => {
        uploadArea.addEventListener(type, () => uploadArea.classList.remove('dragover'));
      });
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleRecordFileUpload(e.dataTransfer.files[0]);
        }
      });
    }

    // Search & Filter Listeners
    const medSearchInput = document.getElementById('med-search-input');
    if (medSearchInput) {
      medSearchInput.addEventListener('input', (e) => {
        activeFilterMedicine = e.target.value.trim();
        renderMedicines();
      });
    }

    const recordSearchInput = document.getElementById('record-search-input');
    if (recordSearchInput) {
      recordSearchInput.addEventListener('input', (e) => {
        activeFilterRecord = e.target.value.trim();
        renderRecords();
      });
    }

    // Reminder Filters (All, Upcoming, Completed, Missed, Skipped)
    document.querySelectorAll('.filter-pill[data-reminder-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill[data-reminder-filter]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilterReminder = pill.getAttribute('data-reminder-filter');
        renderReminders();
      });
    });

    // Reports Range Switcher
    document.querySelectorAll('.filter-pill[data-report-range]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill[data-report-range]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeReportRange = pill.getAttribute('data-report-range');
        renderReports();
      });
    });

    // Record and Prescription Add Triggers
    const btnOpenAddRecord = document.getElementById('btn-open-add-record');
    if (btnOpenAddRecord) {
      btnOpenAddRecord.addEventListener('click', () => openModal('modal-record'));
    }
    const btnOpenAddRx = document.getElementById('btn-open-add-rx');
    if (btnOpenAddRx) {
      btnOpenAddRx.addEventListener('click', () => openPrescriptionModal());
    }

    // Modals setup
    setupModals();
    setupSettingsHandlers();

    // Default Auth session initialization if first visit
    if (!localStorage.getItem(AUTH_KEY)) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: true, email: 'sarah.j@care.com' }));
    }
    updateAuthUI();

    // Render entire UI
    refreshApp();

    // Missed reminder periodic detector (every 30 seconds)
    reminderIntervalId = setInterval(() => {
      checkMissedReminders();
    }, 30000);

    // Expose helpers to window for inline onclick fallback compatibility
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.openMedicineModal = openMedicineModal;
    window.openPrescriptionModal = openPrescriptionModal;
    window.handleRecordFileUpload = handleRecordFileUpload;
    window.switchSection = switchSection;
    window.resetDemoData = resetDemoData;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
