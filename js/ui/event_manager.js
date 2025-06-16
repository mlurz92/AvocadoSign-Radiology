window.eventManager = (() => {
    let appInstance = null;
    const debouncedInputHandler = window.utils.debounce(handleCriteriaInputChange, window.APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);

    function init(app) {
        if (!app) {
            return;
        }
        appInstance = app;
        document.body.addEventListener('click', handleEvent);
        document.body.addEventListener('change', handleEvent);
        document.body.addEventListener('input', debouncedInputHandler);
    }

    function handleEvent(e) {
        if (!appInstance) return;

        const cohortChangeButton = e.target.closest('button[id^="btn-cohort-"]');
        const tabButton = e.target.closest('.nav-link[data-bs-toggle="tab"]');
        const sortableHeader = e.target.closest('th[data-sort-key]');
        const subSortableHeader = e.target.closest('.sortable-sub-header');
        const detailsToggleButton = e.target.closest('#data-toggle-details, #analysis-toggle-details');
        const quickGuideButton = e.target.closest('#btn-quick-guide');

        const criteriaButton = e.target.closest('.t2-criteria-button');
        const criteriaCheckbox = e.target.closest('.criteria-checkbox');
        const logicSwitch = e.target.closest('#t2-logic-switch');
        const applyButton = e.target.closest('#btn-apply-criteria');
        const resetButton = e.target.closest('#btn-reset-criteria');
        
        const startBfButton = e.target.closest('#btn-start-brute-force');
        const cancelBfButton = e.target.closest('#btn-cancel-brute-force');
        const showBfDetailsButton = e.target.closest('#btn-show-bf-details');
        const applyBestBfButton = e.target.closest('#btn-apply-best-bf-criteria');
        const bfMetricSelect = e.target.closest('#brute-force-metric');

        const statsViewToggle = e.target.closest('.statistics-view-btn');
        const statsCohortSelect = e.target.closest('select[id^="statistics-cohort-select-"]');
        
        const compViewToggle = e.target.closest('.comp-view-btn');
        const compStudySelect = e.target.closest('#comp-study-select');

        const pubSectionLink = e.target.closest('.publication-section-link');
        const pubBfMetricSelect = e.target.closest('#publication-bf-metric-select');

        const exportButton = e.target.closest('button[id^="export-"]');
        const singleExportButton = e.target.closest('button[data-export-type]');
        const comparisonExportButton = e.target.closest('button[id^="download-"]');
        const chartExportButton = e.target.closest('.chart-download-btn');
        const tableExportButton = e.target.closest('.table-download-png-btn');


        if (cohortChangeButton) _handleCohortChange(cohortChangeButton);
        else if (tabButton) _handleTabChange(tabButton);
        else if (subSortableHeader) _handleSortRequest(subSortableHeader, true);
        else if (sortableHeader && !sortableHeader.querySelector('.sortable-sub-header')) _handleSortRequest(sortableHeader, false);
        else if (detailsToggleButton) _handleToggleAllDetails(detailsToggleButton);
        else if (quickGuideButton) _handleQuickGuide();
        else if (criteriaButton) _handleCriteriaButtonClick(criteriaButton);
        else if (criteriaCheckbox) _handleCriteriaCheckboxChange(criteriaCheckbox);
        else if (logicSwitch) _handleLogicSwitchChange(logicSwitch);
        else if (applyButton) _handleApplyCriteria();
        else if (resetButton) _handleResetCriteria();
        else if (startBfButton) _handleStartBruteForce();
        else if (cancelBfButton) _handleCancelBruteForce();
        else if (showBfDetailsButton) _handleShowBruteForceDetails();
        else if (applyBestBfButton) _handleApplyBestBruteForce();
        else if (bfMetricSelect) _handleBruteForceMetricChange();
        else if (statsViewToggle) _handleStatsViewChange(statsViewToggle);
        else if (statsCohortSelect) _handleStatsCohortChange(statsCohortSelect);
        else if (compViewToggle) _handleComparisonViewChange(compViewToggle);
        else if (compStudySelect) _handleComparisonStudyChange(compStudySelect);
        else if (pubSectionLink) _handlePublicationSectionChange(pubSectionLink);
        else if (pubBfMetricSelect) _handlePublicationMetricChange(pubBfMetricSelect);
        else if (exportButton) _handleExport(exportButton.dataset.exportType);
        else if (singleExportButton && e.type === 'click') _handleExport(singleExportButton.dataset.exportType);
        else if (comparisonExportButton && e.type === 'click') _handleComparisonExport(comparisonExportButton);
        else if (chartExportButton && e.type === 'click') _handleChartExport(chartExportButton);
        else if (tableExportButton && e.type === 'click') _handleTableExport(tableExportButton);
    }
    
    function _handleCohortChange(button) {
        const cohortId = button.dataset.cohort;
        if (cohortId) appInstance.handleCohortChange(cohortId);
    }

    function _handleTabChange(button) {
        const tabId = button.id.replace('-tab', '');
        appInstance.processTabChange(tabId);
    }
    
    function _handleSortRequest(headerElement, isSubHeader) {
        const key = headerElement.dataset.sortKey || headerElement.closest('th').dataset.sortKey;
        const subKey = isSubHeader ? headerElement.dataset.subKey : null;
        const context = headerElement.closest('table').id.includes('data-table') ? 'data' : 'analysis';
        appInstance.handleSortRequest(context, key, subKey);
    }

    function _handleToggleAllDetails(button) {
        const tableId = button.id.startsWith('data-') ? 'data-table-body' : 'analysis-table-body';
        window.uiManager.toggleAllDetails(tableId, button.id);
    }

    function _handleQuickGuide() {
        window.uiManager.showQuickGuide();
    }

    function _handleCriteriaButtonClick(button) {
        const criterion = button.dataset.criterion;
        const value = button.dataset.value;
        if (window.t2CriteriaManager.updateCriterionValue(criterion, value)) {
            window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
            window.uiManager.markCriteriaSavedIndicator(true);
        }
    }
    
    function _handleCriteriaCheckboxChange(checkbox) {
        const criterion = checkbox.value;
        const isActive = checkbox.checked;
        if(window.t2CriteriaManager.toggleCriterionActive(criterion, isActive)) {
            window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
            window.uiManager.markCriteriaSavedIndicator(true);
        }
    }

    function handleCriteriaInputChange(e) {
        const target = e.target;
        if (target.id === 'range-size' || target.id === 'input-size') {
            if(window.t2CriteriaManager.updateCriterionThreshold(target.value)) {
                window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
                window.uiManager.markCriteriaSavedIndicator(true);
            }
        }
    }
    
    function _handleLogicSwitchChange(switchElement) {
        const newLogic = switchElement.checked ? 'OR' : 'AND';
        if(window.t2CriteriaManager.updateLogic(newLogic)) {
            window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
            window.uiManager.markCriteriaSavedIndicator(true);
        }
    }

    function _handleApplyCriteria() {
        appInstance.applyAndRefreshAll();
    }

    function _handleResetCriteria() {
        window.t2CriteriaManager.resetCriteria();
        window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
        window.uiManager.markCriteriaSavedIndicator(true);
    }

    function _handleStartBruteForce() {
        appInstance.startBruteForceAnalysis();
    }
    
    function _handleCancelBruteForce() {
        window.bruteForceManager.cancelAnalysis();
    }
    
    function _handleShowBruteForceDetails() {
        const metric = document.getElementById('brute-force-metric')?.value;
        appInstance.showBruteForceDetails(metric);
    }
    
    function _handleApplyBestBruteForce() {
        const metric = document.getElementById('brute-force-metric')?.value;
        appInstance.applyBestBruteForceCriteria(metric);
    }
    
    function _handleBruteForceMetricChange() {
        const metric = document.getElementById('brute-force-metric')?.value;
        window.uiManager.updateBruteForceUI('initial', window.bruteForceManager.getResultsForCohortAndMetric(window.state.getCurrentCohort(), metric), window.bruteForceManager.isWorkerAvailable(), window.state.getCurrentCohort());
    }

    function _handleStatsViewChange(button) {
        const newLayout = button.id === 'statistics-toggle-single' ? 'einzel' : 'vergleich';
        if (window.state.setStatsLayout(newLayout)) {
            appInstance.refreshCurrentTab();
        }
    }

    function _handleStatsCohortChange(selectElement) {
        const whichSelect = selectElement.id.includes('-1') ? 1 : 2;
        const newCohort = selectElement.value;
        if (whichSelect === 1) {
            if(window.state.setStatsCohort1(newCohort)) appInstance.refreshCurrentTab();
        } else {
            if(window.state.setStatsCohort2(newCohort)) appInstance.refreshCurrentTab();
        }
    }

    function _handleComparisonViewChange(button) {
        const newView = button.value;
        if (window.state.setComparisonView(newView)) {
            appInstance.refreshCurrentTab();
        }
    }
    
    function _handleComparisonStudyChange(select) {
        const newStudyId = select.value;
        if (window.state.setComparisonStudyId(newStudyId)) {
            const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(newStudyId);
            if (studySet && studySet.applicableCohort && studySet.applicableCohort !== window.state.getCurrentCohort()) {
                appInstance.handleCohortChange(studySet.applicableCohort, "auto_comparison");
            } else {
                appInstance.refreshCurrentTab();
            }
        }
    }

    function _handlePublicationSectionChange(link) {
        const sectionId = link.dataset.sectionId;
        if (window.state.setPublicationSection(sectionId)) {
            appInstance.renderCurrentTab();
        }
    }

    function _handlePublicationMetricChange(select) {
        const newMetric = select.value;
        if (window.state.setPublicationBruteForceMetric(newMetric)) {
            appInstance.renderCurrentTab();
        }
    }

    function _handleExport(exportType) {
        if (!exportType) return;
        const currentTab = window.state.getActiveTabId();

        if (exportType.endsWith('-zip')) {
            window.exportService.exportCategoryZip(
                exportType.replace('-zip',''),
                appInstance.getProcessedData(),
                window.bruteForceManager.getAllResults(),
                window.state.getCurrentCohort(),
                window.t2CriteriaManager.getAppliedCriteria(),
                window.t2CriteriaManager.getAppliedLogic()
            );
        } else {
            appInstance.handleSingleExport(exportType);
        }
    }

    function _handleComparisonExport(button) {
        const actionId = button.id;
        const comparisonData = appInstance.getComparisonDataForExport();
        const currentCohort = window.state.getCurrentCohort();
        window.exportService.exportComparisonData(actionId, comparisonData, currentCohort);
    }

    function _handleChartExport(button) {
        const { chartId, format, chartName } = button.dataset;
        if (chartId && format) {
            const currentCohort = window.state.getCurrentCohort();
            window.exportService.exportSingleChart(chartId, format, currentCohort, { chartName });
        }
    }

    function _handleTableExport(button) {
        const { tableId, format, tableName } = button.dataset;
        if (tableId && format === 'png') {
            const currentCohort = window.state.getCurrentCohort();
            window.exportService.exportTablePNG(tableId, currentCohort, 'TABLE_PNG_EXPORT', tableName);
        }
    }

    return {
        init
    };
})();
