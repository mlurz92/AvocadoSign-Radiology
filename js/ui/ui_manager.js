window.uiManager = (() => {

    let tippyInstances = [];
    let collapseEventListenersAttached = new Set();
    let quickGuideModalInstance = null;

    function showToast(message, type = 'info', duration = 3000) {
        if (typeof window.APP_CONFIG !== 'undefined' && window.APP_CONFIG.UI_SETTINGS?.TOAST_DURATION_MS) {
            duration = window.APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS;
        }
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        if (!message) return;
        if (typeof bootstrap === 'undefined' || !bootstrap.Toast) return;

        const toastId = `toast-${generateUUID()}`;
        let bgClass = 'bg-secondary', iconClass = 'fa-info-circle', textClass = 'text-white';
        switch (type) {
            case 'success': bgClass = 'bg-success'; iconClass = 'fa-check-circle'; break;
            case 'warning': bgClass = 'bg-warning'; iconClass = 'fa-exclamation-triangle'; textClass = 'text-dark'; break;
            case 'danger': bgClass = 'bg-danger'; iconClass = 'fa-exclamation-circle'; break;
            case 'info':
            default: bgClass = 'bg-info'; iconClass = 'fa-info-circle'; textClass = 'text-dark'; break;
        }

        const toastElement = document.createElement('div');
        toastElement.id = toastId;
        toastElement.className = `toast align-items-center ${textClass} ${bgClass} border-0 fade`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fas ${iconClass} fa-fw me-2"></i> ${escapeHTML(message)}</div><button type="button" class="btn-close me-2 m-auto ${textClass === 'text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
        toastContainer.appendChild(toastElement);

        try {
            const toastInstance = new bootstrap.Toast(toastElement, { delay: duration, autohide: true });
            toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove(), { once: true });
            toastInstance.show();
        } catch (e) {
            toastElement.remove();
        }
    }

    function initializeTooltips(scope = document.body) {
        if (!window.tippy || typeof scope?.querySelectorAll !== 'function') return;

        const newInstances = tippy(scope.querySelectorAll('[data-tippy-content]'), {
            allowHTML: true, theme: 'glass', placement: 'top', animation: 'fade',
            interactive: false, appendTo: () => document.body,
            delay: (window.APP_CONFIG && window.APP_CONFIG.UI_SETTINGS) ? window.APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY : [200, 100],
            maxWidth: 400, duration: [150, 150], zIndex: 3050,
            onCreate(instance) { if (!instance.props.content || String(instance.props.content).trim() === '') { instance.disable(); } },
            onShow(instance) { const content = instance.reference.getAttribute('data-tippy-content'); return !!content && String(content).trim() !== ''; }
        });
        if (Array.isArray(newInstances)) tippyInstances = tippyInstances.concat(newInstances);
        else if (newInstances) tippyInstances.push(newInstances);
    }

    function updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text ?? '';
        }
    }

    function updateElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html ?? '';
            initializeTooltips(element);
        }
    }

    function toggleElementClass(elementId, className, add) {
        const element = document.getElementById(elementId);
        if (element && className) {
            element.classList.toggle(className, add);
        }
    }

    function setElementDisabled(elementId, isDisabled) {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = !!isDisabled;
        }
    }

    function highlightElement(elementId, highlightClass = 'element-flash-highlight', duration = 1500) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(highlightClass);
            void element.offsetWidth;
            element.classList.add(highlightClass);
            setTimeout(() => element.classList.remove(highlightClass), duration);
        }
    }

    function attachRowCollapseListeners(tableBodyId) {
        if (!tableBodyId || collapseEventListenersAttached.has(tableBodyId)) return;
        const tableBodyElement = document.getElementById(tableBodyId);
        if (!tableBodyElement) return;
        const handleCollapseEvent = (event) => {
            const triggerRow = event.target.closest('tr.sub-row')?.previousElementSibling;
            if (!triggerRow) return;
            const icon = triggerRow.querySelector('.row-toggle-icon');
            if (icon) {
                const isShowing = event.type.startsWith('show');
                icon.classList.toggle('fa-chevron-up', isShowing);
                icon.classList.toggle('fa-chevron-down', !isShowing);
            }
        };
        tableBodyElement.addEventListener('show.bs.collapse', handleCollapseEvent);
        tableBodyElement.addEventListener('hide.bs.collapse', handleCollapseEvent);
        collapseEventListenersAttached.add(tableBodyId);
    }

    function renderTabContent(tabId, renderFunction) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) return;
        updateElementHTML(containerId, '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');
        try {
            const contentHTML = renderFunction();
            updateElementHTML(containerId, contentHTML || '<p class="text-muted p-3">No content generated.</p>');
        } catch (error) {
            const errorMessage = `<div class="alert alert-danger m-3">Error loading tab: ${error.message}</div>`;
            updateElementHTML(containerId, errorMessage);
            showToast(`Error loading tab '${tabId}'.`, 'danger');
        }
    }

    function showQuickGuide() {
        if (quickGuideModalInstance) {
            quickGuideModalInstance.show();
            return;
        }
        let modalElement = document.getElementById('quick-guide-modal');
        if (!modalElement) {
            const appVersion = (typeof window.APP_CONFIG !== 'undefined') ? window.APP_CONFIG.APP_VERSION : '3.1.0';
            const quickGuideContent = `
                <h2>1. Introduction</h2>
                <p>The <strong>Nodal Staging: Avocado Sign vs. T2 Criteria</strong> analysis tool is a client-side web application designed for scientific research in the radiological diagnosis of rectal cancer. It enables in-depth analyses and detailed comparisons of diagnostic performance for various MRI-based criteria for assessing mesorectal lymph node status (N-status). The application focuses on evaluating the novel "Avocado Sign" (AS) against established T2-weighted (T2w) morphological criteria. It is intended solely as a <strong>research instrument</strong>. The results are <strong>not for clinical diagnosis or direct patient treatment decisions</strong>.</p>
                <h3>Core functionalities include:</h3>
                <ul>
                    <li>Interactive exploration and visualization of pseudonymized patient data.</li>
                    <li>Flexible definition and immediate application of complex T2w criteria sets.</li>
                    <li>Automated identification of optimal T2w criteria combinations via an integrated brute-force optimization algorithm.</li>
                    <li>Comprehensive statistical evaluation of diagnostic performance (sensitivity, specificity, predictive values, accuracy, AUC with CIs and p-values).</li>
                    <li>Creation of content for scientific presentations and comparisons.</li>
                    <li>Generation of manuscript drafts and materials for scientific publications (specifically tailored to <em>Radiology</em> journal requirements).</li>
                    <li>Versatile export options for data, results, and graphics.</li>
                </ul>
                <p>The application operates on a fixed, integrated, pseudonymized dataset of <strong>106 patient cases</strong>.
                </p>
                <h2>2. Global UI Elements</h2>
                <ul>
                    <li><strong>Application Title:</strong> "Nodal
