window.publicationTab = (() => {

    function renderWordCounts() {
        const sectionsWithLimits = window.PUBLICATION_CONFIG.sections.filter(s => s.limit && s.countType);

        sectionsWithLimits.forEach(section => {
            const contentElement = document.getElementById(section.id);
            const navElement = document.querySelector(`.publication-section-link[data-section-id="${section.id}"]`);

            if (contentElement && navElement) {
                let currentCount = 0;
                
                if (section.countType === 'word') {
                    const text = contentElement.textContent || contentElement.innerText || '';
                    currentCount = text.trim().split(/\s+/).filter(Boolean).length;
                } else if (section.countType === 'item') {
                    currentCount = contentElement.querySelectorAll('li').length;
                }

                let countIndicator = navElement.querySelector('.word-count-indicator');
                if (!countIndicator) {
                    countIndicator = document.createElement('span');
                    countIndicator.className = 'badge rounded-pill ms-2 word-count-indicator';
                    navElement.appendChild(countIndicator);
                }
                
                countIndicator.textContent = `${currentCount} / ${section.limit}`;
                
                const ratio = currentCount / section.limit;
                let bgColorClass = 'bg-success-subtle text-success-emphasis';
                if (ratio > 1) {
                    bgColorClass = 'bg-danger text-white';
                } else if (ratio > 0.9) {
                    bgColorClass = 'bg-warning-subtle text-warning-emphasis';
                }
                countIndicator.className = `badge rounded-pill ms-2 word-count-indicator ${bgColorClass}`;
            }
        });
    }

    function render(data, currentSectionId) {
        const { rawData, allCohortStats, bruteForceResults, currentLanguage } = data;
        
        if (!allCohortStats) {
            return '<div class="alert alert-warning">Statistics not available. Cannot generate publication content.</div>';
        }

        const overallCohortId = window.APP_CONFIG.COHORTS.OVERALL.id;
        const surgeryAloneCohortId = window.APP_CONFIG.COHORTS.SURGERY_ALONE.id;
        const neoadjuvantCohortId = window.APP_CONFIG.COHORTS.NEOADJUVANT.id;

        const commonData = {
            appName: window.APP_CONFIG.APP_NAME,
            appVersion: window.APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats?.[overallCohortId]?.descriptive?.patientCount || 0,
            nPositive: allCohortStats?.[overallCohortId]?.descriptive?.nStatus?.plus || 0,
            nSurgeryAlone: allCohortStats?.[surgeryAloneCohortId]?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: allCohortStats?.[neoadjuvantCohortId]?.descriptive?.patientCount || 0,
            references: window.APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: window.state.getPublicationBruteForceMetric(),
            currentLanguage: currentLanguage,
            rawData: rawData
        };

        const isChecklistActive = currentSectionId === 'stard_checklist';
        
        let finalContentHTML = '';
        if (isChecklistActive) {
            finalContentHTML = window.stardGenerator.renderStardChecklist();
        } else {
            finalContentHTML = window.publicationService.generateFullPublicationHTML(allCohortStats, commonData);
        }
        
        const finalHTML = `
            <div class="row mb-3">
                <div class="col-md-3">
                    <div class="sticky-top" style="top: var(--sticky-header-offset);">
                        ${window.uiComponents.createPublicationNav(currentSectionId)}
                        <div class="mt-3">
                            <label for="publication-bf-metric-select" class="form-label small text-muted">${window.APP_CONFIG.UI_TEXTS.publicationTab.bfMetricSelectLabel}</label>
                            <select class="form-select form-select-sm" id="publication-bf-metric-select">
                                ${window.APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.map(m => `<option value="${m.value}" ${m.value === commonData.bruteForceMetricForPublication ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="col-md-9">
                    <div id="publication-content-area" class="bg-white p-4 border rounded">
                        <div class="publication-content-wrapper">
                            ${finalContentHTML}
                        </div>
                    </div>
                </div>
            </div>`;
        
        setTimeout(() => {
            const flowchartContainerId = 'figure-1-flowchart-container';
            if (document.getElementById(flowchartContainerId)) {
                if (typeof window.flowchartRenderer !== 'undefined' && allCohortStats?.Overall) {
                    const flowchartStats = {
                        Overall: allCohortStats[overallCohortId],
                        surgeryAlone: allCohortStats[surgeryAloneCohortId],
                        neoadjuvantTherapy: allCohortStats[neoadjuvantCohortId]
                    };
                    window.flowchartRenderer.renderFlowchart(flowchartStats, flowchartContainerId);
                }
            }
            renderWordCounts();
        }, 50);
            
        return finalHTML;
    }

    return Object.freeze({
        render
    });

})();