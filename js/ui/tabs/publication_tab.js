const publicationTab = (() => {

    function _processAndNumberReferences(html, allReferences) {
        const citedRefKeys = new Map();
        let refCounter = 1;

        const processedHtml = html.replace(/\]+)\]/g, (match, refKey) => {
            if (!citedRefKeys.has(refKey)) {
                citedRefKeys.set(refKey, refCounter++);
            }
            return `(${citedRefKeys.get(refKey)})`;
        });

        const sortedCitedRefs = Array.from(citedRefKeys.entries()).sort((a, b) => a[1] - b[1]);

        let referencesHtml = '';
        if (sortedCitedRefs.length > 0) {
            const listItems = sortedCitedRefs.map(([key, number]) => {
                const refData = allReferences[key];
                return refData ? `<li>${refData.text.replace(/(\d{4};\d{1,3}:\d{1,4}–\d{1,4})/, '<strong>$1</strong>')}</li>` : '';
            }).join('');
            referencesHtml = `<h3 id="references_main">References</h3><ol>${listItems}</ol>`;
        }

        return { processedHtml, referencesHtml };
    }

    function render(data, currentSectionId) {
        const { rawData, allCohortStats, bruteForceResults, currentLanguage } = data;
        
        if (!allCohortStats) {
            return '<div class="alert alert-warning">Statistics not available. Cannot generate publication content.</div>';
        }

        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats?.[APP_CONFIG.COHORTS.OVERALL.id]?.descriptive?.patientCount || 0,
            nPositive: allCohortStats?.[APP_CONFIG.COHORTS.OVERALL.id]?.descriptive?.nStatus?.plus || 0,
            nSurgeryAlone: allCohortStats?.[APP_CONFIG.COHORTS.SURGERY_ALONE.id]?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: allCohortStats?.[APP_CONFIG.COHORTS.NEOADJUVANT.id]?.descriptive?.patientCount || 0,
            references: APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: state.getPublicationBruteForceMetric(),
            currentLanguage: currentLanguage,
            rawData: rawData
        };

        let rawContentHTML = '';
        PUBLICATION_CONFIG.sections.forEach(section => {
            if (section.id !== 'references_main') {
                rawContentHTML += publicationService.generateSectionHTML(section.id, allCohortStats, commonData);
            }
        });

        const { processedHtml, referencesHtml } = _processAndNumberReferences(rawContentHTML, commonData.references);
        const finalContentHTML = processedHtml + referencesHtml;
        
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
                        <div class="publication-content-wrapper">
                            ${finalContentHTML}
                        </div>
                    </div>
                </div>
            </div>`;
        
        setTimeout(() => {
            const flowchartContainerId = 'figure-1-flowchart-container';
            if (document.getElementById(flowchartContainerId)) {
                if (typeof flowchartRenderer !== 'undefined' && allCohortStats) {
                    flowchartRenderer.renderFlowchart(allCohortStats, flowchartContainerId);
                }
            }
            if (typeof uiManager !== 'undefined') {
                const contentArea = document.getElementById('publication-content-area');
                if(contentArea) uiManager.initializeTooltips(contentArea);
            }
        }, 50);
            
        return finalHTML;
    }

    return Object.freeze({
        render
    });

})();
