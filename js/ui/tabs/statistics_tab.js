window.statisticsTab = (() => {

    function createDescriptiveStatsContentHTML(stats, indexSuffix, cohortId) {
        if (!stats || !stats.descriptive || !stats.descriptive.patientCount) return '<p class="text-muted small p-3">No descriptive data available.</p>';
        const d = stats.descriptive;
        const total = d.patientCount;
        const na = window.APP_CONFIG.NA_PLACEHOLDER;
        const fv = (val, dig = 1, useStd = true) => formatNumber(val, dig, na, useStd);
        const fP = (val, dig = 1) => formatPercent(val, dig, na);
        const fLK = (lkData) => `${fv(lkData?.median,1)} (${fv(lkData?.min,0)}–${fv(lkData?.max,0)}) [${fv(lkData?.mean,1)} ± ${fv(lkData?.sd,1)}]`;

        const tooltips = {
            age: "Patient age in years (Median, Min-Max, Mean ± Standard Deviation).",
            sex: "Distribution of male and female patients.",
            therapy: "Distribution of treatment approaches before surgery.",
            nStatus: "Distribution of final histopathological N-Status (N+/N-).",
            asStatus: "Distribution of Avocado Sign status (AS+/AS-).",
            t2Status: "Distribution of T2-weighted criteria status (T2+/T2-) based on applied settings.",
            lnCounts_n_total: "Number of histopathologically examined lymph nodes per patient.",
            lnCounts_n_plus: `Number of pathologically positive lymph nodes per patient, evaluated only in N+ patients (n=${d.nStatus?.plus ?? 0}).`,
            lnCounts_as_total: "Total number of lymph nodes visible on T1-CE MRI per patient.",
            lnCounts_as_plus: `Number of Avocado Sign positive lymph nodes per patient, evaluated only in AS+ patients (n=${d.asStatus?.plus ?? 0}).`,
            lnCounts_t2_total: "Total number of lymph nodes visible on T2-MRI per patient.",
            lnCounts_t2_plus: `Number of T2-positive lymph nodes (based on applied criteria) per patient, evaluated only in T2+ patients (n=${d.t2Status?.plus ?? 0}).`,
            chartAge: `Histogram showing the distribution of patient ages in the <strong>${getCohortDisplayName(cohortId)}</strong> cohort.`,
            chartGender: `Pie chart illustrating the distribution of male and female patients in the <strong>${getCohortDisplayName(cohortId)}</strong> cohort.`
        };

        return `
            <div class="row g-3 p-2">
                <div class="col-md-6">
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-descriptive-demographics-${indexSuffix}">
                            <caption>Demographics & Status (N=${total})</caption>
                            <thead class="visually-hidden"><tr><th>Metric</th><th>Value</th></tr></thead>
                            <tbody>
                                <tr data-tippy-content="${tooltips.age}"><td>Age, Median (Min–Max) [Mean ± SD]</td><td>${fv(d.age?.median,1)} (${fv(d.age?.min,0)}–${fv(d.age?.max,0)}) [${fv(d.age?.mean,1)} ± ${fv(d.age?.sd,1)}]</td></tr>
                                <tr data-tippy-content="${tooltips.sex}"><td>Sex (male / female) (n / %)</td><td>${d.sex?.m ?? 0} / ${d.sex?.f ?? 0} (${fP((d.sex?.m ?? 0) / total, 1)} / ${fP((d.sex?.f ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${tooltips.therapy}"><td>Therapy (Surgery alone / Neoadjuvant therapy) (n / %)</td><td>${d.therapy?.surgeryAlone ?? 0} / ${d.therapy?.neoadjuvantTherapy ?? 0} (${fP((d.therapy?.surgeryAlone ?? 0) / total, 1)} / ${fP((d.therapy?.neoadjuvantTherapy ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${tooltips.nStatus}"><td>N Status (+ / -) (n / %)</td><td>${d.nStatus?.plus ?? 0} / ${d.nStatus?.minus ?? 0} (${fP((d.nStatus?.plus ?? 0) / total, 1)} / ${fP((d.nStatus?.minus ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${tooltips.asStatus}"><td>AS Status (+ / -) (n / %)</td><td>${d.asStatus?.plus ?? 0} / ${d.asStatus?.minus ?? 0} (${fP((d.asStatus?.plus ?? 0) / total, 1)} / ${fP((d.asStatus?.minus ?? 0) / total, 1)})</td></tr>
                                <tr data-tippy-content="${tooltips.t2Status}"><td>T2 Status (+ / -) (n / %)</td><td>${d.t2Status?.plus ?? 0} / ${d.t2Status?.minus ?? 0} (${fP((d.t2Status?.plus ?? 0) / total, 1)} / ${fP((d.t2Status?.minus ?? 0) / total, 1)})</td></tr>
                            </tbody>
                        </table>
                    </div>
                     <div class="table-responsive">
                        <table class="table table-sm table-striped small mb-0 caption-top" id="table-descriptive-ln-${indexSuffix}">
                             <caption>Lymph Node Counts (Median (Min–Max) [Mean ± SD])</caption>
                             <thead class="visually-hidden"><tr><th>Metric</th><th>Value</th></tr></thead>
                             <tbody>
                                <tr data-tippy-content="${tooltips.lnCounts_n_total}"><td>LN N total</td><td>${fLK(d.lnCounts?.n?.total)}</td></tr>
                                <tr data-tippy-content="${tooltips.lnCounts_n_plus}"><td>LN N+ <sup>*</sup></td><td>${fLK(d.lnCounts?.n?.plus)}</td></tr>
                                <tr data-tippy-content="${tooltips.lnCounts_as_total}"><td>LN AS total</td><td>${fLK(d.lnCounts?.as?.total)}</td></tr>
                                <tr data-tippy-content="${tooltips.lnCounts_as_plus}"><td>LN AS+ <sup>**</sup></td><td>${fLK(d.lnCounts?.as?.plus)}</td></tr>
                                <tr data-tippy-content="${tooltips.lnCounts_t2_total}"><td>LN T2 total</td><td>${fLK(d.lnCounts?.t2?.total)}</td></tr>
                                <tr data-tippy-content="${tooltips.lnCounts_t2_plus}"><td>LN T2+ <sup>***</sup></td><td>${fLK(d.lnCounts?.t2?.plus)}</td></tr>
                             </tbody>
                        </table>
                     </div>
                    <p class="small text-muted mt-1 mb-0"><sup>*</sup> Only in N+ patients (n=${d.nStatus?.plus ?? 0}); <sup>**</sup> Only in AS+ patients (n=${d.asStatus?.plus ?? 0}); <sup>***</sup> Only in T2+ patients (n=${d.t2Status?.plus ?? 0}).</p>
                </div>
                <div class="col-md-6 d-flex flex-column">
                    <div class="mb-2 flex-grow-1" id="chart-stat-age-${indexSuffix}" data-tippy-content="${tooltips.chartAge}"></div>
                    <div class="flex-grow-1" id="chart-stat-gender-${indexSuffix}" data-tippy-content="${tooltips.chartGender}"></div>
                </div>
            </div>`;
    }

    // Angepasste Funktion createCriteriaComparisonTableHTML
    function createCriteriaComparisonTableHTML(allStats, globalCoh, appliedT2DisplayString) {
        const na_stat = window.APP_CONFIG.NA_PLACEHOLDER;
        const results = [];
        const asPerf = allStats[globalCoh]?.performanceAS;
        if(asPerf) {
            results.push({
                name: window.APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME,
                cohort: getCohortDisplayName(globalCoh),
                n: allStats[globalCoh]?.descriptive?.patientCount || '?',
                ...asPerf
            });
        }
        
        const appliedPerf = allStats[globalCoh]?.performanceT2Applied;
        const appliedComp = allStats[globalCoh]?.comparisonASvsT2Applied;
        if(appliedPerf) {
            results.push({
                name: appliedT2DisplayString, // NEU: Dynamische Beschriftung
                cohort: getCohortDisplayName(globalCoh),
                n: allStats[globalCoh]?.descriptive?.patientCount || '?',
                pValue: appliedComp?.delong?.pValue,
                ...appliedPerf
            });
        }

        const bfPerf = allStats[globalCoh]?.performanceT2Bruteforce;
        const bfComp = allStats[globalCoh]?.comparisonASvsT2Bruteforce;
        if(bfPerf) {
            results.push({
                name: 'Cohort-Optimized T2 (BF)',
                cohort: getCohortDisplayName(globalCoh),
                n: allStats[globalCoh]?.descriptive?.patientCount || '?',
                pValue: bfComp?.delong?.pValue,
                ...bfPerf
            });
        }

        const litSets = window.studyT2CriteriaManager.getAllStudyCriteriaSets();
        litSets.forEach(set => {
            const cohortForSet = set.applicableCohort || window.APP_CONFIG.COHORTS.OVERALL.id;
            const perf = allStats[cohortForSet]?.performanceT2Literature?.[set.id];
            const comp = allStats[cohortForSet]?.[`comparisonASvsT2_literature_${set.id}`];
            if (perf) {
                results.push({
                    name: set.name,
                    cohort: getCohortDisplayName(cohortForSet),
                    n: allStats[cohortForSet]?.descriptive?.patientCount || '?',
                    pValue: comp?.delong?.pValue,
                    ...perf
                });
            }
        });

        if (results.length === 0) return '<p class="text-muted small p-3">No criteria comparison data.</p>';

        let tableHtml = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
            <th data-tippy-content="Method or criteria set being evaluated.">Set</th>
            <th data-tippy-content="${getDefinitionTooltip('sens')}">Sens.</th>
            <th data-tippy-content="${getDefinitionTooltip('spec')}">Spec.</th>
            <th data-tippy-content="${getDefinitionTooltip('ppv')}">PPV</th>
            <th data-tippy-content="${getDefinitionTooltip('npv')}">NPV</th>
            <th data-tippy-content="${getDefinitionTooltip('acc')}">Acc.</th>
            <th data-tippy-content="${getDefinitionTooltip('auc')}">AUC</th>
            <th data-tippy-content="${getDefinitionTooltip('pValue')}">p-Value (vs AS)</th>
        </tr></thead><tbody>`;

        results.forEach(r => {
            const cohortInfo = (r.cohort !== getCohortDisplayName(globalCoh)) ? ` (${r.cohort}, n=${r.n})` : ``;
            const pValueTooltip = r.pValue ? getInterpretationTooltip('pValue', {value: r.pValue, testName: 'DeLong'}, {comparisonName: 'AUC', method1: 'AS', method2: r.name}) : 'Comparison not applicable';

            tableHtml += `<tr>
                <td>${r.name}${cohortInfo}</td>
                <td>${formatPercent(r.sens?.value, 1, na_stat)}</td>
                <td>${formatPercent(r.spec?.value, 1, na_stat)}</td>
                <td>${formatPercent(r.ppv?.value, 1, na_stat)}</td>
                <td>${formatPercent(r.npv?.value, 1, na_stat)}</td>
                <td>${formatPercent(r.acc?.value, 1, na_stat)}</td>
                <td>${formatNumber(r.auc?.value, 3, na_stat, true)}</td>
                <td data-tippy-content="${pValueTooltip}">${r.pValue ? `${getPValueText(r.pValue, false)} ${getStatisticalSignificanceSymbol(r.pValue)}` : na_stat}</td>
            </tr>`;
        });

        tableHtml += `</tbody></table></div>`;
        return tableHtml;
    }

    // Angepasste render Funktion
    function render(processedData, appliedCriteria, appliedLogic, layout, cohort1, cohort2, globalCohort) {
        if (!processedData) throw new Error("Statistics data not available.");
        const na_stat = window.APP_CONFIG.NA_PLACEHOLDER;
        let datasets = [], cohortIds = [];
        let baseEvaluatedData = window.t2CriteriaManager.evaluateDataset(cloneDeep(processedData), appliedCriteria, appliedLogic);
        if (layout === 'einzel') {
            datasets.push(window.dataProcessor.filterDataByCohort(baseEvaluatedData, globalCohort));
            cohortIds.push(globalCohort);
        } else {
            datasets.push(window.dataProcessor.filterDataByCohort(baseEvaluatedData, cohort1));
            datasets.push(window.dataProcessor.filterDataByCohort(baseEvaluatedData, cohort2));
            cohortIds.push(cohort1, cohort2);
        }
        if (datasets.length === 0 || datasets.every(d => !Array.isArray(d) || d.length === 0)) {
            return '<div class="col-12"><div class="alert alert-warning">No data available for the selected statistics cohort(s).</div></div>';
        }
        const allCohortStats = {};
        const outerRow = document.createElement('div');
        outerRow.className = 'row g-4';

        // NEU: Abrufen des formatierten Strings für Applied T2 Criteria
        const appliedT2DisplayString = window.studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, true);

        datasets.forEach((data, i) => {
            const cohortId = cohortIds[i];
            const col = document.createElement('div');
            col.className = layout === 'vergleich' ? 'col-xl-6' : 'col-12';
            const innerRowId = `inner-stat-row-${i}`;
            col.innerHTML = `<h4 class="mb-3">Cohort: ${getCohortDisplayName(cohortId)} (N=${data.length})</h4><div class="row g-3" id="${innerRowId}"></div>`;
            outerRow.appendChild(col);
            const innerContainer = col.querySelector(`#${innerRowId}`);
            if (data.length > 0) {
                const stats = {
                    descriptive: window.statisticsService.calculateDescriptiveStats(data),
                    performanceAS: window.statisticsService.calculateDiagnosticPerformance(data, 'asStatus', 'nStatus'),
                    performanceT2: window.statisticsService.calculateDiagnosticPerformance(data, 't2Status', 'nStatus'),
                    comparisonASvsT2: window.statisticsService.compareDiagnosticMethods(data, 'asStatus', 't2Status', 'nStatus'),
                    associations: window.statisticsService.calculateAssociations(data, appliedCriteria)
                };
                allCohortStats[cohortId] = stats;
                innerContainer.innerHTML += window.uiComponents.createStatisticsCard(`descriptive-stats-${i}`, 'Descriptive Statistics', createDescriptiveStatsContentHTML({descriptive: stats.descriptive}, i, cohortId), true, null, [{id: `dl-desc-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `table-descriptive-demographics-${i}`, tableName: `Descriptive_Demographics_${cohortId.replace(/\s+/g, '_')}`}], `table-descriptive-demographics-${i}`);

                const fCI_p_stat = (m, k) => { const d = (k === 'auc') ? 3 : ((k === 'f1' || k==='youden') ? 3 : 1); const p = !(k === 'auc'||k==='f1'||k==='youden'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na_stat); };
                
                const createPerfTableHTML = (perfStats) => {
                    if (!perfStats || typeof perfStats.matrix !== 'object') return '<p class="text-muted small p-2">No diagnostic performance data.</p>';
                    return `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th data-tippy-content="The diagnostic metric being evaluated.">Metric</th>
                        <th data-tippy-content="The calculated value for the metric, with its 95% Confidence Interval in parentheses.">Value (95% CI)</th>
                        <th data-tippy-content="The statistical method used to calculate the confidence interval.">CI Method</th></tr></thead><tbody>
                        <tr><td data-tippy-content="${getDefinitionTooltip('sens')}">Sensitivity</td><td data-tippy-content="${getInterpretationTooltip('sens', perfStats.sens)}">${fCI_p_stat(perfStats.sens, 'sens')}</td><td>${perfStats.sens?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('spec')}">Specificity</td><td data-tippy-content="${getInterpretationTooltip('spec', perfStats.spec)}">${fCI_p_stat(perfStats.spec, 'spec')}</td><td>${perfStats.spec?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('ppv')}">PPV</td><td data-tippy-content="${getInterpretationTooltip('ppv', perfStats.ppv)}">${fCI_p_stat(perfStats.ppv, 'ppv')}</td><td>${perfStats.ppv?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('npv')}">NPV</td><td data-tippy-content="${getInterpretationTooltip('npv', perfStats.npv)}">${fCI_p_stat(perfStats.npv, 'npv')}</td><td>${perfStats.npv?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('acc')}">Accuracy</td><td data-tippy-content="${getInterpretationTooltip('acc', perfStats.acc)}">${fCI_p_stat(perfStats.acc, 'acc')}</td><td>${perfStats.acc?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('balAcc')}">Balanced Accuracy</td><td data-tippy-content="${getInterpretationTooltip('balAcc', perfStats.balAcc)}">${fCI_p_stat(perfStats.balAcc, 'balAcc')}</td><td>${perfStats.balAcc?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('f1')}">F1-Score</td><td data-tippy-content="${getInterpretationTooltip('f1', perfStats.f1)}">${fCI_p_stat(perfStats.f1, 'f1')}</td><td>${perfStats.f1?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('auc')}">AUC</td><td data-tippy-content="${getInterpretationTooltip('auc', perfStats.auc)}">${fCI_p_stat(perfStats.auc, 'auc')}</td><td>${perfStats.auc?.method || na_stat}</td></tr>
                    </tbody></table></div>`;
                };

                const createCompTableHTML = (compStats) => {
                    if (!compStats) return '<p class="text-muted small p-2">No comparison data.</p>';
                    const mcnemarTooltip = getInterpretationTooltip('pValue', compStats.mcnemar, { method1: 'AS', method2: `T2 (${appliedT2DisplayString})`, metricName: 'Accuracy', testName: compStats.mcnemar?.method}); // NEU: Dynamischer Tooltip
                    const delongTooltip = getInterpretationTooltip('pValue', compStats.delong, { method1: 'AS', method2: `T2 (${appliedT2DisplayString})`, metricName: 'AUC', testName: compStats.delong?.method}); // NEU: Dynamischer Tooltip
                    
                    return `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th data-tippy-content="Statistical test used to compare the two methods.">Test</th>
                        <th data-tippy-content="The calculated value of the test statistic.">Statistic</th>
                        <th data-tippy-content="${getDefinitionTooltip('pValue')}">p-Value</th>
                        <th data-tippy-content="Name of the statistical test and any corrections applied.">Method</th></tr></thead><tbody>
                        <tr><td data-tippy-content="${getDefinitionTooltip('mcnemar')}">McNemar (Acc)</td><td>${formatNumber(compStats.mcnemar?.statistic, 3, na_stat, true)} (df=${compStats.mcnemar?.df || na_stat})</td><td data-tippy-content="${mcnemarTooltip}">${getPValueText(compStats.mcnemar?.pValue, false)} ${getStatisticalSignificanceSymbol(compStats.mcnemar?.pValue)}</td><td>${compStats.mcnemar?.method || na_stat}</td></tr>
                        <tr><td data-tippy-content="${getDefinitionTooltip('delong')}">DeLong (AUC)</td><td>Z=${formatNumber(compStats.delong?.Z, 3, na_stat, true)}</td><td data-tippy-content="${delongTooltip}">${getPValueText(compStats.delong?.pValue, false)} ${getStatisticalSignificanceSymbol(compStats.delong?.pValue)}</td><td>${compStats.delong?.method || na_stat}</td></tr>
                    </tbody></table></div>`;
                };

                const createAssocTableHTML = (assocStats, appliedCrit) => {
                    if (!assocStats || Object.keys(assocStats).length === 0) return '<p class="text-muted small p-2">No association data.</p>';
                    const fORCI = (orObj) => { const val = formatNumber(orObj?.value, 2, na_stat, true); const ciL = formatNumber(orObj?.ci?.lower, 2, na_stat, true); const ciU = formatNumber(orObj?.ci?.upper, 2, na_stat, true); return (val !== na_stat && ciL !== na_stat && ciU !== na_stat) ? `${val} (${ciL}-${ciU})` : val; };
                    const fRDCI = (rdObj) => { const val = formatNumber(rdObj?.value * 100, 1, na_stat, true); const ciL = formatNumber(rdObj?.ci?.lower * 100, 1, na_stat, true); const ciU = formatNumber(rdObj?.ci?.upper * 100, 1, na_stat, true); return (val !== na_stat && ciL !== na_stat && ciU !== na_stat) ? `${val}% (${ciL}%-${ciU}%)` : (val !== na_stat ? `${val}%` : na_stat); };
                    const fPhi = (phiObj) => formatNumber(phiObj?.value, 2, na_stat, true);

                    let html = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0"><thead><tr>
                        <th data-tippy-content="The specific imaging feature being tested for association with N-Status.">Feature</th>
                        <th data-tippy-content="${getDefinitionTooltip('or')}">OR (95% CI)</th>
                        <th data-tippy-content="${getDefinitionTooltip('rd')}">RD (95% CI)</th>
                        <th data-tippy-content="${getDefinitionTooltip('phi')}">Phi</th>
                        <th data-tippy-content="${getDefinitionTooltip('pValue')}">p-Value</th>
                        <th data-tippy-content="The statistical test used to calculate the p-value.">Test</th></tr></thead><tbody>`;

                    const addRow = (key, name, obj) => {
                        const pValueTooltip = getInterpretationTooltip('pValue', { ...obj, value: obj.pValue, testName: obj.testName }, { featureName: escapeHTML(name) });
                        html += `<tr><td>${escapeHTML(name)}</td>
                            <td data-tippy-content="${getInterpretationTooltip('or', {...obj.or, featureName: escapeHTML(name)})}">${fORCI(obj.or)}</td>
                            <td data-tippy-content="${getInterpretationTooltip('rd', {...obj.rd, featureName: escapeHTML(name)})}">${fRDCI(obj.rd)}</td>
                            <td data-tippy-content="${getInterpretationTooltip('phi', {...obj.phi, featureName: escapeHTML(name)})}">${fPhi(obj.phi)}</td>
                            <td data-tippy-content="${pValueTooltip}">${getPValueText(obj.pValue, false)} ${getStatisticalSignificanceSymbol(obj.pValue)}</td>
                            <td>${obj.testName || na_stat}</td></tr>`;
                    };

                    if (assocStats.as) addRow('as', 'AS Positive', assocStats.as);
                    if (assocStats.size_mwu) {
                         const mwuTooltip = getInterpretationTooltip('pValue', { ...assocStats.size_mwu, value: assocStats.size_mwu.pValue, testName: assocStats.size_mwu.testName }, { comparisonName: 'median LN size between N+ and N- groups' });
                        html += `<tr><td>${assocStats.size_mwu.featureName}</td><td>${na_stat}</td><td>${na_stat}</td><td>${na_stat}</td><td data-tippy-content="${mwuTooltip}">${getPValueText(assocStats.size_mwu.pValue, false)} ${getStatisticalSignificanceSymbol(assocStats.size_mwu.pValue)}</td><td>${assocStats.size_mwu.testName || na_stat}</td></tr>`;
                    }

                    ['size', 'shape', 'border', 'homogeneity', 'signal'].forEach(fKey => {
                        if (assocStats[fKey]) {
                            const activeStatus = appliedCrit?.[fKey]?.active ? '' : ' (inactive)';
                            addRow(fKey, `${assocStats[fKey].featureName}${activeStatus}`, assocStats[fKey]);
                        }
                    });
                    html += `</tbody></table></div>`;
                    return html;
                };

                innerContainer.innerHTML += window.uiComponents.createStatisticsCard(`performance-as-${i}`, 'Diagnostic Performance: Avocado Sign (AS vs. N)', createPerfTableHTML(stats.performanceAS), false, null, [{id: `dl-as-perf-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `performance-as-${i}-content table`, tableName: `AS_Performance_${cohortId.replace(/\s+/g, '_')}`}], `performance-as-${i}-content table`);
                innerContainer.innerHTML += window.uiComponents.createStatisticsCard(
                    `performance-t2-${i}`, 
                    `Diagnostic Performance: T2 (${appliedT2DisplayString} vs. N)`, // NEU: Dynamischer Titel
                    createPerfTableHTML(stats.performanceT2), 
                    false, 
                    null, 
                    [{id: `dl-t2-perf-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `performance-t2-${i}-content table`, tableName: `T2_Applied_Performance_${cohortId.replace(/\s+/g, '_')}`}], 
                    `performance-t2-${i}-content table`,
                    cohortId, // cohortId
                    appliedT2DisplayString // appliedCriteriaDisplayString
                );
                innerContainer.innerHTML += window.uiComponents.createStatisticsCard(
                    `comparison-as-t2-${i}`, 
                    `Statistical Comparison: AS vs. T2 (${appliedT2DisplayString})`, // NEU: Dynamischer Titel
                    createCompTableHTML(stats.comparisonASvsT2), 
                    false, 
                    null, 
                    [{id: `dl-comp-as-t2-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `comparison-as-t2-${i}-content table`, tableName: `Comp_AS_T2_Applied_${cohortId.replace(/\s+/g, '_')}`}], 
                    `comparison-as-t2-${i}-content table`,
                    cohortId, // cohortId
                    appliedT2DisplayString // appliedCriteriaDisplayString
                );
                innerContainer.innerHTML += window.uiComponents.createStatisticsCard(`associations-${i}`, 'Association with N-Status', createAssocTableHTML(stats.associations, appliedCriteria), false, null, [{id: `dl-assoc-table-${i}-png`, icon: 'fa-image', format: 'png', tableId: `associations-${i}-content table`, tableName: `Associations_${cohortId.replace(/\s+/g, '_')}`}], `associations-${i}-content table`);

            } else {
                innerContainer.innerHTML = '<div class="col-12"><div class="alert alert-warning small p-2">No data for this cohort.</div></div>';
            }
        });

        if (layout === 'vergleich' && allCohortStats[cohort1] && allCohortStats[cohort2]) {
             const compCard = document.createElement('div');
             compCard.className = 'col-12';
             const c1Stats = allCohortStats[cohort1];
             const c2Stats = allCohortStats[cohort2];
             
             let compContent = '<p class="text-muted small p-2">Not enough data for cohort comparison.</p>';
             const aucCompAS = window.statisticsService.calculateZTestForAUCComparison(c1Stats.performanceAS.auc.value, c1Stats.performanceAS.auc.se, c1Stats.descriptive.patientCount, c2Stats.performanceAS.auc.value, c2Stats.performanceAS.auc.se, c2Stats.descriptive.patientCount);
             const aucCompT2 = window.statisticsService.calculateZTestForAUCComparison(c1Stats.performanceT2.auc.value, c1Stats.performanceT2.auc.se, c1Stats.descriptive.patientCount, c2Stats.performanceT2.auc.value, c2Stats.performanceT2.auc.se, c2Stats.descriptive.patientCount);

             if(aucCompAS && aucCompT2) {
                 compContent = `<div class="table-responsive"><table class="table table-sm table-striped small mb-0">
                    <thead><tr>
                        <th>Method</th>
                        <th>Metric</th>
                        <th>${getCohortDisplayName(cohort1)}</th>
                        <th>${getCohortDisplayName(cohort2)}</th>
                        <th>p-Value (unpaired)</th>
                    </tr></thead>
                    <tbody>
                        <tr><td>Avocado Sign</td><td>AUC</td><td>${formatNumber(c1Stats.performanceAS.auc.value, 3, na_stat, true)}</td><td>${formatNumber(c2Stats.performanceAS.auc.value, 3, na_stat, true)}</td><td>${getPValueText(aucCompAS.pValue, false)}</td></tr>
                        <tr><td>T2 (${appliedT2DisplayString})</td><td>AUC</td><td>${formatNumber(c1Stats.performanceT2.auc.value, 3, na_stat, true)}</td><td>${formatNumber(c2Stats.performanceT2.auc.value, 3, na_stat, true)}</td><td>${getPValueText(aucCompT2.pValue, false)}</td></tr>
                    </tbody>
                 </table></div>`;
             }
             compCard.innerHTML = window.uiComponents.createStatisticsCard('cohort-comparison', `Cohort Comparison: ${getCohortDisplayName(cohort1)} vs. ${getCohortDisplayName(cohort2)}`, compContent, false, null, [{id: 'dl-cohort-comp-table-png', icon: 'fa-image', format: 'png', tableId: 'cohort-comparison-content table', tableName: `Cohort_Comparison_${cohort1}_vs_${cohort2}`}], 'cohort-comparison-content table');
             outerRow.appendChild(compCard);
        }

        if (layout === 'einzel') {
            const criteriaComparisonCard = document.createElement('div');
            criteriaComparisonCard.className = 'col-12';
            criteriaComparisonCard.innerHTML = window.uiComponents.createStatisticsCard(
                'criteria-comparison',
                `Criteria Comparison: AS, ${appliedT2DisplayString}, & Literature Sets (for Cohort: ${getCohortDisplayName(globalCohort)})`, // NEU: Dynamischer Titel
                createCriteriaComparisonTableHTML(window.statisticsService.calculateAllPublicationStats(processedData, appliedCriteria, appliedLogic, window.bruteForceManager.getAllResults()), globalCohort, appliedT2DisplayString), // NEU: appliedT2DisplayString übergeben
                false,
                'criteriaComparisonTable',
                [{id: 'dl-criteria-comp-table-png', icon: 'fa-image', format: 'png', tableId: 'criteria-comparison-content table', tableName: `Criteria_Comparison_${globalCohort.replace(/\s+/g, '_')}`}],
                'criteria-comparison-content table'
            );
            outerRow.appendChild(criteriaComparisonCard);
        }

        setTimeout(() => {
            datasets.forEach((data, i) => {
                if (data.length > 0) {
                    const stats = window.statisticsService.calculateDescriptiveStats(data);
                    if (document.getElementById(`chart-stat-age-${i}`)) {
                        window.chartRenderer.renderAgeDistributionChart(stats.ageData, `chart-stat-age-${i}`, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 40 } });
                    }
                    if (document.getElementById(`chart-stat-gender-${i}`)) {
                        const genderData = [{label: 'Male', value: stats.sex.m ?? 0}, {label: 'Female', value: stats.sex.f ?? 0}];
                        if (stats.sex.unknown > 0) genderData.push({label: 'Unknown', value: stats.sex.unknown });
                        window.chartRenderer.renderPieChart(genderData, `chart-stat-gender-${i}`, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true });
                    }
                }
            });
            window.uiManager.initializeTooltips(outerRow);
        }, 50);
        return outerRow.outerHTML;
    }

    return { render };
})();
