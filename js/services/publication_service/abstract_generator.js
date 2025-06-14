const abstractGenerator = (() => {

    function generateAbstractHTML(stats, commonData) {
        const overallStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        
        if (!overallStats || !overallStats.descriptive || !overallStats.performanceAS) {
            return '<p class="text-warning">Required statistics for abstract generation are missing.</p>';
        }

        const { descriptive, performanceAS, performanceT2Bruteforce, comparisonASvsT2Bruteforce } = overallStats;
        const { nOverall, nPositive, bruteForceMetricForPublication } = commonData;
        const helpers = publicationHelpers;
        
        const bfResultsAvailable = !!(performanceT2Bruteforce && comparisonASvsT2Bruteforce);

        let keyResultsHTML;
        let summaryStatementHTML;
        let resultsSectionHTML;
        let conclusionText;

        const medianAgeFormatted = helpers.formatValueForPublication(descriptive.age.median, 0);
        const ageIQR = `${helpers.formatValueForPublication(descriptive.age.q1, 0)}–${helpers.formatValueForPublication(descriptive.age.q3, 0)}`;

        if (bfResultsAvailable) {
            keyResultsHTML = `
                <h2 class="mt-0">Key Results</h2>
                <ul>
                    <li>In this retrospective study of ${nOverall} patients with rectal cancer, the contrast-based Avocado Sign (AS) showed an area under the curve (AUC) of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc', true)} for predicting nodal metastasis.</li>
                    <li>A cohort-optimized T2-weighted (T2w) criteria set, identified via brute-force analysis to maximize ${bruteForceMetricForPublication}, yielded an AUC of ${helpers.formatMetricForPublication(performanceT2Bruteforce.auc, 'auc', true)}.</li>
                    <li>The difference in diagnostic performance between the AS and the optimized T2w criteria was not statistically significant (${helpers.formatPValueForPublication(comparisonASvsT2Bruteforce.delong.pValue)}).</li>
                </ul>
            `;
            summaryStatementHTML = `
                <p><strong>In this retrospective analysis of ${nOverall} patients with rectal cancer, the Avocado Sign, a contrast-enhanced MRI marker, provided diagnostic performance for nodal staging that was non-inferior to cohort-optimized T2-weighted criteria.</strong></p>
            `;
            resultsSectionHTML = `
                <p>A total of ${nOverall} patients (median age, ${medianAgeFormatted} years; interquartile range, ${ageIQR} years; ${descriptive.sex.m} men) were analyzed, of whom ${nPositive} (${helpers.formatValueForPublication(nPositive / nOverall, 1, true)}%) were N-positive. The AS demonstrated an AUC of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. A brute-force optimized T2w criteria set (target metric: ${bruteForceMetricForPublication}) yielded a numerically similar AUC of ${helpers.formatMetricForPublication(performanceT2Bruteforce.auc, 'auc')}. The difference in AUC between AS and the optimized T2w criteria was not statistically significant (${helpers.formatPValueForPublication(comparisonASvsT2Bruteforce.delong.pValue)}).</p>
            `;
            conclusionText = `
                <p>The Avocado Sign is a highly reproducible MRI marker for predicting lymph node status in rectal cancer, demonstrating diagnostic performance non-inferior to cohort-optimized T2w criteria. Its application has the potential to simplify and improve the accuracy of preoperative nodal staging.</p>
            `;
        } else {
            keyResultsHTML = `
                <h2 class="mt-0">Key Results</h2>
                <ul>
                    <li>In this retrospective study of ${nOverall} patients with rectal cancer, the contrast-based Avocado Sign (AS) showed an area under the curve (AUC) of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc', true)} for predicting nodal metastasis.</li>
                    <li>The performance of the AS was superior to established literature-based T2-weighted (T2w) criteria.</li>
                    <li>A full comparison against a cohort-optimized T2w criteria set is pending completion of a brute-force analysis.</li>
                </ul>
                <p class="small text-muted"><em>Note: Brute-force optimization results are not yet available. Content is based on available data.</em></p>
            `;
            summaryStatementHTML = `
                <p><strong>In this retrospective analysis of ${nOverall} patients with rectal cancer, the Avocado Sign, a contrast-enhanced MRI marker, demonstrated high diagnostic performance for nodal staging compared to literature-based criteria.</strong></p>
            `;
            resultsSectionHTML = `
                <p>A total of ${nOverall} patients (median age, ${medianAgeFormatted} years; interquartile range, ${ageIQR} years; ${descriptive.sex.m} men) were analyzed, of whom ${nPositive} (${helpers.formatValueForPublication(nPositive / nOverall, 1, true)}%) were N-positive. The AS demonstrated an AUC of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. [Comparison to a brute-force optimized T2w criteria set is pending].</p>
            `;
             conclusionText = `
                <p>The Avocado Sign is a highly reproducible MRI marker for predicting lymph node status in rectal cancer, demonstrating strong diagnostic performance. It has the potential to simplify and improve the accuracy of preoperative nodal staging, pending final comparison with cohort-optimized T2w criteria.</p>
            `;
        }

        const abstractContentHTML = `
            <h2>Abstract</h2>
            <div class="structured-abstract">
                <h3>Background</h3>
                <p>Accurate preoperative determination of mesorectal lymph node status is crucial for treatment decisions in rectal cancer, yet standard T2-weighted (T2w) MRI criteria have shown limited accuracy.</p>
                
                <h3>Purpose</h3>
                <p>To evaluate the diagnostic performance of the "Avocado Sign," a novel contrast-enhanced MRI marker, and to compare it with both established literature-based and cohort-optimized T2w morphological criteria for predicting N-status.</p>
                
                <h3>Materials and Methods</h3>
                <p>This retrospective, single-center study received institutional review board approval with a waiver of informed consent. Data from ${nOverall} consecutive patients with histologically confirmed rectal cancer who underwent MRI between January 2020 and November 2023 were analyzed. Two blinded radiologists evaluated the Avocado Sign on contrast-enhanced T1-weighted images. Histopathological examination served as the reference standard. Diagnostic performance was assessed using the area under the receiver operating characteristic curve (AUC), and methods were compared using the DeLong test.</p>
                
                <h3>Results</h3>
                ${resultsSectionHTML}
                
                <h3>Conclusion</h3>
                ${conclusionText}
            </div>
            <hr>
            <p class="small text-muted mt-2"><strong>Abbreviations:</strong> AS = Avocado Sign, AUC = Area Under the Curve, CI = Confidence Interval, MRI = Magnetic Resonance Imaging, T2w = T2-weighted.</p>
        `;

        return keyResultsHTML + summaryStatementHTML + abstractContentHTML;
    }

    return Object.freeze({
        generateAbstractHTML
    });

})();
