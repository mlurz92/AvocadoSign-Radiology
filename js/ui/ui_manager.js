window.uiManager = (() => {
    let _tooltips = [];
    let _isQuickGuideOpen = false;
    let _isCriteriaSaved = true; // Initially assume saved

    /**
     * Updates the header statistics in the UI.
     * @param {object} stats - Object containing patient count, N, AS, and T2 statuses.
     */
    function updateHeaderStatsUI(stats) {
        if (!window.utils || !window.APP_CONFIG) return; // Defensive check
        document.getElementById('header-cohort').textContent = stats.cohort;
        document.getElementById('header-patient-count').textContent = stats.patientCount;
        document.getElementById('header-status-n').textContent = stats.statusN;
        document.getElementById('header-status-as').textContent = stats.statusAS;
        document.getElementById('header-status-t2').textContent = stats.statusT2;
    }

    /**
     * Updates the UI state of cohort selection buttons.
     * @param {string} currentCohortId - The ID of the currently active cohort.
     * @param {boolean} isLocked - True if cohort selection should be disabled.
     */
    function updateCohortButtonsUI(currentCohortId, isLocked) {
        if (!window.APP_CONFIG) return; // Defensive check
        Object.values(window.APP_CONFIG.COHORTS).forEach(cohort => {
            const button = document.getElementById(`btn-cohort-${cohort.id}`);
            if (button) {
                button.classList.toggle('active', cohort.id === currentCohortId);
                button.disabled = isLocked;
            }
        });
    }

    /**
     * Renders content into a specific tab pane.
     * @param {string} tabId - The ID of the tab (e.g., 'data', 'analysis').
     * @param {function} contentGenerator - A function that returns the HTML string for the tab's content.
     */
    function renderTabContent(tabId, contentGenerator) {
        const paneId = `${tabId}-pane`;
        const paneElement = document.getElementById(paneId);
        if (paneElement) {
            paneElement.innerHTML = contentGenerator();
            // Destroy existing tooltips before initializing new ones for the rendered content
            destroyTooltips();
            initializeTooltips(paneElement);
        }
    }

    /**
     * Attaches collapse event listeners to table rows.
     * @param {string} tableBodyId - The ID of the tbody element.
     */
    function attachRowCollapseListeners(tableBodyId) {
        const tableBody = document.getElementById(tableBodyId);
        if (!tableBody) return;

        tableBody.querySelectorAll('tr.clickable-row').forEach(row => {
            row.removeEventListener('click', handleRowClick); // Prevent duplicate listeners
            row.addEventListener('click', handleRowClick);
        });

        function handleRowClick(event) {
            // Check if the click target is NOT the toggle button itself, if it exists
            const isToggleButton = event.target.closest('.row-toggle-button');
            if (isToggleButton) return;

            const target = event.currentTarget;
            const targetId = target.dataset.bsTarget;
            const collapseElement = targetId ? document.querySelector(targetId) : null;
            if (collapseElement) {
                const isExpanded = target.getAttribute('aria-expanded') === 'true';
                const icon = target.querySelector('.row-toggle-icon');

                // Toggle logic is handled by Bootstrap's collapse, but we update the icon manually
                // as the click is on the row, not the button directly
                if (icon) {
                    if (isExpanded) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    } else {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                }
            }
        }
    }

    /**
     * Toggles the expanded/collapsed state for all detail rows in a table.
     * @param {string} tableBodyId - The ID of the tbody element.
     * @param {string} toggleButtonId - The ID of the button that triggers this action.
     */
    function toggleAllDetails(tableBodyId, toggleButtonId) {
        const tableBody = document.getElementById(tableBodyId);
        const toggleButton = document.getElementById(toggleButtonId);
        if (!tableBody || !toggleButton) return;

        const isExpanding = toggleButton.dataset.action === 'expand';
        const rows = tableBody.querySelectorAll('tr.clickable-row');

        rows.forEach(row => {
            const targetId = row.dataset.bsTarget;
            const collapseElement = targetId ? document.querySelector(targetId) : null;
            const icon = row.querySelector('.row-toggle-icon');

            if (collapseElement) {
                const bsCollapse = bootstrap.Collapse.getInstance(collapseElement) || new bootstrap.Collapse(collapseElement, { toggle: false });
                if (isExpanding) {
                    if (!row.classList.contains('show')) { // Check if not already open
                        bsCollapse.show();
                        row.setAttribute('aria-expanded', 'true');
                        if (icon) {
                            icon.classList.remove('fa-chevron-down');
                            icon.classList.add('fa-chevron-up');
                        }
                    }
                } else {
                    if (row.classList.contains('show')) { // Check if not already closed
                        bsCollapse.hide();
                        row.setAttribute('aria-expanded', 'false');
                        if (icon) {
                            icon.classList.remove('fa-chevron-up');
                            icon.classList.add('fa-chevron-down');
                        }
                    }
                }
            }
        });

        toggleButton.dataset.action = isExpanding ? 'collapse' : 'expand';
        toggleButton.innerHTML = isExpanding ? 'Collapse All Details <i class="fas fa-chevron-up ms-1"></i>' : 'Expand All Details <i class="fas fa-chevron-down ms-1"></i>';
    }

    /**
     * Updates sort icons in table headers.
     * @param {string} tableHeaderId - The ID of the thead element.
     * @param {object} sortState - Current sort state ({key, direction, subKey}).
     */
    function updateSortIcons(tableHeaderId, sortState) {
        const header = document.getElementById(tableHeaderId);
        if (!header) return;

        header.querySelectorAll('th[data-sort-key]').forEach(th => {
            let sortIcon = th.querySelector('.fa-sort, .fa-sort-up, .fa-sort-down');
            if (!sortIcon) {
                sortIcon = document.createElement('i');
                sortIcon.className = 'fas fa-sort text-muted opacity-50 ms-1';
                th.appendChild(sortIcon);
            }

            sortIcon.className = 'fas ms-1';
            if (th.dataset.sortKey === sortState.key) {
                const subHeaders = th.querySelectorAll('.sortable-sub-header');
                if (subHeaders.length > 0) {
                    // For multi-sort headers, keep a generic sort icon for the main header unless a sub-key matches
                    let subKeyMatched = false;
                    subHeaders.forEach(subH => {
                        if (subH.dataset.subKey === sortState.subKey) {
                            subKeyMatched = true;
                            // Style active sub-header
                            subH.style.fontWeight = 'bold';
                            subH.style.textDecoration = 'underline';
                            subH.style.color = 'var(--primary-color)';
                        } else {
                            // Reset other sub-headers
                            subH.style.fontWeight = '';
                            subH.style.textDecoration = '';
                            subH.style.color = '';
                        }
                    });
                    if (subKeyMatched) {
                        sortIcon.classList.add(sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
                        sortIcon.classList.remove('text-muted', 'opacity-50', 'fa-sort');
                        sortIcon.classList.add('text-primary');
                    } else {
                        sortIcon.classList.add('fa-sort', 'text-muted', 'opacity-50');
                        sortIcon.classList.remove('text-primary', 'fa-sort-up', 'fa-sort-down');
                    }
                } else {
                    // Single sort key header
                    sortIcon.classList.add(sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
                    sortIcon.classList.remove('text-muted', 'opacity-50', 'fa-sort');
                    sortIcon.classList.add('text-primary');
                }
            } else {
                // Not the active sort key
                sortIcon.classList.add('fa-sort', 'text-muted', 'opacity-50');
                sortIcon.classList.remove('text-primary', 'fa-sort-up', 'fa-sort-down');
                // Reset any sub-header styling if main key is not active
                th.querySelectorAll('.sortable-sub-header').forEach(subH => {
                    subH.style.fontWeight = '';
                    subH.style.textDecoration = '';
                    subH.style.color = '';
                });
            }
        });
    }

    /**
     * Initializes Tippy.js tooltips for elements within a given container.
     * Destroys previous tooltips if `_tooltips` array is used.
     * @param {HTMLElement} containerElement - The DOM element within which to initialize tooltips.
     */
    function initializeTooltips(containerElement) {
        if (typeof tippy === 'undefined') return; // Defensive check for Tippy.js

        // Destroy existing tooltips managed by this function to prevent duplicates
        if (_tooltips && Array.isArray(_tooltips)) {
            _tooltips.forEach(instance => {
                if (instance && typeof instance.destroy === 'function') {
                    instance.destroy();
                }
            });
            _tooltips = []; // Clear the array
        }

        // Select all elements with data-tippy-content within the container
        const elementsWithTooltips = containerElement.querySelectorAll('[data-tippy-content]');

        elementsWithTooltips.forEach(element => {
            const content = element.getAttribute('data-tippy-content');
            if (content) {
                // Determine theme based on content (e.g., error/warning messages)
                let theme = 'glass';
                if (content.includes('Warning') || content.includes('Error') || content.includes('fehler')) {
                    theme = 'warning';
                }

                const instance = tippy(element, {
                    content: content,
                    allowHTML: true,
                    animation: 'fade',
                    placement: 'auto',
                    delay: window.APP_CONFIG?.UI_SETTINGS?.TOOLTIP_DELAY || [300, 100], // [showDelay, hideDelay]
                    theme: theme,
                    touch: ['hold', 500] // Hold for 500ms on touch devices
                });
                if (instance) {
                    _tooltips.push(instance);
                }
            }
        });
    }

    /**
     * Destroys all currently active tooltips.
     */
    function destroyTooltips() {
        if (_tooltips && Array.isArray(_tooltips)) {
            _tooltips.forEach(instance => {
                if (instance && typeof instance.destroy === 'function') {
                    instance.destroy();
                }
            });
            _tooltips = [];
        }
    }

    /**
     * Shows a toast notification.
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'info', 'warning', or 'danger'.
     * @param {number} duration - Duration in ms before hiding.
     */
    function showToast(message, type = 'info', duration = window.APP_CONFIG?.UI_SETTINGS?.TOAST_DURATION_MS || 4500) {
        if (typeof bootstrap === 'undefined') return; // Defensive check
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${type} border-0 fade show`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.style.maxWidth = '350px'; // Limit toast width
        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        toastContainer.appendChild(toastElement);

        const bsToast = new bootstrap.Toast(toastElement, {
            delay: duration
        });
        bsToast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    /**
     * Updates the UI for T2 criteria controls (checkboxes, buttons, inputs).
     * @param {object} currentCriteria - The currently active criteria object.
     * @param {string} currentLogic - The currently active logic ('AND' or 'OR').
     */
    function updateT2CriteriaControlsUI(currentCriteria, currentLogic) {
        if (!window.APP_CONFIG || !window.utils) return; // Defensive checks

        // Update checkboxes
        ['size', 'shape', 'border', 'homogeneity', 'signal'].forEach(key => {
            const checkbox = document.getElementById(`check-${key}`);
            if (checkbox) {
                checkbox.checked = currentCriteria[key]?.active || false;
            }
        });

        // Update size input/range
        const sizeThreshold = currentCriteria.size?.threshold ?? window.APP_CONFIG.DEFAULT_T2_CRITERIA.size.threshold;
        const formattedThreshold = window.utils.formatNumber(sizeThreshold, 1, '', true);
        const rangeSize = document.getElementById('range-size');
        const inputSize = document.getElementById('input-size');
        const valueSize = document.getElementById('value-size');
        const isSizeActive = currentCriteria.size?.active;

        if (rangeSize) {
            rangeSize.value = formattedThreshold;
            rangeSize.disabled = !isSizeActive;
        }
        if (inputSize) {
            inputSize.value = formattedThreshold;
            inputSize.disabled = !isSizeActive;
        }
        if (valueSize) {
            valueSize.textContent = window.utils.formatNumber(sizeThreshold, 1);
        }

        // Update other criteria buttons
        ['shape', 'border', 'homogeneity', 'signal'].forEach(key => {
            const optionsContainer = document.querySelector(`.criteria-group:has(#check-${key}) .criteria-options-container`);
            const isKeyActive = currentCriteria[key]?.active;
            const currentValue = currentCriteria[key]?.value;

            if (optionsContainer) {
                optionsContainer.querySelectorAll('.t2-criteria-button').forEach(button => {
                    const buttonValue = button.dataset.value;
                    button.classList.toggle('active', isKeyActive && currentValue === buttonValue);
                    button.classList.toggle('inactive-option', !isKeyActive);
                    button.disabled = !isKeyActive;
                });
            }
        });

        // Update logic switch
        const logicSwitch = document.getElementById('t2-logic-switch');
        const logicLabel = document.getElementById('t2-logic-label');
        if (logicSwitch) {
            logicSwitch.checked = (currentLogic === 'OR');
        }
        if (logicLabel && window.APP_CONFIG.UI_TEXTS?.t2LogicDisplayNames) {
            logicLabel.textContent = window.APP_CONFIG.UI_TEXTS.t2LogicDisplayNames[currentLogic] || currentLogic;
        }
    }

    /**
     * Marks the T2 criteria card with a visual indicator if unsaved changes are present.
     * @param {boolean} isUnsaved - True if there are unsaved changes, false otherwise.
     */
    function markCriteriaSavedIndicator(isUnsaved) {
        const criteriaCard = document.getElementById('t2-criteria-card');
        const applyButton = document.getElementById('btn-apply-criteria');
        if (criteriaCard) {
            criteriaCard.classList.toggle('criteria-unsaved-indicator', isUnsaved);
        }
        if (applyButton) {
            applyButton.disabled = !isUnsaved;
        }
        _isCriteriaSaved = !isUnsaved;
    }

    /**
     * Updates the Brute-Force UI based on analysis state.
     * @param {string} state - 'initial', 'started', 'progress', 'result', 'cancelled', 'error'
     * @param {object} payload - Data related to the state (e.g., progress, best result)
     * @param {boolean} bfWorkerAvailable - Indicates if the web worker is available.
     * @param {string} currentCohort - The currently selected cohort.
     */
    function updateBruteForceUI(state, payload, bfWorkerAvailable, currentCohort) {
        if (!window.APP_CONFIG || !window.utils || !window.uiComponents) return; // Defensive checks
        
        const runnerCardContainer = document.getElementById('brute-force-runner-card-container');
        const overviewCardContainer = document.getElementById('brute-force-overview-card-container');
        if (!runnerCardContainer || !overviewCardContainer) return;

        const metricOptions = window.APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS;
        const defaultMetric = window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC;
        
        let runnerCardHTML = '';
        let bfOverviewTableHTML = window.uiComponents.createBruteForceOverviewTableHTML(window.bruteForceManager.getAllResults());
        window.updateElementHTML(overviewCardContainer.id, window.uiComponents.createStatisticsCard(
            'bf-overview-card',
            'Brute-Force Optima (Saved Results)',
            bfOverviewTableHTML,
            false // no padding
        ));
        initializeTooltips(overviewCardContainer); // Re-init tooltips for new content

        let startButtonDisabled = true;
        let cancelButtonDisabled = true;
        let applyBestButtonDisabled = true;
        let showDetailsButtonDisabled = true;
        let progressHTML = '';

        const currentCohortResults = window.bruteForceManager.getAllResultsForCohort(currentCohort);
        const selectedMetric = document.getElementById('brute-force-metric')?.value || defaultMetric;
        const currentBestResultForMetric = currentCohortResults?.[selectedMetric]?.bestResult;

        switch (state) {
            case 'initial':
                startButtonDisabled = !bfWorkerAvailable;
                cancelButtonDisabled = true;
                applyBestButtonDisabled = !currentBestResultForMetric;
                showDetailsButtonDisabled = !currentBestResultForMetric;
                progressHTML = `
                    <p class="mb-2 small text-muted">Select metric and start optimization.</p>
                    <div class="progress" style="height: 5px;"><div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>
                    <p class="small text-muted mt-2 mb-0">Progress: 0%</p>
                `;
                break;
            case 'started':
            case 'progress':
                startButtonDisabled = true;
                cancelButtonDisabled = false;
                applyBestButtonDisabled = true; // Cannot apply while running
                showDetailsButtonDisabled = true; // Cannot show details while running
                const tested = payload?.tested || 0;
                const total = payload?.total || 1;
                const percent = total > 0 ? Math.floor((tested / total) * 100) : 0;
                const currentBest = payload?.currentBest;
                const currentBestInfo = currentBest ? `Current Best: <strong>${window.utils.formatNumber(currentBest.metricValue, 4)}</strong> with <code>${window.studyT2CriteriaManager.formatCriteriaForDisplay(currentBest.criteria, currentBest.logic, true)}</code>` : 'No best found yet.';
                progressHTML = `
                    <p class="mb-2 small text-muted">Running on cohort: <strong>${window.utils.getCohortDisplayName(currentCohort)}</strong>, Metric: <strong>${payload?.metric || selectedMetric}</strong></p>
                    <div class="progress" style="height: 5px;"><div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style="width: ${percent}%;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"></div></div>
                    <p class="small text-muted mt-2 mb-0">Combinations tested: ${window.utils.formatNumber(tested, 0)} / ${window.utils.formatNumber(total, 0)} (${percent}%)</p>
                    <p class="small text-muted mb-0">${currentBestInfo}</p>
                `;
                break;
            case 'result':
                startButtonDisabled = false;
                cancelButtonDisabled = true;
                applyBestButtonDisabled = true; // Will be re-enabled after data refresh
                showDetailsButtonDisabled = false;
                const best = payload; // payload is already the best result for the metric/cohort
                const durationSeconds = (best?.duration || 0) / 1000;
                progressHTML = `
                    <p class="mb-2 small text-muted">Optimization finished for cohort: <strong>${window.utils.getCohortDisplayName(best?.cohort || currentCohort)}</strong>, Metric: <strong>${best?.metric || selectedMetric}</strong></p>
                    <div class="progress" style="height: 5px;"><div class="progress-bar bg-success" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div></div>
                    <p class="small text-muted mt-2 mb-0">Total Tested: ${window.utils.formatNumber(best?.totalTested || 0, 0)} in ${window.utils.formatNumber(durationSeconds, 1)} seconds</p>
                    <p class="small text-muted mb-0">Best Result: <strong>${window.utils.formatNumber(best?.bestResult?.metricValue, 4)}</strong> with <code>${window.studyT2CriteriaManager.formatCriteriaForDisplay(best?.bestResult?.criteria, best?.bestResult?.logic, true)}</code></p>
                `;
                break;
            case 'cancelled':
                startButtonDisabled = !bfWorkerAvailable;
                cancelButtonDisabled = true;
                applyBestButtonDisabled = !currentBestResultForMetric;
                showDetailsButtonDisabled = !currentBestResultForMetric;
                progressHTML = `
                    <p class="mb-2 small text-muted">Optimization cancelled for cohort: <strong>${window.utils.getCohortDisplayName(payload?.cohort || currentCohort)}</strong>.</p>
                    <div class="progress" style="height: 5px;"><div class="progress-bar bg-warning" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>
                    <p class="small text-muted mt-2 mb-0">Progress: Cancelled</p>
                `;
                break;
            case 'error':
                startButtonDisabled = !bfWorkerAvailable;
                cancelButtonDisabled = true;
                applyBestButtonDisabled = !currentBestResultForMetric;
                showDetailsButtonDisabled = !currentBestResultForMetric;
                progressHTML = `
                    <p class="mb-2 small text-danger">Error during optimization for cohort: <strong>${window.utils.getCohortDisplayName(payload?.cohort || currentCohort)}</strong>.</p>
                    <div class="progress" style="height: 5px;"><div class="progress-bar bg-danger" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>
                    <p class="small text-danger mt-2 mb-0">Error: ${payload?.message || 'Unknown error'}</p>
                `;
                break;
        }

        runnerCardHTML = window.uiComponents.createStatisticsCard(
            'bf-runner-card',
            'Criteria Optimization (Brute-Force)',
            `
            <div class="p-3">
                <div class="mb-3">
                    <label for="brute-force-metric" class="form-label small text-muted mb-1">Optimize for Metric:</label>
                    <select class="form-select form-select-sm" id="brute-force-metric" ${window.bruteForceManager.isRunning() ? 'disabled' : ''}>
                        ${metricOptions.map(m => `<option value="${m.value}" ${m.value === selectedMetric ? 'selected' : ''}>${m.label}</option>`).join('')}
                    </select>
                </div>
                ${progressHTML}
                <div class="d-flex justify-content-end mt-3">
                    <button class="btn btn-sm btn-outline-primary me-2" id="btn-start-brute-force" ${startButtonDisabled ? 'disabled' : ''}><i class="fas fa-play me-1"></i> Start</button>
                    <button class="btn btn-sm btn-outline-warning me-2" id="btn-cancel-brute-force" ${cancelButtonDisabled ? 'disabled' : ''}><i class="fas fa-stop me-1"></i> Cancel</button>
                    <button class="btn btn-sm btn-info me-2" id="btn-show-bf-details" ${showDetailsButtonDisabled ? 'disabled' : ''}><i class="fas fa-info-circle me-1"></i> Top 10</button>
                    <button class="btn btn-sm btn-success" id="btn-apply-best-bf-criteria" ${applyBestButtonDisabled ? 'disabled' : ''}><i class="fas fa-arrow-alt-circle-up me-1"></i> Apply Best</button>
                </div>
            </div>
            `,
            false // No default padding, content handles it
        );
        window.updateElementHTML(runnerCardContainer.id, runnerCardHTML);
        initializeTooltips(runnerCardContainer); // Re-init tooltips for new content
    }

    /**
     * Updates the state of export buttons based on availability of data/results.
     * @param {string} currentTabId - The ID of the currently active tab.
     * @param {boolean} hasBruteForceResults - True if any brute-force results exist.
     * @param {boolean} hasPatientData - True if patient data is loaded.
     */
    function updateExportButtonStates(currentTabId, hasBruteForceResults, hasPatientData) {
        if (!window.APP_CONFIG) return; // Defensive check
        const exportPane = document.getElementById('export-pane');
        if (!exportPane) return;

        const isExportTab = currentTabId === 'export';

        const buttons = exportPane.querySelectorAll('button[id^="export-"]');
        buttons.forEach(button => {
            const exportType = button.dataset.exportType;
            let shouldBeEnabled = false;

            switch (exportType) {
                case 'stats-csv':
                case 'filtered-data-csv':
                case 'comprehensivereport-html':
                case 'datatable-md':
                case 'analysistable-md':
                case 'all-zip':
                case 'csv-zip':
                case 'md-zip':
                case 'png-zip': // These buttons will be enabled regardless of chart presence, but individual chart exports might fail.
                case 'svg-zip': // Same as above.
                case 'radiology-submission-zip':
                    shouldBeEnabled = hasPatientData;
                    break;
                case 'bruteforce-txt':
                    shouldBeEnabled = hasBruteForceResults;
                    break;
                default:
                    // Any other export type not explicitly handled, e.g., comparison specific ones
                    shouldBeEnabled = hasPatientData; // A reasonable default if data exists
                    break;
            }
            button.disabled = !shouldBeEnabled;
            // Only initialize tooltips if the button is enabled and if we are on the export tab to avoid performance issues
            // tippy should be initialized once the element is added to DOM and has its content/attributes
            // it's already done by renderTabContent for the whole tab, but for disabled state changes this is explicit
            if (isExportTab) {
                const tooltipInstance = button._tippy;
                if (!shouldBeEnabled && tooltipInstance) {
                    tooltipInstance.disable();
                } else if (shouldBeEnabled && tooltipInstance) {
                    tooltipInstance.enable();
                }
            }
        });
    }

    /**
     * Updates the UI selectors for the statistics tab (single/comparison view).
     * @param {string} layout - 'einzel' or 'vergleich'.
     * @param {string} cohort1 - ID of the first cohort.
     * @param {string} cohort2 - ID of the second cohort.
     */
    function updateStatisticsSelectorsUI(layout, cohort1, cohort2) {
        if (!window.APP_CONFIG || !window.utils) return; // Defensive checks
        
        const singleViewBtn = document.getElementById('statistics-toggle-single');
        const comparisonViewBtn = document.getElementById('statistics-toggle-comparison');
        const cohortSelect1 = document.getElementById('statistics-cohort-select-1');
        const cohortSelect2 = document.getElementById('statistics-cohort-select-2');
        const cohortSelectContainer2 = document.getElementById('statistics-cohort-select-2-container');

        if (singleViewBtn) singleViewBtn.classList.toggle('active', layout === 'einzel');
        if (comparisonViewBtn) comparisonViewBtn.classList.toggle('active', layout === 'vergleich');

        const allCohorts = Object.values(window.APP_CONFIG.COHORTS);

        const populateSelect = (selectElement, selectedValue) => {
            if (!selectElement) return;
            selectElement.innerHTML = allCohorts.map(c =>
                `<option value="${c.id}" ${c.id === selectedValue ? 'selected' : ''}>${c.displayName}</option>`
            ).join('');
        };

        if (cohortSelect1) populateSelect(cohortSelect1, cohort1);
        if (cohortSelect2) populateSelect(cohortSelect2, cohort2);

        if (cohortSelectContainer2) {
            cohortSelectContainer2.style.display = layout === 'vergleich' ? 'block' : 'none';
        }
    }

    /**
     * Updates the UI for the comparison tab view selection and study selection.
     * @param {string} view - 'as-pur' or 'as-vs-t2'.
     * @param {string} selectedStudyId - ID of the selected comparison study/criteria set.
     */
    function updateComparisonViewUI(view, selectedStudyId) {
        if (!window.APP_CONFIG || !window.utils) return; // Defensive checks
        
        const asPerfBtn = document.getElementById('view-as-perf');
        const asVsT2Btn = document.getElementById('view-as-vs-t2');
        const compStudySelect = document.getElementById('comp-study-select');

        if (asPerfBtn) asPerfBtn.checked = (view === 'as-pur');
        if (asVsT2Btn) asVsT2Btn.checked = (view === 'as-vs-t2');

        if (compStudySelect) {
            compStudySelect.disabled = (view === 'as-pur');
            const allStudySets = window.studyT2CriteriaManager?.getAllStudyCriteriaSets() || []; // Defensive check for studyT2CriteriaManager
            const appliedOptionHTML = `<option value="${window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${selectedStudyId === window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID ? 'selected' : ''}>-- ${window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME} --</option>`;
            const studyOptionsHTML = allStudySets.map(set => `<option value="${set.id}" ${selectedStudyId === set.id ? 'selected' : ''}>${set.name || set.id}</option>`).join('');
            compStudySelect.innerHTML = `<option value="" ${!selectedStudyId ? 'selected' : ''} disabled>-- Please select --</option>${appliedOptionHTML}<option value="" disabled>--- Published Criteria ---</option>${studyOptionsHTML}`;
        }
    }

    /**
     * Updates the UI for the publication tab's navigation and metric selection.
     * @param {string} currentSectionId - The ID of the currently active publication section.
     * @param {string} currentBruteForceMetric - The metric selected for brute-force citation.
     */
    function updatePublicationUI(currentSectionId, currentBruteForceMetric) {
        if (!window.APP_CONFIG || !window.PUBLICATION_CONFIG) return; // Defensive checks
        
        const navContainer = document.getElementById('publication-sections-nav');
        if (navContainer) {
            navContainer.innerHTML = window.uiComponents.createPublicationNav(currentSectionId);
            // Re-initialize tooltips for the new navigation content
            initializeTooltips(navContainer);
        }

        const bfMetricSelect = document.getElementById('publication-bf-metric-select');
        if (bfMetricSelect) {
            bfMetricSelect.innerHTML = window.APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.map(m =>
                `<option value="${m.value}" ${m.value === currentBruteForceMetric ? 'selected' : ''}>${m.label}</option>`
            ).join('');
        }
    }

    /**
     * Shows the quick guide modal.
     */
    function showQuickGuide() {
        if (typeof bootstrap === 'undefined') return; // Defensive check
        if (_isQuickGuideOpen) return;

        const quickGuideModal = new bootstrap.Modal(document.getElementById('quick-guide-modal'), {
            backdrop: 'static',
            keyboard: false
        });
        quickGuideModal.show();
        _isQuickGuideOpen = true;

        document.getElementById('quick-guide-modal').addEventListener('hidden.bs.modal', () => {
            _isQuickGuideOpen = false;
        }, { once: true });
    }

    /**
     * Updates the innerHTML of a specified DOM element.
     * This function is crucial for dynamically updating content.
     * @param {string} elementId - The ID of the DOM element to update.
     * @param {string} htmlContent - The HTML string to set as content.
     */
    function updateElementHTML(elementId, htmlContent) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = htmlContent;
            // Reinitialize tooltips for newly inserted content
            initializeTooltips(element);
        }
    }

    /**
     * Adds a temporary visual highlight to an element.
     * @param {string} elementId - The ID of the element to highlight.
     */
    function highlightElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('element-flash-highlight');
            setTimeout(() => {
                element.classList.remove('element-flash-highlight');
            }, 1500); // Duration of the animation
        }
    }

    return Object.freeze({
        updateHeaderStatsUI,
        updateCohortButtonsUI,
        renderTabContent,
        attachRowCollapseListeners,
        toggleAllDetails,
        updateSortIcons,
        initializeTooltips,
        destroyTooltips, // Exposed for external use if needed (e.g., before major re-renders)
        showToast,
        updateT2CriteriaControlsUI,
        markCriteriaSavedIndicator,
        updateBruteForceUI,
        updateExportButtonStates,
        updateStatisticsSelectorsUI,
        updateComparisonViewUI,
        updatePublicationUI,
        showQuickGuide,
        updateElementHTML,
        highlightElement
    });
})();
