const discussionGenerator = (() => {

    function generateDiscussionHTML(stats, commonData) {
        const overallStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        if (!overallStats || !overallStats.performanceAS) {
            return '<p class="text-warning">Discussion could not be generated due to missing statistical data.</p>';
        }

        const helpers = publicationHelpers;
        const performanceAS = overallStats.performanceAS;
        const performanceT2Bruteforce = overallStats.performanceT2Bruteforce;
        const comparisonASvsT2Bruteforce = overallStats.comparisonASvsT2Bruteforce;
        const bfResultsAvailable = !!(performanceT2Bruteforce && comparisonASvsT2Bruteforce);


        let discussionText = `
            <h4 id="discussion_main">Discussion</h4>
            <p>In this study, we demonstrated that the Avocado Sign, a novel contrast-enhancement-based MRI marker, has high diagnostic performance for predicting mesorectal lymph node metastasis, with an overall accuracy of ${helpers.formatMetricForPublication(performanceAS.acc, 'acc')} and an AUC of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. ${bfResultsAvailable ? `Crucially, our analysis revealed that the performance of the Avocado Sign was statistically non-inferior to that of a "best-case" T2w criteria set, which was computationally optimized for our specific patient cohort, as evidenced by a non-significant difference in AUC (${helpers.formatPValueForPublication(comparisonASvsT2Bruteforce.delong.pValue)}).` : `Its high diagnostic performance across patient subgroups underlines its potential to ameliorate MRI nodal staging.`} This finding suggests that the Avocado Sign is not only a strong standalone predictor but also a robust alternative to complex morphological assessments.</p>
            <p>The limitations of conventional T2w criteria are well-documented. Prior studies have highlighted their suboptimal diagnostic performance, with reported sensitivities and specificities often falling below 80%. Studies such as the OCUM trial reported accuracies as low as 56.5% for nodal staging, leading to the conclusion that major treatment decisions should not be based on T- and N-staging alone. While various refined criteria have been proposed, such as those by the ESGAR consensus group or Barbaro et al. for the post-nCRT setting, they often involve complex, size-dependent rules or show variable performance. The Avocado Sign offers a potential simplification by providing a single, reproducible binary feature that appears effective across both primary staging and post-treatment evaluation scenarios, as evidenced by its consistent high performance in our subgroups. The almost perfect interobserver agreement (Cohen’s kappa = ${helpers.formatValueForPublication(overallStats.interobserverKappa, 2)}${(overallStats.interobserverKappaCI && isFinite(overallStats.interobserverKappaCI.lower) && isFinite(overallStats.interobserverKappaCI.upper)) ? ` (95% CI: ${helpers.formatValueForPublication(overallStats.interobserverKappaCI.lower, 2)}, ${helpers.formatValueForPublication(overallStats.interobserverKappaCI.upper, 2)})` : ''}) indicates that the Avocado Sign can be reliably assessed by radiologists with varying levels of expertise. Furthermore, its straightforward application, only requiring routine high-resolution, thin-slice, fat-saturated contrast-enhanced T1-weighted sequences, makes it easily incorporable into standard MRI protocols.</p>
            <p>Our study has several limitations. First, its retrospective, single-center design may limit the generalizability of our findings and selection bias cannot be entirely ruled out. Second, all MRI examinations were performed on a single 3.0-T MRI system using one type of macrocyclic gadolinium-based contrast agent (Gadoteridol); thus, performance with other agents or field strengths is unknown and requires further validation. Third, we focused on patient-level analysis rather than a node-by-node correlation, which is challenging after nCRT and of debated clinical utility. Finally, this analysis did not include extramesorectal nodes or assess long-term oncologic outcomes, which warrants future research.</p>
            <p>In conclusion, the Avocado Sign is a highly accurate and reproducible imaging marker for the prediction of mesorectal lymph node involvement in rectal cancer. Its performance is comparable to a computationally optimized set of T2w criteria, suggesting it could simplify and standardize nodal assessment. Prospective multicenter validation is warranted to confirm these findings and establish the role of the Avocado Sign in routine clinical practice, potentially improving patient stratification for advanced treatment paradigms like total neoadjuvant therapy and nonoperative management.</p>
        `;

        return discussionText;
    }

    return Object.freeze({
        generateDiscussionHTML
    });

})();
