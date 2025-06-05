const publicationFigures = (() => {

    function _getSafeLink(elementId){
        return `#${elementId}`;
    }

    function _findConfigById(id) {
        for (const sectionKey in PUBLICATION_CONFIG.publicationElements) {
            for (const elementKey in PUBLICATION_CONFIG.publicationElements[sectionKey]) {
                if (PUBLICATION_CONFIG.publicationElements[sectionKey][elementKey].id === id) {
                    return PUBLICATION_CONFIG.publicationElements[sectionKey][elementKey];
                }
            }
        }
        return null;
    }

    function _renderFlowDiagram(allKollektivStats, lang) {
        const totalPatients = allKollektivStats?.Gesamt?.deskriptiv?.anzahlPatienten || 0;
        const direktOPPatients = allKollektivStats?.['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
        const nRCTPatients = allKollektivStats?.nRCT?.deskriptiv?.anzahlPatienten || 0;

        const figureConfig = PUBLICATION_CONFIG.publicationElements.methoden.flowDiagram;
        const title = lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn;
        const figRef = lang === 'de' ? `Abbildung Methoden 1` : `Methods Figure 1`;


        const flowHtml = `
            <h4 class="mt-4 mb-3" id="${figureConfig.id}-title">${title}</h4>
            <div class="flow-diagram-container" style="max-width: 600px; margin: auto; padding: 10px; border: 1px solid #eee; border-radius: 5px; background-color: #fff; text-align: center;">
                <svg width="100%" viewBox="0 0 500 450" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                    <style>
                        .node { fill: #f0f8ff; stroke: #4682b4; stroke-width: 1px; }
                        .node-main { fill: #e0f0ff; stroke: #2a628a; stroke-width: 2px; }
                        .arrow { stroke: #333; stroke-width: 1.5px; fill: none; marker-end: url(#arrowhead); }
                        .label { font-family: sans-serif; font-size: 12px; fill: #333; text-anchor: middle; }
                        .label-small { font-size: 10px; fill: #555; }
                        .badge-count { font-weight: bold; fill: #000; }
                    </style>
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
                        </marker>
                    </defs>

                    <rect class="node-main" x="150" y="20" width="200" height="50" rx="5" ry="5"/>
                    <text class="label" x="250" y="40">${lang === 'de' ? 'Patienten im Datensatz' : 'Patients in Dataset'}</text>
                    <text class="label badge-count" x="250" y="58">N=${totalPatients}</text>

                    <line class="arrow" x1="250" y1="70" x2="250" y2="120"/>

                    <rect class="node" x="150" y="120" width="200" height="50" rx="5" ry="5"/>
                    <text class="label" x="250" y="140">${lang === 'de' ? 'Unterzogen sich Baseline-MRT' : 'Underwent Baseline MRI'}</text>
                    <text class="label badge-count" x="250" y="158">N=${totalPatients}</text>

                    <line class="arrow" x1="250" y1="170" x2="150" y2="220"/>
                    <line class="arrow" x1="250" y1="170" x2="370" y2="220"/>

                    <rect class="node-main" x="50" y="220" width="200" height="50" rx="5" ry="5"/>
                    <text class="label" x="150" y="240">${lang === 'de' ? 'Primärchirurgie (Direkt OP)' : 'Upfront Surgery (Upfront OP)'}</text>
                    <text class="label badge-count" x="150" y="258">N=${direktOPPatients}</text>

                    <rect class="node-main" x="270" y="220" width="200" height="50" rx="5" ry="5"/>
                    <text class="label" x="370" y="240">${lang === 'de' ? 'Neoadjuvante Radiochemotherapie' : 'Neoadjuvant Chemoradiotherapy'}</text>
                    <text class="label badge-count" x="370" y="258">N=${nRCTPatients}</text>

                    <line class="arrow" x1="370" y1="270" x2="370" y2="320"/>

                    <rect class="node" x="270" y="320" width="200" height="50" rx="5" ry="5"/>
                    <text class="label" x="370" y="340">${lang === 'de' ? 'Restaging-MRT (nRCT-Gruppe)' : 'Restaging MRI (nRCT Group)'}</text>
                    <text class="label badge-count" x="370" y="358">N=${nRCTPatients}</text>
                    <text class="label-small" x="370" y="375">${lang === 'de' ? '(Avocado Sign auf Restaging-MRT bewertet)' : '(Avocado Sign assessed on Restaging MRI)'}</text>

                    <line class="arrow" x1="150" y1="270" x2="250" y2="400"/>
                    <line class="arrow" x1="370" y1="370" x2="250" y2="400"/>

                    <rect class="node-main" x="150" y="400" width="200" height="50" rx="5" ry="5"/>
                    <text class="label" x="250" y="420">${lang === 'de' ? 'In finale Analyse eingeschlossen' : 'Included in Final Analysis'}</text>
                    <text class="label badge-count" x="250" y="438">N=${totalPatients}</text>
                </svg>
            </div>
            <p class="small text-muted mt-3" style="text-align: center;">
                ${figRef}. ${lang === 'de' ? `Flussdiagramm der Patientenrekrutierung. Die Zahlen basieren auf dem in der Anwendung verwendeten Datensatz (N=${totalPatients}).` : `Patient recruitment flowchart. Numbers are based on the dataset used in the application (n=${totalPatients}).`}
            </p>
        `;
        return flowHtml;
    }

    function _renderAgeDistributionChart(ageData, targetElementId, options = {}, lang = 'de') {
        const figureConfig = _findConfigById(targetElementId);
        const chartTitle = figureConfig ? (lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn) : (lang === 'de' ? 'Altersverteilung' : 'Age Distribution');
        const figRef = lang === 'de' ? `Abbildung Ergebnisse 1a` : `Results Figure 1a`;
        const kollektivName = getKollektivDisplayName("Gesamt");

        const chartHtml = `
            <div class="chart-container border rounded p-2" id="${targetElementId}">
                <h5 class="text-center small mb-1">${chartTitle}</h5>
                <div id="${targetElementId}-chart-area" style="min-height: 220px;"></div>
                <p class="text-muted small text-center p-1">${figRef}</p>
            </div>
        `;
        return chartHtml;
    }

    function _renderGenderDistributionChart(genderData, targetElementId, options = {}, lang = 'de') {
        const figureConfig = _findConfigById(targetElementId);
        const chartTitle = figureConfig ? (lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn) : (lang === 'de' ? 'Geschlechterverteilung' : 'Gender Distribution');
        const figRef = lang === 'de' ? `Abbildung Ergebnisse 1b` : `Results Figure 1b`;

        const chartHtml = `
            <div class="chart-container border rounded p-2" id="${targetElementId}">
                <h5 class="text-center small mb-1">${chartTitle}</h5>
                <div id="${targetElementId}-chart-area" style="min-height: 220px;"></div>
                <p class="text-muted small text-center p-1">${figRef}</p>
            </div>
        `;
        return chartHtml;
    }

    function _renderComparisonPerformanceChart(kolId, chartDataComp, targetElementId, options = {}, t2Label = 'T2', lang = 'de') {
        const figureConfig = _findConfigById(targetElementId);
        const chartTitle = figureConfig ? (lang === 'de' ? figureConfig.titleDe : figureConfig.titleEn) : (lang === 'de' ? `Vergleichsmetriken für ${getKollektivDisplayName(kolId)}` : `Comparative Metrics for ${getKollektivDisplayName(kolId)}`);

        const chartLetterMap = {
            'Gesamt': 'a',
            'direkt OP': 'b',
            'nRCT': 'c'
        };
        const chartLetter = chartLetterMap[kolId] || '';
        const figRef = lang === 'de' ? `Abbildung Ergebnisse 2${chartLetter}` : `Results Figure 2${chartLetter}`;

        const chartHtml = `
            <div class="chart-container border rounded p-2" id="${targetElementId}">
                <h5 class="text-center small mb-1">${chartTitle}</h5>
                <div id="${targetElementId}-chart-area" style="min-height: 250px;"></div>
                <p class="text-muted small text-center p-1">${figRef}</p>
            </div>
        `;
        return chartHtml;
    }

    return Object.freeze({
        renderFlowDiagram: _renderFlowDiagram,
        renderAgeDistributionChart: _renderAgeDistributionChart,
        renderGenderDistributionChart: _renderGenderDistributionChart,
        renderComparisonPerformanceChart: _renderComparisonPerformanceChart
    });

})();
