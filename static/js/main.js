// Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Default to light if no saved theme, unless system prefers dark
    let theme = 'light';
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        theme = 'dark';
    }
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    // Refresh charts if on dashboard
    if (window.location.pathname.includes('dashboard') || document.getElementById('categoryPieChart')) {
        location.reload();
    }
}

function updateThemeIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = theme === 'dark'
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    }
}

// Initialize theme immediately
initTheme();
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
});

// DOM Elements - Index
const mainUploadPanel = document.getElementById('main-upload-panel');
const batchResultsContainer = document.getElementById('batch-results-container');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsHeader = document.getElementById('results-header');
const addMoreBtn = document.getElementById('add-more-btn');

// DOM Elements - Camera
const startCameraBtn = document.getElementById('start-camera-btn');
const cameraContainer = document.getElementById('camera-container');
const cameraVideo = document.getElementById('camera-video');
const captureBtn = document.getElementById('capture-btn');
const stopCameraBtn = document.getElementById('stop-camera-btn');
const cameraSection = document.getElementById('camera-section');

let stream = null;

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });
        cameraVideo.srcObject = stream;
        cameraContainer.classList.remove('hidden');
        if (startCameraBtn) startCameraBtn.classList.add('hidden');
        if (dropZone) dropZone.classList.add('hidden');
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please ensure permissions are granted.");
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    cameraVideo.srcObject = null;
    cameraContainer.classList.add('hidden');
    if (startCameraBtn) startCameraBtn.classList.remove('hidden');
    if (dropZone) dropZone.classList.remove('hidden');
}

function captureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        stopCamera();
        processBatch([file]);
    }, 'image/jpeg', 0.95);
}

if (startCameraBtn) startCameraBtn.addEventListener('click', startCamera);
if (stopCameraBtn) stopCameraBtn.addEventListener('click', stopCamera);
if (captureBtn) captureBtn.addEventListener('click', captureImage);

// 1. Image Upload & Drag-Drop Logic
if (dropZone) {
    dropZone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) handleFiles(Array.from(files));
    });

    fileInput.addEventListener('change', function () {
        if (this.files.length > 0) handleFiles(Array.from(this.files));
    });

    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', () => {
            mainUploadPanel.classList.remove('hidden');
            mainUploadPanel.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function handleFiles(files) {
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
        alert('Please upload image files.');
        return;
    }
    processBatch(validFiles);
}

async function processBatch(files) {
    mainUploadPanel.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');

    try {
        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Prediction API failed');
                const data = await response.json();
                createBatchRow(file, data);
            } catch (error) {
                console.error("Prediction failed for file:", file.name, error);
            }
        }
    } finally {
        loadingIndicator.classList.add('hidden');
        updateUIState();
    }
}

function updateUIState() {
    const hasResults = batchResultsContainer.children.length > 0;
    if (hasResults) {
        resultsHeader.classList.remove('hidden');
        mainUploadPanel.classList.add('hidden');
    } else {
        resultsHeader.classList.add('hidden');
        mainUploadPanel.classList.remove('hidden');
    }
}

function createBatchRow(file, data) {
    const rowEl = document.createElement('div');
    rowEl.className = 'glass-panel animate-in mb-8';
    rowEl.innerHTML = `
        <div class="grid-2">
            <!-- Left: Image Preview -->
            <div class="card fill-height text-center">
                <h3 class="mb-4 text-left">1. Image Analysis</h3>
                <div class="result-image-wrapper">
                    <img src="${URL.createObjectURL(file)}">
                </div>
                <button class="btn btn-outline w-full remove-btn">
                    <i class="fa-solid fa-trash-can mr-2"></i> Remove Item
                </button>
            </div>

            <!-- Right: Results & Impact -->
            <div class="card fill-height">
                <h3 class="mb-4">2. Classification Result</h3>
                
                <div class="prediction-box mb-6">
                    <div>
                        <div class="micro-text">Predicted Category</div>
                        <div class="pred-value">-</div>
                    </div>
                    <div class="text-right">
                        <select class="form-control text-sm correction-select" style="max-width: 140px; font-size: 0.8rem; padding: 0.4rem 2rem 0.4rem 0.8rem;">
                            <option value="" disabled selected>Incorrect?</option>
                            <option value="Biodegradable">Biodegradable</option>
                            <option value="Recyclable">Recyclable</option>
                            <option value="Hazardous">Hazardous</option>
                        </select>
                    </div>
                </div>

                <div class="uncertainty-warning hidden alert alert-error animate-pulse mb-6">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <div>
                        <span class="font-bold block">Low Confidence</span>
                        <span class="small-text">Please verify manually.</span>
                    </div>
                </div>
                <div class="mb-6">
                    <div class="micro-text mb-2">Confidence Distribution</div>
                    ${['Recyclable', 'Biodegradable', 'Hazardous'].map(cat => {
        const dist = data.confidence_distribution || {};
        const val = dist[cat] || 0;
        return `
                        <div class="mb-3">
                            <div class="flex-between mb-1">
                                <span class="small-text">${cat}</span>
                                <span class="small-text font-bold conf-val" data-cat="${cat}">${val}%</span>
                            </div>
                            <div class="progress-bar-bg small">
                                <div class="progress-bar-fill conf-bar" data-cat="${cat}" style="width: ${val}%;"></div>
                            </div>
                        </div>
                        `;
    }).join('')}
                </div>

                <hr class="divider">

                <h3 class="mb-4">3. Impact Projection</h3>
                <div class="mb-4">
                    <label class="micro-text mb-2 block">Estimated Weight (kg)</label>
                    <div class="input-group">
                        <input type="number" class="form-control weight-input" min="0.1" step="0.1" placeholder="e.g. 1.5">
                        <button class="btn btn-primary calculate-btn">
                            Calculate <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>

                <!-- Result Box -->
                <div class="impact-result hidden mt-6 scale-in">
                    <div class="grid-cols-2 mb-6">
                        <div class="metric-box emerald">
                            <div class="icon-wrapper"><i class="fa-solid fa-cloud"></i></div>
                            <h4>CO₂ Mitigation</h4>
                            <div class="metric-val"><span class="res-co2">0.0</span><span>kg</span></div>
                        </div>
                        <div class="metric-box indigo">
                            <div class="icon-wrapper"><i class="fa-solid fa-tree"></i></div>
                            <h4>Trees Equivalent</h4>
                            <div class="metric-val"><span class="res-trees">0.00</span><span>yr</span></div>
                        </div>
                    </div>
                    <a href="/dashboard" class="btn btn-outline w-full mt-4">
                        <i class="fa-solid fa-chart-line mr-2"></i> View Sustainability Hub
                    </a>
                </div>
            </div>
        </div>
    `;

    batchResultsContainer.appendChild(rowEl);

    // Row Logic Scoping
    let currentPredictionId = data.prediction_id;
    let currentImagenetLabel = data.imagenet_label;
    let currentPredClass = data.predicted_class;
    let currentDist = data.confidence_distribution;
    let isRowCorrection = false;

    const predValEl = rowEl.querySelector('.pred-value');
    const correctionSelect = rowEl.querySelector('.correction-select');
    const warningEl = rowEl.querySelector('.uncertainty-warning');
    const weightInput = rowEl.querySelector('.weight-input');
    const calculateBtn = rowEl.querySelector('.calculate-btn');
    const impactResult = rowEl.querySelector('.impact-result');
    const resCo2 = rowEl.querySelector('.res-co2');
    const resTrees = rowEl.querySelector('.res-trees');
    const removeBtn = rowEl.querySelector('.remove-btn');

    // Init UI
    predValEl.textContent = currentPredClass;
    if (currentPredClass === 'Biodegradable') predValEl.style.color = 'var(--status-info)';
    else if (currentPredClass === 'Hazardous') predValEl.style.color = 'var(--status-error)';
    else predValEl.style.color = 'var(--status-success)';

    if (data.is_uncertain) warningEl.classList.remove('hidden');

    // Animate initial bars
    setTimeout(() => {
        ['Recyclable', 'Biodegradable', 'Hazardous'].forEach(cat => {
            const dist = currentDist || {};
            const val = dist[cat] || 0;
            const bar = rowEl.querySelector(`.conf-bar[data-cat="${cat}"]`);
            const valEl = rowEl.querySelector(`.conf-val[data-cat="${cat}"]`);
            if (bar) {
                bar.style.width = `${val}%`;
                bar.style.background = cat === 'Recyclable' ? 'var(--status-success)' : (cat === 'Biodegradable' ? 'var(--status-info)' : 'var(--status-error)');
            }
            if (valEl) animateValue(valEl, 0, val, 800, 1, '%');
        });
    }, 100);

    // Event Listeners
    correctionSelect.addEventListener('change', (e) => {
        const newClass = e.target.value;
        currentPredClass = newClass;
        isRowCorrection = true;
        predValEl.textContent = newClass + " (Manual)";
        warningEl.classList.add('hidden');
        if (newClass === 'Biodegradable') predValEl.style.color = 'var(--status-info)';
        else if (newClass === 'Hazardous') predValEl.style.color = 'var(--status-error)';
        else predValEl.style.color = 'var(--status-success)';
    });

    calculateBtn.addEventListener('click', async () => {
        const weight = parseFloat(weightInput.value);
        if (!weight || weight <= 0) {
            alert('Please enter a weight');
            return;
        }

        try {
            calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            calculateBtn.disabled = true;

            const payload = {
                waste_type: currentPredClass,
                weight: weight,
                prediction_id: currentPredictionId,
                is_correction: isRowCorrection,
                imagenet_label: currentImagenetLabel,
                confidence_distribution: currentDist || {}
            };

            const response = await fetch('/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Calc failed');
            }
            const res = await response.json();

            animateValue(resCo2, 0, res.co2_saved, 800);
            animateValue(resTrees, 0, res.trees_equivalent, 800, 2);
            impactResult.classList.remove('hidden');

        } catch (err) {
            console.error('Calculation Error:', err);
            alert('Calculation Error: ' + err.message + '\n\nPlease try refreshing the page (Ctrl+F5).');
        } finally {
            calculateBtn.innerHTML = 'Calculate <i class="fa-solid fa-arrow-right"></i>';
            calculateBtn.disabled = false;
        }
    });

    removeBtn.addEventListener('click', () => {
        rowEl.remove();
        updateUIState();
    });
}

function animateValue(obj, start, end, duration, decimals = 1, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = progress * (2 - progress);
        const currentVal = (easeProgress * (end - start) + start).toFixed(decimals);
        obj.innerHTML = currentVal + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end.toFixed(decimals) + suffix;
        }
    };
    window.requestAnimationFrame(step);
}

// Global chart instances
let charts = {};

// 3. Dashboard Logic
window.loadDashboardData = async function () {
    try {
        const response = await fetch('/dashboard-data');
        if (!response.ok) throw new Error('Dashboard API failed');

        const data = await response.json();

        // Populate KPIs
        animateValue(document.getElementById('kpi-waste'), 0, data.totals.waste_processed, 1500, 1);
        animateValue(document.getElementById('kpi-co2'), 0, data.totals.co2_saved, 1500, 1);
        animateValue(document.getElementById('kpi-score'), 0, data.totals.impact_score, 1500, 0);

        const reliabilityEl = document.getElementById('kpi-reliability');
        if (reliabilityEl) animateValue(reliabilityEl, 0, data.totals.reliability_index, 1500, 1, '%');

        const kpiGrid = document.getElementById('dashboard-kpis');
        const chartGrid = document.getElementById('dashboard-charts');

        if (kpiGrid) kpiGrid.classList.remove('hidden');
        if (chartGrid) chartGrid.classList.remove('hidden');

        setTimeout(() => {
            try {
                renderCharts(data);
            } catch (chartErr) {
                console.error("Chart Render Error:", chartErr);
            }
        }, 350);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function renderCharts(data) {
    if (!window.Chart) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    Chart.defaults.color = isDark ? '#94a3b8' : '#64748b';
    Chart.defaults.font.family = "'Inter', sans-serif";

    const tooltipOpts = {
        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
        titleColor: isDark ? '#e2e8f0' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#475569',
        borderColor: isDark ? 'rgba(226,232,240,0.08)' : 'rgba(148,163,184,0.2)',
        borderWidth: 1, padding: 12, boxPadding: 6, cornerRadius: 8, displayColors: true,
    };

    const categoryColors = { 'Biodegradable': '#0ea5e9', 'Hazardous': '#ef4444', 'Recyclable': '#10b981' };
    const chartColors = data.distribution.labels.map(label => categoryColors[label] || (isDark ? '#16A34A' : '#475f4d'));

    if (charts.pie) charts.pie.destroy();
    if (charts.bar) charts.bar.destroy();
    if (charts.line) charts.line.destroy();

    const pieCanvas = document.getElementById('categoryPieChart');
    if (pieCanvas) {
        charts.pie = new Chart(pieCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: data.confidence_distribution.labels,
                datasets: [{ data: data.confidence_distribution.scores, backgroundColor: chartColors, borderWidth: 0, hoverOffset: 4 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#a1a1aa', padding: 20, font: { family: "'Plus Jakarta Sans', sans-serif", weight: 600 } } },
                    tooltip: { ...tooltipOpts, callbacks: { label: (c) => ` ${c.label}: ${c.raw}% Confidence` } }
                },
                cutout: '75%'
            }
        });
    }

    const barCanvas = document.getElementById('co2BarChart');
    if (barCanvas) {
        charts.bar = new Chart(barCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: data.distribution.labels,
                datasets: [{
                    label: 'AI Confidence (%)',
                    data: data.confidence_distribution.scores,
                    backgroundColor: chartColors.map(c => {
                        let hex = c.replace('#', '');
                        let r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
                        return `rgba(${r}, ${g}, ${b}, 0.85)`;
                    }),
                    borderRadius: 8, borderSkipped: false
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: tooltipOpts },
                scales: {
                    y: { beginAtZero: true, grid: { color: isDark ? 'rgba(226, 232, 240, 0.05)' : 'rgba(148, 163, 184, 0.1)', drawBorder: false }, border: { display: false } },
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", weight: 600 } } }
                }
            }
        });
    }

    const lineCanvas = document.getElementById('trendLineChart');
    if (lineCanvas) {
        const ctxLine = lineCanvas.getContext('2d');
        const gradient = ctxLine.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, isDark ? 'rgba(22, 163, 74, 0.4)' : 'rgba(71, 95, 77, 0.4)');
        gradient.addColorStop(1, isDark ? 'rgba(22, 163, 74, 0.0)' : 'rgba(71, 95, 77, 0.0)');
        charts.line = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: data.trend.labels,
                datasets: [{
                    label: 'Mitigation Rate (kg)', data: data.trend.co2, borderColor: isDark ? '#16A34A' : '#475f4d', borderWidth: 3, backgroundColor: gradient, fill: true, tension: 0.45,
                    pointBackgroundColor: isDark ? '#1A1D21' : '#F6F1E8', pointBorderColor: isDark ? '#16A34A' : '#475f4d', pointBorderWidth: 2, pointRadius: 4,
                    pointHoverRadius: 6, pointHoverBackgroundColor: isDark ? '#16A34A' : '#475f4d', pointHoverBorderColor: '#f8fafc', pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { ...tooltipOpts, intersect: false, mode: 'index' } },
                scales: {
                    y: { beginAtZero: true, grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(148, 163, 184, 0.1)', drawBorder: false }, border: { display: false } },
                    x: { grid: { color: isDark ? 'rgba(226, 232, 240, 0.05)' : 'rgba(148, 163, 184, 0.1)', drawBorder: false }, border: { display: false } }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    }
}

window.resetDashboardData = async function () {
    try {
        const response = await fetch('/reset-data', { method: 'DELETE' });
        if (!response.ok) throw new Error('Reset failed');

        // Refresh the page to show zeros
        location.reload();
    } catch (error) {
        console.error('Error resetting data:', error);
        alert('Failed to reset data.');
    }
}
