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
            <h3 id="discussion_main">Discussion</h3>
            <p>In this study, we demonstrated that the Avocado Sign, a novel contrast-enhancement-based MRI marker, has high diagnostic performance for predicting mesorectal lymph node metastasis, with an overall accuracy of ${helpers.formatMetricForPublication(performanceAS.acc, 'acc')} and an AUC of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. ${bfResultsAvailable ? `Crucially, our analysis revealed that the performance of the Avocado Sign was statistically non-inferior to that of a cohort-optimized T2-weighted criteria set, which was computationally derived to represent a "best-case" scenario for conventional morphology (${helpers.formatPValueForPublication(comparisonASvsT2Bruteforce.delong.pValue)} for AUC comparison).` : `Its high diagnostic performance across patient subgroups underlines its potential to ameliorate MRI nodal staging.`} This finding suggests that the Avocado Sign is not only a strong standalone predictor but also a robust and simpler alternative to complex morphological assessments.</p>
            <p>The limitations of conventional T2-weighted criteria are well-documented. Prior meta-analyses have reported suboptimal pooled sensitivity and specificity of 77% and 71%, respectively ${helpers.getReference('REFERENCE_AL_SUKHNI_2012')}. Even more refined, modern criteria like the ESGAR 2016 consensus guidelines have shown limited sensitivity in recent validations ${helpers.getReference('REFERENCE_RUTEGARD_2025')}. Our results align with these findings, showing that literature-based criteria performed variably and often less effectively than the Avocado Sign. The Avocado Sign, in contrast, offers a potential simplification by providing a single, reproducible binary feature that appears effective across both primary staging and post-treatment evaluation scenarios. This is supported by its almost perfect interobserver agreement in our study (Cohen’s kappa = ${helpers.formatValueForPublication(overallStats.interobserverKappa, 2)}${(overallStats.interobserverKappaCI && isFinite(overallStats.interobserverKappaCI.lower) && isFinite(overallStats.interobserverKappaCI.upper)) ? `; 95% CI: ${helpers.formatValueForPublication(overallStats.interobserverKappaCI.lower, 2)}, ${helpers.formatValueForPublication(overallStats.interobserverKappaCI.upper, 2)}` : ''}), which suggests that the sign can be reliably assessed by radiologists with varying levels of expertise. Its straightforward application, requiring only routine high-resolution, fat-saturated contrast-enhanced T1-weighted sequences, makes it easily incorporable into standard MRI protocols.</p>
            <p>This study had several limitations. First, its retrospective, single-center design may limit the generalizability of our findings, and selection bias cannot be entirely ruled out. Second, all MRI examinations were performed on a single 3.0-T MRI system using one type of macrocyclic gadolinium-based contrast agent (Gadoteridol); thus, performance with other agents or at different field strengths is unknown and requires further validation. Third, our analysis was performed on a per-patient basis rather than a node-by-node correlation, which is challenging after neoadjuvant therapy and of debated clinical utility. Finally, this analysis did not include extramesorectal nodes or assess long-term oncologic outcomes, which warrants future research.</p>
            <p>In conclusion, the Avocado Sign is a highly accurate and reproducible imaging marker for the prediction of mesorectal lymph node involvement in rectal cancer. Its performance is comparable to a computationally optimized set of T2w criteria, suggesting it could simplify and standardize nodal assessment. Prospective multicenter validation is warranted to confirm these findings and establish the role of the Avocado Sign in routine clinical practice, potentially improving patient stratification for advanced treatment paradigms like total neoadjuvant therapy and nonoperative management.</p>
        `;

        return discussionText;
    }

    return Object.freeze({
        generateDiscussionHTML
    });

})();
