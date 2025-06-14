window.publicationTab = (() => {

    function _processAndNumberReferences(html, allReferences) {
        const citedRefKeys = new Map();
        let refCounter = 1;

        const processedHtml = html.replace(/\[([A-Za-z0-9_]+)\]/g, (match, refKey) => {
            if (!allReferences[refKey]) return match;
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
                if (!refData) return '';
                const styledText = refData.text.replace(/(\d{4};\d{1,3}:\d{1,4}–\d{1,4})/, '<strong>$1</strong>');
                return `<li>${styledText}</li>`;
            }).join('');
            referencesHtml = `<h3 id="references_main">References</h3><ol>${listItems}</ol>`;
        }

        return { processedHtml, referencesHtml };
    }

    function render(data, currentSectionId) {
        const { rawData, allCohortStats, bruteForceResults, currentLanguage } = data;
        
        if (!allCohortStats) {
            return '<div class="alert alert-warning">Statistics not available. Cannot generate publication content. Please run analysis on the relevant tabs.</div>';
        }

        const commonData = {
            appName: window.APP_CONFIG.APP_NAME,
            appVersion: window.APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats?.[window.APP_CONFIG.COHORTS.OVERALL.id]?.descriptive?.patientCount || 0,
            nPositive: allCohortStats?.[window.APP_CONFIG.COHORTS.OVERALL.id]?.descriptive?.nStatus?.plus || 0,
            nSurgeryAlone: allCohortStats?.[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id]?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: allCohortStats?.[window.APP_CONFIG.COHORTS.NEOADJUVANT.id]?.descriptive?.patientCount || 0,
            references: window.APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: window.state.getPublicationBruteForceMetric(),
            currentLanguage: currentLanguage,
            rawData: rawData
        };

        let rawContentHTML = '';
        window.PUBLICATION_CONFIG.sections.forEach(section => {
            if (section.id !== 'references_main') {
                rawContentHTML += window.publicationService.generateSectionHTML(section.id, allCohortStats, commonData);
            }
        });

        const { processedHtml, referencesHtml } = _processAndNumberReferences(rawContentHTML, commonData.references);
        const finalContentHTML = processedHtml + referencesHtml;
        
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
                if (typeof window.flowchartRenderer !== 'undefined' && allCohortStats) {
                    window.flowchartRenderer.renderFlowchart(allCohortStats, flowchartContainerId);
                }
            }
            if (typeof window.uiManager !== 'undefined') {
                const contentArea = document.getElementById('publication-content-area');
                if(contentArea) window.uiManager.initializeTooltips(contentArea);
            }
        }, 50);
            
        return finalHTML;
    }

    function getSectionContentForExport(sectionId, lang, allCohortStats, commonData) {
        if (typeof window.publicationService === 'undefined') {
            console.error("publicationService is not defined for export content generation.");
            return `Error: publicationService not available for section '${sectionId}'.`;
        }
        return window.publicationService.generateSectionHTML(sectionId, allCohortStats, commonData);
    }


    return Object.freeze({
        render,
        getSectionContentForExport
    });

})();
