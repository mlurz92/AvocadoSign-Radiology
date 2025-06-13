const methodsGenerator = (() => {

    function _generateStudyDesignHTML(stats, commonData) {
        const { nOverall, nNeoadjuvantTherapy, nSurgeryAlone } = commonData;
        const helpers = publicationHelpers;

        return `
            <h4 id="methoden_studienanlage_ethik">Study Design and Patients</h4>
            <p>This retrospective, single-institution study was performed in compliance with the Health Insurance Portability and Accountability Act and received approval from the institutional review board of Klinikum St. Georg, Leipzig, Germany. The requirement for written informed consent was waived for this retrospective analysis.</p>
            <p>We identified a consecutive cohort of ${helpers.formatValueForPublication(nOverall, 0)} patients who underwent pelvic MRI for primary staging or restaging of histologically confirmed rectal cancer between ${helpers.getReference('STUDY_PERIOD_2020_2023')}. Inclusion criteria were the availability of high-quality contrast-enhanced MRI sequences and definitive histopathological results from the subsequent surgical resection specimen. Exclusion criteria included contraindications to MRI or gadolinium-based contrast agents, or the absence of a surgical reference standard. Of the final cohort, ${helpers.formatValueForPublication(nNeoadjuvantTherapy, 0)} patients (${helpers.formatValueForPublication(nNeoadjuvantTherapy / nOverall, 0, true)}%) had received neoadjuvant chemoradiotherapy and underwent restaging MRI, while ${helpers.formatValueForPublication(nSurgeryAlone, 0)} patients (${helpers.formatValueForPublication(nSurgeryAlone / nOverall, 0, true)}%) proceeded directly to surgery after primary staging MRI.</p>
        `;
    }

    function _generateMriProtocolAndImageAnalysisHTML(stats, commonData) {
        const helpers = publicationHelpers;
        return `
            <h4 id="methoden_mrt_protokoll_akquisition">MRI Protocol and Image Analysis</h4>
            <p>All MRI examinations were performed on a 3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers) with a phased-array body coil. To minimize bowel peristalsis, butylscopolamine was administered intravenously at the beginning of the examination. The standardized protocol included high-resolution, multiplanar T2-weighted turbo spin-echo sequences and an axial diffusion-weighted sequence. Following the intravenous administration of a weight-based dose (0.2 mL/kg) of a macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco), a fat-suppressed, T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence was acquired. Key imaging parameters are detailed in Table 1. The imaging protocol was identical for both primary staging and post-nCRT restaging examinations.</p>
            <p>Two board-certified radiologists (M.L. and A.O.S., with 7 and 29 years of experience in abdominal MRI, respectively), who were blinded to the histopathological outcomes and each other's findings, independently reviewed all MRI studies. Any discrepancies in assessment were resolved by consensus.</p>
            <p><strong>Avocado Sign (AS) Assessment:</strong> On the contrast-enhanced T1-weighted VIBE images, all visible mesorectal lymph nodes were assessed for the presence of the Avocado Sign, defined as a distinct hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape ${helpers.getReference('REFERENCE_LURZ_SCHAEFER_2025')}. A patient was classified as AS-positive if at least one such node was identified.</p>
            <p><strong>T2-weighted (T2w) Criteria Assessment:</strong> The same radiologists evaluated the T2w images for five standard morphological features: size (short-axis diameter), shape (round vs. oval), border (sharp vs. irregular), internal homogeneity (homogeneous vs. heterogeneous), and signal intensity (low, intermediate, or high relative to muscle). This feature set was used for subsequent comparative analyses.</p>
        `;
    }

    function _generateComparativeCriteriaHTML(stats, commonData) {
        const { bruteForceMetricForPublication } = commonData;
        const helpers = publicationHelpers;

        return `
            <h4 id="methoden_vergleichskriterien_t2">Comparative T2w Criteria Sets</h4>
            <p>To provide a robust comparison for the Avocado Sign, we evaluated three distinct types of T2w criteria sets:</p>
            <p><strong>1. Literature-Based Criteria:</strong> We applied three criteria sets from previously published, influential studies to their respective target populations within our cohort (Table 2). These included the complex, size-dependent criteria from the ESGAR consensus group for the surgery-alone cohort, criteria based on morphological features by Koh et al for the overall cohort, and a size-only criterion for post-nCRT restaging by Barbaro et al ${helpers.getReference('REFERENCE_RUTEGARD_2025')}, ${helpers.getReference('REFERENCE_KOH_2008')}, ${helpers.getReference('REFERENCE_BARBARO_2024')}.</p>
            <p><strong>2. Cohort-Optimized Criteria (Brute-Force):</strong> To establish a "best-case" benchmark for T2w morphology within our specific dataset, we performed a systematic brute-force optimization. A computational algorithm exhaustively tested all possible combinations of the five T2w features and logical operators (AND/OR) to identify the set that maximized a pre-selected diagnostic metric (${bruteForceMetricForPublication}) for each patient cohort (Overall, Surgery alone, Neoadjuvant therapy). The best-performing criteria set for the overall cohort was used for the primary comparison against the Avocado Sign.</p>
        `;
    }

    function _generateReferenceStandardHTML(stats, commonData) {
        return `
            <h4 id="methoden_referenzstandard_histopathologie">Reference Standard</h4>
            <p>The definitive reference standard for N-status was the histopathological examination of the total mesorectal excision specimens performed by experienced gastrointestinal pathologists. All identified lymph nodes were meticulously dissected and analyzed for the presence of metastatic tumor cells. A patient was classified as N-positive if metastases were found in at least one lymph node.</p>
        `;
    }

    function _generateStatisticalAnalysisHTML(stats, commonData) {
        const helpers = publicationHelpers;
        return `
            <h4 id="methoden_statistische_analyse_methoden">Statistical Analysis</h4>
            <p>Descriptive statistics were used to summarize patient characteristics. Diagnostic performance metrics—including sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV), accuracy, and the area under the receiver operating characteristic curve (AUC)—were calculated for each diagnostic method. Wilson score method was used for 95% confidence intervals (CIs) of proportions, and the bootstrap percentile method (${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} replications) was used for CIs of AUC and F1-score.</p>
            <p>The primary comparison between the AUC of the Avocado Sign and the cohort-optimized T2w criteria was performed using the method described by DeLong et al. for paired ROC curves. McNemar’s test was used to compare accuracies. For associations between individual categorical features and N-status, Fisher's exact test was used. All statistical analyses were performed using custom scripts in JavaScript, leveraging standard statistical formulas. A two-sided ${helpers.formatPValueForPublication(0.049)} was considered to indicate statistical significance.</p>
        `;
    }


    function generateMethodsHTML(stats, commonData) {
        let html = _generateStudyDesignHTML(stats, commonData);
        html += _generateMriProtocolAndImageAnalysisHTML(stats, commonData);
        html += _generateComparativeCriteriaHTML(stats, commonData);
        html += _generateReferenceStandardHTML(stats, commonData);
        html += _generateStatisticalAnalysisHTML(stats, commonData);
        return html;
    }

    return Object.freeze({
        generateMethodsHTML
    });

})();