const resultsGenerator = (() => {

    function generatePatientCharacteristicsHTML(stats, commonData) {
        const overallStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        if (!overallStats || !overallStats.descriptive) return '<p class="text-warning">Patient characteristics data not available.</p>';
        
        const { descriptive } = overallStats;
        const { nOverall, nSurgeryAlone, nNeoadjuvantTherapy, nPositive } = commonData;
        const helpers = publicationHelpers;

        const text = `
            <h4 id="ergebnisse_patientencharakteristika">Patient Characteristics</h4>
            <p>The study cohort comprised ${helpers.formatValueForPublication(nOverall, 0)} patients (mean age, ${helpers.formatValueForPublication(descriptive.age.mean, 1)} years ± ${helpers.formatValueForPublication(descriptive.age.sd, 1)} [standard deviation]; ${descriptive.sex.m} men). Enrollment and exclusion criteria are detailed in the study flowchart (Figure 1). Of the included patients, ${helpers.formatValueForPublication(nSurgeryAlone, 0)} (${helpers.formatValueForPublication(nSurgeryAlone / nOverall, 0, true)}%) underwent primary surgery, and ${helpers.formatValueForPublication(nNeoadjuvantTherapy, 0)} (${helpers.formatValueForPublication(nNeoadjuvantTherapy / nOverall, 0, true)}%) received neoadjuvant chemoradiotherapy. Overall, ${helpers.formatValueForPublication(nPositive, 0)} of ${nOverall} patients (${helpers.formatValueForPublication(nPositive / nOverall, 0, true)}%) had histopathologically confirmed lymph node metastases (N-positive). Detailed patient characteristics for the overall cohort are provided in Table 1.</p>
        `;

        const tableConfig = {
            id: 'table-results-patient-char',
            caption: 'Table 1: Patient Demographics and Clinical Characteristics',
            headers: ['Characteristic', `Overall Cohort (n=${nOverall})`],
            rows: [
                ['Age (y), mean ± SD', `${helpers.formatValueForPublication(descriptive.age.mean, 1)} ± ${helpers.formatValueForPublication(descriptive.age.sd, 1)}`],
                ['Age (y), median (IQR)', `${helpers.formatValueForPublication(descriptive.age.median, 0)} (${helpers.formatValueForPublication(descriptive.age.q1, 0)}–${helpers.formatValueForPublication(descriptive.age.q3, 0)})`],
                ['Sex, men', `${descriptive.sex.m} (${helpers.formatValueForPublication(descriptive.sex.m / nOverall, 0, true)}%)`],
                ['Treatment approach', ''],
                ['   Surgery alone', `${nSurgeryAlone} (${helpers.formatValueForPublication(nSurgeryAlone / nOverall, 0, true)}%)`],
                ['   Neoadjuvant therapy', `${nNeoadjuvantTherapy} (${helpers.formatValueForPublication(nNeoadjuvantTherapy / nOverall, 0, true)}%)`],
                ['Histopathologic N-status, positive', `${nPositive} (${helpers.formatValueForPublication(nPositive / nOverall, 0, true)}%)`]
            ],
            notes: "Data are numbers of patients, with percentages in parentheses, or mean ± standard deviation or median and interquartile range (IQR)."
        };
        
        const figurePlaceholder = `
            <div class="my-4 p-3 border rounded text-center bg-light">
                <p class="mb-0 fw-bold">[Figure 1 about here]</p>
                <p class="mb-0 text-muted small">A flowchart illustrating patient enrollment, exclusion criteria, and final cohort composition should be placed here.</p>
            </div>
        `;

        return text + figurePlaceholder + helpers.createPublicationTableHTML(tableConfig);
    }

    function generateASPerformanceHTML(stats, commonData) {
        const overallStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        if (!overallStats || !overallStats.performanceAS) return '<p class="text-warning">Avocado Sign performance data not available.</p>';
        
        const { performanceAS, interobserverKappa } = overallStats;
        const helpers = publicationHelpers;

        const text = `
            <h4 id="ergebnisse_as_diagnostische_guete">Diagnostic Performance of the Avocado Sign</h4>
            <p>For the entire cohort (n=${commonData.nOverall}), the Avocado Sign demonstrated a sensitivity of ${helpers.formatMetricForPublication(performanceAS.sens, 'sens')}, a specificity of ${helpers.formatMetricForPublication(performanceAS.spec, 'spec')}, and an accuracy of ${helpers.formatMetricForPublication(performanceAS.acc, 'acc')}. The area under the curve (AUC) was ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}, indicating excellent diagnostic performance. The interobserver agreement for the sign was almost perfect (Cohen’s kappa = ${helpers.formatValueForPublication(interobserverKappa, 2)}). The performance was robust across both the primary surgery and post-nCRT subgroups, as detailed in Table 3.</p>
        `;
        
        const tableConfig = {
            id: 'table-results-as-performance',
            caption: 'Table 3: Diagnostic Performance of the Avocado Sign by Patient Cohort',
            headers: ['Metric', `Overall (n=${stats.Overall.descriptive.patientCount})`, `Surgery alone (n=${stats.surgeryAlone.descriptive.patientCount})`, `Neoadjuvant therapy (n=${stats.neoadjuvantTherapy.descriptive.patientCount})`],
            rows: [],
            notes: 'Data are presented as Value (95% Confidence Interval).'
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
        const overallStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        const { bruteForceMetricForPublication } = commonData;
        const helpers = publicationHelpers;
        const bfResultsAvailable = !!(overallStats?.performanceT2Bruteforce && overallStats?.comparisonASvsT2Bruteforce);

        let text;
        if (bfResultsAvailable) {
            text = `
                <h4 id="ergebnisse_vergleich_as_vs_t2">Comparison of Avocado Sign vs. T2w Criteria</h4>
                <p>The cohort-optimized T2w criteria, identified through brute-force analysis to maximize ${bruteForceMetricForPublication}, yielded an AUC of ${helpers.formatMetricForPublication(overallStats.performanceT2Bruteforce.auc, 'auc')}. When directly compared, no significant difference was found between the AUC of the Avocado Sign and the optimized T2w criteria (${helpers.formatPValueForPublication(overallStats.comparisonASvsT2Bruteforce.delong.pValue)}). Detailed performance metrics for all evaluated criteria sets are presented in Table 4, and the statistical comparisons are summarized in Table 5.</p>
            `;
        } else {
             text = `
                <h4 id="ergebnisse_vergleich_as_vs_t2">Comparison of Avocado Sign vs. T2w Criteria</h4>
                <p>The cohort-optimized T2w criteria are being determined via brute-force analysis. Detailed performance metrics for all evaluated criteria sets are presented in Table 4, and the statistical comparisons will be summarized in Table 5 upon completion of the analysis.</p>
                <p class="small text-muted"><em>Note: Brute-force optimization results are pending.</em></p>
            `;
        }

        const table4Config = {
            id: 'table-results-all-criteria-performance',
            caption: 'Table 4: Diagnostic Performance of All Evaluated Criteria Sets',
            headers: ['Criteria Set', 'Applicable Cohort', 'AUC (95% CI)', 'Sensitivity', 'Specificity', 'Accuracy'],
            rows: [],
            notes: 'Performance metrics for literature-based criteria are calculated on their respective applicable cohorts. AS = Avocado Sign, T2w = T2-weighted.'
        };

        const addPerfRow = (set, statsObj, cohortName, perfKey) => {
            const perf = getObjectValueByPath(statsObj, perfKey);
            if (!perf) return [set, cohortName, 'N/A', 'N/A', 'N/A', 'N/A'];
            return [
                set, cohortName,
                helpers.formatMetricForPublication(perf.auc, 'auc'),
                helpers.formatMetricForPublication(perf.sens, 'sens'),
                helpers.formatMetricForPublication(perf.spec, 'spec'),
                helpers.formatMetricForPublication(perf.acc, 'acc')
            ];
        };

        table4Config.rows.push(addPerfRow('Avocado Sign', stats.Overall, 'Overall', 'performanceAS'));
        table4Config.rows.push(addPerfRow('Cohort-Optimized T2w', stats.Overall, 'Overall', 'performanceT2Bruteforce'));
        table4Config.rows.push(addPerfRow('ESGAR 2016 (Rutegård)', stats.surgeryAlone, 'Surgery alone', 'performanceT2Literature.rutegard_et_al_esgar'));
        table4Config.rows.push(addPerfRow('Koh et al. (2008)', stats.Overall, 'Overall', 'performanceT2Literature.koh_2008'));
        table4Config.rows.push(addPerfRow('Barbaro et al. (2024)', stats.neoadjuvantTherapy, 'Neoadjuvant therapy', 'performanceT2Literature.barbaro_2024'));

        const table5Config = {
            id: 'table-results-statistical-comparison',
            caption: 'Table 5: Statistical Comparison of Area Under the Curve (AUC) vs. Avocado Sign using DeLong’s Test',
            headers: ['Comparison: T2w Set vs. Avocado Sign', 'Comparison Cohort', 'AUC Difference (AS - T2)', 'Z-statistic', '<em>P</em> value'],
            rows: [],
            notes: 'A positive AUC difference indicates higher performance for the Avocado Sign. Some comparisons may be pending brute-force analysis.'
        };
        
        const addCompRow = (setName, statsObj, cohortName, compKey) => {
            const comp = getObjectValueByPath(statsObj, compKey)?.delong;
            if (!comp) return [setName, cohortName, 'N/A', 'N/A', 'N/A'];
            return [
                setName,
                cohortName,
                helpers.formatValueForPublication(comp.diffAUC, 2),
                helpers.formatValueForPublication(comp.Z, 3),
                helpers.formatPValueForPublication(comp.pValue)
            ];
        };
        
        table5Config.rows.push(addCompRow('Cohort-Optimized T2w', stats.Overall, 'Overall', 'comparisonASvsT2Bruteforce'));
        table5Config.rows.push(addCompRow('ESGAR 2016 (Rutegård)', stats.surgeryAlone, 'Surgery alone', 'comparisonASvsT2_literature_rutegard_et_al_esgar'));
        table5Config.rows.push(addCompRow('Koh et al. (2008)', stats.Overall, 'Overall', 'comparisonASvsT2_literature_koh_2008'));
        table5Config.rows.push(addCompRow('Barbaro et al. (2024)', stats.neoadjuvantTherapy, 'Neoadjuvant therapy', 'comparisonASvsT2_literature_barbaro_2024'));

        return text + helpers.createPublicationTableHTML(table4Config) + helpers.createPublicationTableHTML(table5Config);
    }

    return Object.freeze({
        generatePatientCharacteristicsHTML,
        generateASPerformanceHTML,
        generateComparisonHTML
    });

})();
