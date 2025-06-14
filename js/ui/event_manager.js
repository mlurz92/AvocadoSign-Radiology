window.eventManager = (() => {
    let app;

    const debouncedUpdateSizeInput = debounce(value => {
        if (window.t2CriteriaManager.updateCriterionThreshold(value)) {
            if (!window.t2CriteriaManager.getCurrentCriteria().size?.active) {
                window.t2CriteriaManager.toggleCriterionActive('size', true);
            }
            window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
            window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
        }
    }, window.APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS);

    function init(appInstance) {
        app = appInstance;
        document.body.addEventListener('click', handleBodyClick);
        document.body.addEventListener('change', handleBodyChange);
        document.body.addEventListener('input', handleBodyInput);
        const mainTabEl = document.getElementById('main-tabs');
        if (mainTabEl) {
            mainTabEl.addEventListener('shown.bs.tab', handleTabShown);
        }
    }

    function handleTabShown(event) {
        if (event.target?.id) {
            app.processTabChange(event.target.id.replace('-tab', ''));
        }
    }

    function handleBodyClick(event) {
        const target = event.target;
        const button = target.closest('button');
        
        if (button?.dataset.cohort) {
            app.handleCohortChange(button.dataset.cohort, "user");
            return;
        }

        if (target.closest('th[data-sort-key]')) {
            const header = target.closest('th[data-sort-key]');
            const subHeader = target.closest('.sortable-sub-header');
            handleSortClick(header, subHeader);
            return;
        }

        if (target.closest('.publication-section-link')) {
            event.preventDefault();
            handlePublicationSectionChange(target.closest('.publication-section-link').dataset.sectionId);
            return;
        }

        if (!button) return;

        const singleClickActions = {
            'btn-quick-guide': () => window.uiManager.showQuickGuide(),
            'data-toggle-details': () => window.uiManager.toggleAllDetails('data-table-body', button.id),
            'analysis-toggle-details': () => window.uiManager.toggleAllDetails('analysis-table-body', button.id),
            'btn-reset-criteria': () => {
                window.t2CriteriaManager.resetCriteria();
                window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
                window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
                window.uiManager.showToast('T2 criteria have been reset to default.', 'info');
            },
            'btn-apply-criteria': () => app.applyAndRefreshAll(),
            'btn-start-brute-force': () => app.startBruteForceAnalysis(),
            'btn-cancel-brute-force': () => window.bruteForceManager.cancelAnalysis(),
            'btn-apply-best-bf-criteria': () => app.applyBestBruteForceCriteria(),
            'statistics-toggle-comparison': () => handleStatsLayoutToggle(button),
            'export-bruteforce-modal-txt': () => window.exportService.exportBruteForceReport(window.bruteForceManager.getResultsForCohort(window.state.getCurrentCohort()))
        };

        if (singleClickActions[button.id] && !button.disabled) {
            singleClickActions[button.id]();
            return;
        }
        
        if (button.classList.contains('t2-criteria-button') && !button.disabled) {
            if (window.t2CriteriaManager.updateCriterionValue(button.dataset.criterion, button.dataset.value)) {
                window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
                window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
            }
            return;
        }

        if (button.classList.contains('chart-download-btn') && !button.disabled) {
            window.exportService.exportSingleChart(
                button.dataset.chartId, 
                button.dataset.format, 
                window.state.getCurrentCohort(), 
                { chartName: button.dataset.chartName || button.dataset.defaultName }
            );
            return;
        }

        if (button.classList.contains('table-download-png-btn') && !button.disabled) {
            window.exportService.exportTablePNG(button.dataset.tableId, window.state.getCurrentCohort(), 'TABLE_PNG_EXPORT', button.dataset.tableName);
            return;
        }

        if (button.closest('#export-pane') && button.id.startsWith('export-') && !button.disabled) {
            handleExportClick(button);
            return;
        }

        if (button.closest('#comparison-tab-pane') && button.id.startsWith('download-') && !button.disabled) {
            window.exportService.exportComparisonData(button.id, app.getComparisonDataForExport(), window.state.getCurrentCohort());
            return;
        }
    }

    function handleBodyChange(event) {
        const target = event.target;
        if (target.classList.contains('criteria-checkbox')) {
            handleT2CheckboxChange(target);
            return;
        }
        
        const changeActions = {
            't2-logic-switch': () => handleT2LogicChange(target),
            'statistics-cohort-select-1': () => handleStatsCohortChange(target),
            'statistics-cohort-select-2': () => handleStatsCohortChange(target),
            'comp-study-select': () => handleComparisonStudyChange(target.value),
            'publication-bf-metric-select': () => handlePublicationBfMetricChange(target.value)
        };
        
        if (changeActions[target.id]) {
            changeActions[target.id]();
            return;
        }

        if (target.name === 'comparisonView') {
            handleComparisonViewChange(target.value);
            return;
        }
    }

    function handleBodyInput(event) {
        const target = event.target;
        if (target.id === 'range-size' || target.id === 'input-size') {
            const sizeValueDisplay = document.getElementById('value-size');
            const sizeRangeInput = document.getElementById('range-size');
            const sizeManualInput = document.getElementById('input-size');
            const newValue = formatNumber(target.value, 1, '', true);

            if (target.id === 'range-size') {
                if(sizeValueDisplay) sizeValueDisplay.textContent = formatNumber(newValue, 1);
                if(sizeManualInput) sizeManualInput.value = newValue;
            } else {
                if(sizeValueDisplay) sizeValueDisplay.textContent = formatNumber(newValue, 1);
                if(sizeRangeInput) sizeRangeInput.value = parseFloat(newValue);
            }
            debouncedUpdateSizeInput(newValue);
        }
    }

    function handleSortClick(header, subHeader) {
        const key = header.dataset.sortKey;
        if (!key) return;
        const subKey = subHeader?.dataset.subKey || null;
        const tableId = header.closest('table')?.id;
        const context = tableId === 'data-table' ? 'data' : 'analysis';
        app.handleSortRequest(context, key, subKey);
    }

    function handleT2CheckboxChange(checkbox) {
        if (window.t2CriteriaManager.toggleCriterionActive(checkbox.value, checkbox.checked)) {
            window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
            window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
        }
    }

    function handleT2LogicChange(logicSwitch) {
        const newLogic = logicSwitch.checked ? 'OR' : 'AND';
        if (window.t2CriteriaManager.updateLogic(newLogic)) {
            window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
            window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
        }
    }

    function handleStatsLayoutToggle(button) {
        const newLayout = button.classList.contains('active') ? 'einzel' : 'vergleich';
        if (window.state.setStatsLayout(newLayout)) {
            app.updateUI();
            if (window.state.getActiveTabId() === 'statistics') app.refreshCurrentTab();
        }
    }

    function handleStatsCohortChange(selectElement) {
        const newValue = selectElement.value;
        let needsRender = false;
        if (selectElement.id === 'statistics-cohort-select-1') {
            needsRender = window.state.setStatsCohort1(newValue);
        } else if (selectElement.id === 'statistics-cohort-select-2') {
            needsRender = window.state.setStatsCohort2(newValue);
        }
        if (needsRender && window.state.getStatsLayout() === 'vergleich' && window.state.getActiveTabId() === 'statistics') {
            app.refreshCurrentTab();
        }
    }

    function handleComparisonViewChange(view) {
        if (window.state.setComparisonView(view)) {
            app.updateUI();
            if (window.state.getActiveTabId() === 'comparison') app.refreshCurrentTab();
        }
    }

    function handleComparisonStudyChange(studyId) {
        if (window.state.getComparisonStudyId() === studyId) return;
        const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
        let refreshNeeded = window.state.setComparisonStudyId(studyId);
        if (studySet?.applicableCohort && window.state.getCurrentCohort() !== studySet.applicableCohort) {
            app.handleCohortChange(studySet.applicableCohort, "auto_comparison");
            refreshNeeded = false;
        }
        if (refreshNeeded) {
            app.updateUI();
            if (window.state.getActiveTabId() === 'comparison') app.refreshCurrentTab();
        }
    }

    function handlePublicationSectionChange(sectionId) {
        if (window.state.setPublicationSection(sectionId)) {
            app.updateUI();
            if (window.state.getActiveTabId() === 'publication') {
                app.refreshCurrentTab();
                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        }
    }

    function handlePublicationBfMetricChange(newMetric) {
        if (window.state.setPublicationBruteForceMetric(newMetric)) {
            app.updateUI();
            if (window.state.getActiveTabId() === 'publication') app.refreshCurrentTab();
        }
    }

    function handleExportClick(button) {
        const exportType = button.id.replace('export-', '');
        if (exportType.endsWith('-zip')) {
            const category = exportType.replace('-zip', '');
            window.exportService.exportCategoryZip(category, app.getProcessedData(), window.bruteForceManager.getAllResults(), window.state.getCurrentCohort(), window.t2CriteriaManager.getAppliedCriteria(), window.t2CriteriaManager.getAppliedLogic());
        } else {
            app.handleSingleExport(exportType);
        }
    }

    return Object.freeze({
        init
    });
})();
