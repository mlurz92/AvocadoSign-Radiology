const publicationTab = (() => {

    function render(data, currentSectionId) {
        const { rawData, allCohortStats, bruteForceResults, currentLanguage } = data;
        
        if (!allCohortStats) {
            return '<div class="alert alert-warning">Statistics not available. Cannot generate publication content.</div>';
        }

        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats?.Overall?.descriptive?.patientCount || 0,
            nPositive: allCohortStats?.Overall?.descriptive?.nStatus?.plus || 0,
            nSurgeryAlone: allCohortStats?.surgeryAlone?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: allCohortStats?.neoadjuvantTherapy?.descriptive?.patientCount || 0,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: state.getPublicationBruteForceMetric(),
            currentLanguage: currentLanguage,
            rawData: rawData
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.subSections.some(sub => sub.id === currentSectionId));
        if (!mainSection) {
            return `<p class="text-warning">No section defined for ID '${currentSectionId}'.</p>`;
        }
        
        const mainSectionLabel = APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey;
        const subSection = mainSection.subSections.find(sub => sub.id === currentSectionId);
        const subSectionLabel = subSection ? subSection.label : '';

        let title = mainSectionLabel;
        if (subSectionLabel && mainSection.subSections.length > 1) {
            title += `: ${subSectionLabel}`;
        }
        
        const contentHTML = publicationService.generateSectionHTML(currentSectionId, allCohortStats, commonData);

        const finalHTML = `
            <div class="row mb-3">
                <div class="col-md-3">
                    <div class="sticky-top" style="top: calc(var(--sticky-header-offset, 111px) + 1rem);">
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
        return publicationService.generateSectionHTML(sectionId, statsData, commonData);
    }

    return Object.freeze({
        render,
        getSectionContentForExport
    });

})();
