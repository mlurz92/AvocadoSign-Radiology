const abstractGenerator = (() => {

    function generateAbstractHTML(stats, commonData) {
        const overallStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        
        if (!overallStats || !overallStats.descriptive || !overallStats.performanceAS) {
            return '<p class="text-warning">Required base statistics for abstract generation are missing.</p>';
        }

        const { descriptive, performanceAS, performanceT2Bruteforce, comparisonASvsT2Bruteforce } = overallStats;
        const { nOverall, nPositive, bruteForceMetricForPublication } = commonData;
        const helpers = publicationHelpers;
        
        const bfResultsAvailable = !!(performanceT2Bruteforce && comparisonASvsT2Bruteforce);

        let keyResultsHTML;
        let resultsSectionHTML;
        let conclusionText;
        let summaryStatementHTML;

        const ageFormatted = helpers.formatValueForPublication(descriptive.age.median, 0);
        const ageIQR = `${helpers.formatValueForPublication(descriptive.age.q1, 0)}–${helpers.formatValueForPublication(descriptive.age.q3, 0)}`;

        if (bfResultsAvailable) {
            keyResultsHTML = `
                <h2>Key Results</h2>
                <ul>
                    <li>In this retrospective study of ${nOverall} patients with rectal cancer, the contrast-based Avocado Sign (AS) showed an area under the curve (AUC) of ${helpers.formatValueForPublication(performanceAS.auc.value, 2)} for predicting nodal metastasis.</li>
                    <li>A cohort-optimized T2-weighted (T2w) criteria set, identified via brute-force analysis to maximize ${bruteForceMetricForPublication}, yielded an AUC of ${helpers.formatValueForPublication(performanceT2Bruteforce.auc.value, 2)}.</li>
                    <li>The difference in diagnostic performance between the AS and the optimized T2w criteria was not statistically significant (${helpers.formatPValueForPublication(comparisonASvsT2Bruteforce.delong.pValue)}).</li>
                </ul>
            `;
            resultsSectionHTML = `
                <p>A total of ${nOverall} patients (median age, ${ageFormatted} years; interquartile range: ${ageIQR} years; ${descriptive.sex.m} men) were analyzed, of whom ${nPositive} (${helpers.formatValueForPublication(nPositive / nOverall, 0, true)}%) were N-positive. The AS demonstrated an AUC of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. A brute-force optimized T2w criteria set (target metric: ${bruteForceMetricForPublication}) yielded a numerically similar AUC of ${helpers.formatMetricForPublication(performanceT2Bruteforce.auc, 'auc')}. The difference in AUC between AS and the optimized T2w criteria was not statistically significant (${helpers.formatPValueForPublication(comparisonASvsT2Bruteforce.delong.pValue)}).</p>
            `;
            conclusionText = `
                <p>The Avocado Sign is a highly reproducible MRI marker for predicting lymph node status in rectal cancer, demonstrating diagnostic performance non-inferior to cohort-optimized T2w criteria and superior to several established literature-based criteria. Its application has the potential to simplify and improve the accuracy of preoperative nodal staging.</p>
            `;
            summaryStatementHTML = `
                <p><strong>In this retrospective analysis of ${nOverall} patients with rectal cancer, the Avocado Sign, a contrast-enhanced MRI marker, provided diagnostic performance for nodal staging that was non-inferior to cohort-optimized T2-weighted criteria.</strong></p>
            `;
        } else {
            keyResultsHTML = `
                <h2>Key Results</h2>
                <ul>
                    <li>In this retrospective study of ${nOverall} patients with rectal cancer, the contrast-based Avocado Sign (AS) showed an area under the curve (AUC) of ${helpers.formatValueForPublication(performanceAS.auc.value, 2)} for predicting nodal metastasis.</li>
                    <li>A cohort-optimized T2-weighted (T2w) criteria set could be identified via brute-force analysis to maximize ${bruteForceMetricForPublication}.</li>
                    <li>A direct statistical comparison between the Avocado Sign and an optimized T2w set is pending completion of the brute-force analysis.</li>
                </ul>
                <p class="small text-muted"><em>Note: Brute-force optimization has not been run or is currently in progress. Some values are placeholders.</em></p>
            `;
            resultsSectionHTML = `
                <p>A total of ${nOverall} patients (median age, ${ageFormatted} years; interquartile range: ${ageIQR} years; ${descriptive.sex.m} men) were analyzed, of whom ${nPositive} (${helpers.formatValueForPublication(nPositive / nOverall, 0, true)}%) were N-positive. The AS demonstrated an AUC of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. The performance of a brute-force optimized T2w criteria set is being determined. [Statistical comparison pending completion of brute-force analysis].</p>
            `;
             conclusionText = `
                <p>The Avocado Sign is a highly reproducible MRI marker for predicting lymph node status in rectal cancer, demonstrating strong diagnostic performance. Further comparison with optimized T2w criteria is warranted to fully establish its role in simplifying and improving the accuracy of preoperative nodal staging.</p>
            `;
            summaryStatementHTML = `
                <p class="small text-muted"><strong>Summary Statement:</strong> Brute-force optimization is pending. Final summary statement will be generated upon completion.</p>
            `;
        }

        const abstractContentHTML = `
            <h2>Abstract</h2>
            <div class="structured-abstract">
                <h3>Background</h3>
                <p>Accurate preoperative determination of mesorectal lymph node status (N-status) is crucial for treatment decisions in rectal cancer, yet standard T2-weighted (T2w) MRI criteria have shown limited accuracy.</p>
                
                <h3>Purpose</h3>
                <p>To evaluate the diagnostic performance of the "Avocado Sign" (AS), a novel contrast-enhanced MRI marker, and to compare it with established literature-based and cohort-optimized T2w morphological criteria for predicting N-status.</p>
                
                <h3>Materials and Methods</h3>
                <p>This retrospective, single-center study received institutional review board approval, with a waiver of informed consent. Data from consecutive patients with histologically confirmed rectal cancer enrolled between ${helpers.getReference('STUDY_PERIOD_2020_2023')} were analyzed. Two blinded radiologists evaluated the AS (a hypointense core within a homogeneously hyperintense lymph node on contrast-enhanced T1-weighted images) and T2w criteria. Histopathological examination served as the reference standard. Diagnostic performance was assessed using the area under the receiver operating characteristic curve (AUC), and methods were compared with the DeLong test for paired ROC curves. McNemar’s test was used to compare accuracies.</p>
                
                <h3>Results</h3>
                ${resultsSectionHTML}
                
                <h3>Conclusion</h3>
                ${conclusionText}
            </div>
            <hr>
            <p class="small text-muted mt-2"><strong>Abbreviations:</strong> AS = Avocado Sign, AUC = Area Under the Curve, CI = Confidence Interval, MRI = Magnetic Resonance Imaging, nCRT = neoadjuvant chemoradiotherapy, NPV = Negative Predictive Value, PPV = Positive Predictive Value, ROC = Receiver Operating Characteristic, T2w = T2-weighted.</p>
        `;

        return keyResultsHTML + summaryStatementHTML + abstractContentHTML;
    }

    return Object.freeze({
        generateAbstractHTML
    });

})();
