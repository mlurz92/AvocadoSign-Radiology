const discussionGenerator = (() => {

    function generateDiscussionHTML(stats, commonData) {
        const overallStats = stats?.[APP_CONFIG.COHORTS.OVERALL.id];
        if (!overallStats || !overallStats.performanceAS) {
            return '<p class="text-warning">Discussion could not be generated due to missing statistical data.</p>';
        }

        const helpers = publicationHelpers;
        const performanceAS = overallStats.performanceAS;
        
        const discussionText = `
            <p>In this study, we demonstrated that the Avocado Sign, a novel contrast-enhancement-based MRI marker, has high diagnostic performance for predicting mesorectal lymph node metastasis, with an overall accuracy of ${helpers.formatMetricForPublication(performanceAS.acc, 'acc')} and an AUC of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. Crucially, our analysis revealed that the performance of the Avocado Sign was statistically non-inferior to that of a "best-case" T2w criteria set, which was computationally optimized for our specific patient cohort. This finding suggests that the Avocado Sign is not only a strong standalone predictor but also a robust alternative to complex morphological assessments.</p>
            <p>The limitations of conventional T2w criteria are well-documented. Studies such as the OCUM trial reported accuracies as low as 56.5% for nodal staging, leading to the conclusion that major treatment decisions should not be based on T- and N-staging alone ${helpers.getReference('REFERENCE_STELZNER_2022')}. While various refined criteria have been proposed, such as those by the ESGAR consensus group or Barbaro et al. for the post-nCRT setting, they often involve complex, size-dependent rules or show variable performance ${helpers.getReference('REFERENCE_BEETS_TAN_2018')}, ${helpers.getReference('REFERENCE_BARBARO_2024')}. The Avocado Sign offers a potential simplification by providing a single, reproducible binary feature that appears effective across both primary staging and post-treatment evaluation scenarios, as evidenced by its consistent high performance in our subgroups.</p>
            <p>Our study has several limitations. First, its retrospective, single-center design may limit the generalizability of our findings. Second, all examinations were performed on a single 3.0-T MRI system using one type of gadolinium-based contrast agent; performance with other agents or field strengths is unknown. Third, we focused on patient-level analysis rather than a node-by-node correlation, which is challenging after nCRT and of debated clinical utility. Finally, this analysis did not include extramesorectal nodes or assess long-term oncologic outcomes.</p>
            <p>In conclusion, the Avocado Sign is a highly accurate and reproducible imaging marker for the prediction of mesorectal lymph node involvement in rectal cancer. Its performance is comparable to a computationally optimized set of T2w criteria, suggesting it could simplify and standardize nodal assessment. Prospective multicenter validation is warranted to confirm these findings and establish the role of the Avocado Sign in routine clinical practice, potentially improving patient stratification for advanced treatment paradigms like total neoadjuvant therapy and nonoperative management.</p>
        `;

        return discussionText;
    }

    return Object.freeze({
        generateDiscussionHTML
    });

})();