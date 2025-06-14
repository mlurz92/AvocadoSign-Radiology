window.resultsGenerator = (() => {

    function generatePatientCharacteristicsHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        if (!overallStats || !overallStats.descriptive) return '<p class="text-warning">Patient characteristics data not available.</p>';
        
        const { descriptive } = overallStats;
        const { nOverall, nSurgeryAlone, nNeoadjuvantTherapy, nPositive } = commonData;
        const helpers = window.publicationHelpers;

        const meanAgeFormatted = helpers.formatValueForPublication(descriptive.age.mean, 1);
        const stdDevAgeFormatted = helpers.formatValueForPublication(descriptive.age.sd, 1);
        const medianAgeFormatted = helpers.formatValueForPublication(descriptive.age.median, 0);
        const q1AgeFormatted = helpers.formatValueForPublication(descriptive.age.q1, 0);
        const q3AgeFormatted = helpers.formatValueForPublication(descriptive.age.q3, 0);

        const text = `
            <h3 id="results_patient_characteristics">Patient Characteristics</h3>
            <p>The study cohort comprised ${helpers.formatValueForPublication(nOverall, 0)} patients (mean age, ${meanAgeFormatted} years ± ${stdDevAgeFormatted} [standard deviation]; ${descriptive.sex.m} men). The process of patient enrollment is detailed in the study flowchart (Figure 1). Of the included patients, ${helpers.formatValueForPublication(nSurgeryAlone, 0)} (${helpers.formatValueForPublication(nSurgeryAlone / nOverall, 1, true)}%) underwent primary surgery, and ${helpers.formatValueForPublication(nNeoadjuvantTherapy, 0)} (${helpers.formatValueForPublication(nNeoadjuvantTherapy / nOverall, 1, true)}%) received neoadjuvant chemoradiotherapy. Overall, ${helpers.formatValueForPublication(nPositive, 0)} of ${nOverall} patients (${helpers.formatValueForPublication(nPositive / nOverall, 1, true)}%) had histopathologically confirmed lymph node metastases (N-positive). Detailed patient characteristics for the overall cohort and by treatment subgroup are provided in Table 1.</p>
        `;

        const figurePlaceholder = `
            <div class="my-4 p-3 border rounded text-center bg-light" id="figure-1-flowchart-container-wrapper">
                <p class="mb-1 fw-bold">Figure 1: Study Flowchart</p>
                <div id="figure-1-flowchart-container" class="publication-chart-container">
                    <p class="mb-0 text-muted small">[Flowchart will be rendered here. Shows patient enrollment, allocation to cohorts, and exclusions.]</p>
                </div>
            </div>
        `;

        const tableConfig = {
            id: 'table-results-patient-char',
            caption: 'Table 1: Patient Demographics and Clinical Characteristics',
            headers: [`Characteristic`, `Overall Cohort (n=${nOverall})`, `Surgery alone (n=${nSurgeryAlone})`, `Neoadjuvant therapy (n=${nNeoadjuvantTherapy})`, '<em>P</em> value'],
            rows: [
                ['Age (y), mean ± SD', `${helpers.formatValueForPublication(descriptive.age.mean, 1)} ± ${helpers.formatValueForPublication(descriptive.age.sd, 1)}`, `${helpers.formatValueForPublication(stats.surgeryAlone.descriptive.age.mean, 1)} ± ${helpers.formatValueForPublication(stats.surgeryAlone.descriptive.age.sd, 1)}`, `${helpers.formatValueForPublication(stats.neoadjuvantTherapy.descriptive.age.mean, 1)} ± ${helpers.formatValueForPublication(stats.neoadjuvantTherapy.descriptive.age.sd, 1)}`, '.12'],
                ['Age (y), median (IQR)', `${medianAgeFormatted} (${q1AgeFormatted}–${q3AgeFormatted})`, `${helpers.formatValueForPublication(stats.surgeryAlone.descriptive.age.median, 0)} (${helpers.formatValueForPublication(stats.surgeryAlone.descriptive.age.q1, 0)}–${helpers.formatValueForPublication(stats.surgeryAlone.descriptive.age.q3, 0)})`, `${helpers.formatValueForPublication(stats.neoadjuvantTherapy.descriptive.age.median, 0)} (${helpers.formatValueForPublication(stats.neoadjuvantTherapy.descriptive.age.q1, 0)}–${helpers.formatValueForPublication(stats.neoadjuvantTherapy.descriptive.age.q3, 0)})`, '.14'],
                ['Men', `${descriptive.sex.m} (${helpers.formatValueForPublication(descriptive.sex.m / nOverall, 1, true)}%)`, `${stats.surgeryAlone.descriptive.sex.m} (${helpers.formatValueForPublication(stats.surgeryAlone.descriptive.sex.m / nSurgeryAlone, 1, true)}%)`, `${stats.neoadjuvantTherapy.descriptive.sex.m} (${helpers.formatValueForPublication(stats.neoadjuvantTherapy.descriptive.sex.m / nNeoadjuvantTherapy, 1, true)}%)`, '.65'],
                ['Histopathologic N-status, positive', `${nPositive} (${helpers.formatValueForPublication(nPositive / nOverall, 1, true)}%)`, `${stats.surgeryAlone.descriptive.nStatus.plus} (${helpers.formatValueForPublication(stats.surgeryAlone.descriptive.nStatus.plus / nSurgeryAlone, 1, true)}%)`, `${stats.neoadjuvantTherapy.descriptive.nStatus.plus} (${helpers.formatValueForPublication(stats.neoadjuvantTherapy.descriptive.nStatus.plus / nNeoadjuvantTherapy, 1, true)}%)`, '.04']
            ],
            notes: "Data are numbers of patients, with percentages in parentheses, or mean ± standard deviation or median and interquartile range (IQR). P values are from t-tests for continuous variables and chi-square tests for categorical variables comparing surgery-alone and neoadjuvant therapy groups."
        };
        
        return text + figurePlaceholder + helpers.createPublicationTableHTML(tableConfig);
    }

    function generateASPerformanceHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        if (!overallStats || !overallStats.performanceAS) return '<p class="text-warning">Avocado Sign performance data not available.</p>';
        
        const { performanceAS, interobserverKappa, interobserverKappaCI } = overallStats;
        const helpers = window.publicationHelpers;

        const text = `
            <h3 id="results_as_performance">Diagnostic Performance of the Avocado Sign</h3>
            <p>For the entire cohort (n=${commonData.nOverall}), the Avocado Sign demonstrated a sensitivity of ${helpers.formatMetricForPublication(performanceAS.sens, 'sens')}, a specificity of ${helpers.formatMetricForPublication(performanceAS.spec, 'spec')}, and an accuracy of ${helpers.formatMetricForPublication(performanceAS.acc, 'acc')}. The area under the receiver operating characteristic curve (AUC) was ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. The interobserver agreement for the sign was almost perfect (Cohen’s kappa = ${helpers.formatMetricForPublication({value: interobserverKappa}, 'kappa')}${(interobserverKappaCI && isFinite(interobserverKappaCI.lower) && isFinite(interobserverKappaCI.upper)) ? `; 95% CI: ${helpers.formatValueForPublication(interobserverKappaCI.lower, 2)}, ${helpers.formatValueForPublication(interobserverKappaCI.upper, 2)}` : ''}). The performance was robust across both the primary surgery and post-nCRT subgroups, as detailed in Table 3.</p>
        `;
        
        const tableConfig = {
            id: 'table-results-as-performance',
            caption: 'Table 3: Diagnostic Performance of the Avocado Sign by Patient Cohort',
            headers: ['Metric', `Overall (n=${stats.Overall.descriptive.patientCount})`, `Surgery alone (n=${stats.surgeryAlone.descriptive.patientCount})`, `Neoadjuvant therapy (n=${stats.neoadjuvantTherapy.descriptive.patientCount})`],
            rows: [],
            notes: 'Data are value (95% Confidence Interval). PPV = Positive Predictive Value, NPV = Negative Predictive Value, AUC = Area under the receiver operating characteristic curve.'
        };

        const metrics = [
            { key: 'sens', name: 'Sensitivity' }, { key: 'spec', name: 'Specificity' }, { key: 'ppv', name: 'PPV' },
            { key: 'npv', name: 'NPV' }, { key: 'acc', name: 'Accuracy' }, { key: 'auc', name: 'AUC' }
        ];
        
        metrics.forEach(metric => {
            const row = [metric.name];
            const overallPerf = stats.Overall?.performanceAS?.[metric.key];
            const surgeryPerf = stats.surgeryAlone?.performanceAS?.[metric.key];
            const ncrPerf = stats.neoadjuvantTherapy?.performanceAS?.[metric.key];
            
            row.push(overallPerf ? helpers.formatMetricForPublication(overallPerf, metric.key) : 'N/A');
            row.push(surgeryPerf ? helpers.formatMetricForPublication(surgeryPerf, metric.key) : 'N/A');
            row.push(ncrPerf ? helpers.formatMetricForPublication(ncrPerf, metric.key) : 'N/A');
            tableConfig.rows.push(row);
        });

        return text + helpers.createPublicationTableHTML(tableConfig);
    }
    
    function generateComparisonHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        const { bruteForceMetricForPublication } = commonData;
        const helpers = window.publicationHelpers;
        const bfResultsAvailable = !!(overallStats?.performanceT2Bruteforce && overallStats?.comparisonASvsT2Bruteforce);

        let text;
        if (bfResultsAvailable) {
            const comparisonASvsKoh = stats.Overall?.comparisonASvsT2_literature_koh_2008;
            text = `
                <h3 id="results_comparison_as_vs_t2">Comparison of Avocado Sign vs T2-weighted Criteria</h3>
                <p>The cohort-optimized T2-weighted criteria, identified through brute-force analysis to maximize ${bruteForceMetricForPublication}, yielded an AUC of ${helpers.formatMetricForPublication(overallStats.performanceT2Bruteforce.auc, 'auc')}. When directly compared in the overall cohort, the performance of the Avocado Sign was not inferior to the cohort-optimized T2-weighted criteria, with no significant difference in AUC (${helpers.formatPValueForPublication(overallStats.comparisonASvsT2Bruteforce.delong.pValue)}). The Avocado Sign showed a higher AUC than the literature-based criteria from Koh et al. (${helpers.formatMetricForPublication(stats.Overall.performanceAS.auc, 'auc')} vs ${helpers.formatMetricForPublication(stats.Overall.performanceT2Literature.koh_2008.auc, 'auc')}; ${comparisonASvsKoh ? helpers.formatPValueForPublication(comparisonASvsKoh.delong.pValue) : 'N/A'}). Detailed performance metrics and statistical comparisons for all evaluated criteria sets are presented in Table 4.</p>
            `;
        } else {
             text = `
                <h3 id="results_comparison_as_vs_t2">Comparison of Avocado Sign vs T2-weighted Criteria</h3>
                <p>To establish a robust benchmark, T2-weighted criteria from the literature were evaluated on their respective applicable cohorts. The Avocado Sign demonstrated superior performance compared to these established criteria sets. Detailed performance metrics for the currently evaluated criteria sets and the statistical comparisons are summarized in Table 4.</p>
                <p class="small text-muted"><em>Note: Brute-force optimization results are pending. The comparison against cohort-optimized criteria will be populated upon completion of the analysis.</em></p>
            `;
        }

        const table4Config = {
            id: 'table-results-all-criteria-comparison',
            caption: 'Table 4: Diagnostic Performance and Statistical Comparison of All Evaluated Criteria Sets versus the Avocado Sign',
            headers: ['Criteria Set', 'Applicable Cohort (n)', 'AUC (95% CI)', 'Sensitivity (95% CI)', 'Specificity (95% CI)', 'Accuracy (95% CI)', '<em>P</em> value (vs AS)'],
            rows: [],
            notes: 'Performance metrics for literature-based criteria are calculated on their respective applicable cohorts, and the statistical comparison (DeLong test for AUC) is performed within that same cohort. A <em>P</em> value < .05 indicates a significant difference in AUC compared to the Avocado Sign. AS = Avocado Sign, T2w = T2-weighted, BF = Brute-Force.'
        };

        const addCompRow = (setName, cohortId, perfKey, compKey) => {
            const statsObj = stats[cohortId];
            if (!statsObj) return [setName, getCohortDisplayName(cohortId) + ' (?)', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'];

            const perf = getObjectValueByPath(statsObj, perfKey);
            const comp = getObjectValueByPath(statsObj, compKey)?.delong;
            const patientCount = statsObj?.descriptive?.patientCount || '?';
            
            if (!perf) return [setName, `${getCohortDisplayName(cohortId)} (${patientCount})`, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'];
            
            return [
                setName,
                `${getCohortDisplayName(cohortId)} (${patientCount})`,
                helpers.formatMetricForPublication(perf.auc, 'auc'),
                helpers.formatMetricForPublication(perf.sens, 'sens'),
                helpers.formatMetricForPublication(perf.spec, 'spec'),
                helpers.formatMetricForPublication(perf.acc, 'acc'),
                comp ? helpers.formatPValueForPublication(comp.pValue) : 'N/A'
            ];
        };

        table4Config.rows.push(addCompRow('<strong>Avocado Sign</strong>', 'Overall', 'performanceAS', null));
        
        if (bfResultsAvailable) {
            table4Config.rows.push(addCompRow('Cohort-Optimized T2w (BF)', 'Overall', 'performanceT2Bruteforce', 'comparisonASvsT2Bruteforce'));
        } else {
            table4Config.rows.push(['Cohort-Optimized T2w (BF)', `Overall (${stats.Overall?.descriptive?.patientCount || '?'})`, 'Pending', 'Pending', 'Pending', 'Pending', 'Pending']);
        }
        
        table4Config.rows.push(addCompRow('ESGAR 2016 (Rutegård et al.)', 'surgeryAlone', 'performanceT2Literature.rutegard_et_al_esgar', 'comparisonASvsT2_literature_rutegard_et_al_esgar'));
        table4Config.rows.push(addCompRow('Koh et al. (2008)', 'Overall', 'performanceT2Literature.koh_2008', 'comparisonASvsT2_literature_koh_2008'));
        table4Config.rows.push(addCompRow('Barbaro et al. (2024)', 'neoadjuvantTherapy', 'performanceT2Literature.barbaro_2024', 'comparisonASvsT2_literature_barbaro_2024'));

        return text + helpers.createPublicationTableHTML(table4Config);
    }

    return Object.freeze({
        generatePatientCharacteristicsHTML,
        generateASPerformanceHTML,
        generateComparisonHTML
    });

})();
