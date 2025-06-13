const publicationTab = (() => {

    function render(data, currentSectionId) {
        const { rawData, allCohortStats, bruteForceResults, currentLanguage } = data;
        
        if (!allCohortStats) {
            return '<div class="alert alert-warning">Statistics not available. Cannot generate publication content.</div>';
        }

        const overallDescriptive = allCohortStats?.[APP_CONFIG.COHORTS.OVERALL.id]?.descriptive;
        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nOverall: overallDescriptive?.patientCount || 0,
            nPositive: overallDescriptive?.nStatus?.plus || 0,
            nSurgeryAlone: allCohortStats?.[APP_CONFIG.COHORTS.SURGERY_ALONE.id]?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: allCohortStats?.[APP_CONFIG.COHORTS.NEOADJUVANT.id]?.descriptive?.patientCount || 0,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: state.getPublicationBruteForceMetric(),
            currentLanguage: currentLanguage,
            rawData: rawData // Raw data might be needed by some generators (e.g., for flowcharts, though not currently implemented)
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === currentSectionId || s.subSections.some(sub => sub.id === currentSectionId));
        
        if (!mainSection) {
            return `<div class="alert alert-danger">No section configuration found for ID '${currentSectionId}'.</div>`;
        }
        
        const mainSectionLabel = APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey;
        
        let title = mainSectionLabel; // Title is dynamic based on selected section
        
        const contentHTML = publicationService.generateSectionHTML(currentSectionId, allCohortStats, commonData);

        const finalHTML = `
            <div class="row mb-3">
                <div class="col-md-3">
                    <div class="sticky-top" style="top: var(--sticky-header-offset);">
                        ${uiComponents.createPublicationNav(currentSectionId)}
                        <div class="mt-3">
                            <label for="publication-bf-metric-select" class="form-label small text-muted">${APP_CONFIG.UI_TEXTS.publicationTab.bfMetricSelectLabel}</label>
                            <select class="form-select form-select-sm" id="publication-bf-metric-select">
                                ${APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.map(m => `<option value="${m.value}" ${m.value === commonData.bruteForceMetricForPublication ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="col-md-9">
                    <div id="publication-content-area" class="bg-white p-4 border rounded">
                        <h2 class="mb-4">${title}</h2>
                        <div class="publication-content-wrapper">
                            ${contentHTML}
                        </div>
                    </div>
                </div>
            </div>`;
            
        return finalHTML;
    }
    
    function getSectionContentForExport(sectionId, lang, statsData, commonData) {
        // This function is called by the export service to get raw HTML content for a specific section.
        // It passes the commonData and statsData needed by the generator functions.
        // Ensure commonData contains necessary fields for generating text.
        const commonDataForExport = { 
            ...commonData, 
            currentLanguage: lang, 
            nOverall: statsData?.[APP_CONFIG.COHORTS.OVERALL.id]?.descriptive?.patientCount || 0,
            nPositive: statsData?.[APP_CONFIG.COHORTS.OVERALL.id]?.descriptive?.nStatus?.plus || 0,
            nSurgeryAlone: statsData?.[APP_CONFIG.COHORTS.SURGERY_ALONE.id]?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: statsData?.[APP_CONFIG.COHORTS.NEOADJUVANT.id]?.descriptive?.patientCount || 0
        };
        return publicationService.generateSectionHTML(sectionId, statsData, commonDataForExport);
    }

    return Object.freeze({
        render,
        getSectionContentForExport
    });

})();
