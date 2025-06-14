const methodsGenerator = (() => {

    function generateStudyDesignHTML(stats, commonData) {
        const { nOverall, nNeoadjuvantTherapy, nSurgeryAlone } = commonData;
        const helpers = publicationHelpers;

        return `
            <h3 id="methods_study_design">Study Design and Patients</h3>
            <p>This retrospective, single-institution study was performed in compliance with the Health Insurance Portability and Accountability Act and received approval from the institutional review board of Klinikum St. Georg, Leipzig, Germany. The requirement for written informed consent was waived for this retrospective analysis.</p>
            <p>We analyzed data from a previously described cohort of ${helpers.formatValueForPublication(nOverall, 0)} consecutive patients who underwent pelvic MRI for primary staging or restaging of histologically confirmed rectal cancer between January 2020 and November 2023 ${helpers.getReference('Lurz_Schaefer_2025')}. Inclusion criteria were the availability of high-quality T2-weighted and contrast-enhanced T1-weighted MRI sequences and a definitive histopathological reference standard from the subsequent surgical resection specimen. Exclusion criteria included contraindications to MRI or gadolinium-based contrast agents. Of the final cohort, ${helpers.formatValueForPublication(nNeoadjuvantTherapy, 0)} patients (${helpers.formatValueForPublication(nNeoadjuvantTherapy / nOverall, 1, true)}%) had received neoadjuvant chemoradiotherapy and underwent restaging MRI, while ${helpers.formatValueForPublication(nSurgeryAlone, 0)} patients (${helpers.formatValueForPublication(nSurgeryAlone / nOverall, 1, true)}%) proceeded directly to surgery after primary staging MRI.</p>
        `;
    }

    function generateMriProtocolAndImageAnalysisHTML(stats, commonData) {
        const helpers = publicationHelpers;
        return `
            <h3 id="methods_mri_protocol">MRI Protocol and Image Analysis</h3>
            <p>All MRI examinations were performed on a 3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers) with a phased-array body coil. To minimize bowel peristalsis, butylscopolamine was administered intravenously at the beginning of the examination. The standardized protocol included high-resolution, multiplanar T2-weighted turbo spin-echo sequences (axial, sagittal, coronal) and an axial diffusion-weighted sequence. Following the intravenous administration of a weight-based dose (0.2 mL/kg) of a macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco), a fat-suppressed, T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence was acquired. Key imaging parameters for the axial T2-weighted sequence were: repetition time 4400 msec, echo time 81 msec, slice thickness 2 mm. For the post-contrast VIBE sequence, parameters included: repetition time 5.8 msec, echo time 2.5/3.7 msec, slice thickness 1.5 mm. The imaging protocol was identical for both primary staging and post-nCRT restaging examinations.</p>
            <p>Two board-certified radiologists (M.L. and A.O.S., with 7 and 29 years of experience in abdominal MRI, respectively), who were blinded to the histopathological outcomes and each other's findings, independently reviewed all MRI studies. Any discrepancies in assessment were resolved by consensus with a third radiologist who had 19 years of experience in abdominal MRI.</p>
            <p><strong>Avocado Sign (AS) Assessment:</strong> On the contrast-enhanced T1-weighted VIBE images, all visible mesorectal lymph nodes were assessed for the presence of the Avocado Sign, defined as a distinct hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape ${helpers.getReference('Lurz_Schaefer_2025')}. No minimum size threshold was applied for lymph node evaluation to avoid overlooking small metastatic nodes. The Avocado Sign was assessed exclusively in mesorectal lymph nodes; extramesorectal nodes and tumor deposits were not assessed. A patient was classified as AS-positive if at least one such node was identified.</p>
            <p><strong>T2-weighted (T2w) Criteria Assessment:</strong> The same radiologists evaluated the T2w images for five standard morphological features: size (short-axis diameter), shape (round vs oval), border (sharp vs irregular), internal homogeneity (homogeneous vs heterogeneous), and signal intensity (low, intermediate, or high relative to muscle). This feature set formed the basis for subsequent comparative analyses.</p>
        `;
    }

    function generateComparativeCriteriaHTML(stats, commonData) {
        const { bruteForceMetricForPublication } = commonData;
        const helpers = publicationHelpers;

        const table2Config = {
            id: 'table-methods-t2-literature',
            caption: 'Table 2: Literature-Based T2-Weighted MRI Criteria Sets Used for Comparison',
            headers: ['Criteria Set', 'Study', 'Applicable Cohort', 'Key Criteria Summary', 'Logic'],
            rows: []
        };

        const literatureSets = PUBLICATION_CONFIG.literatureCriteriaSets;
        literatureSets.forEach(set => {
            table2Config.rows.push([
                set.name,
                set.studyInfo.reference,
                set.studyInfo.patientCohort,
                set.studyInfo.keyCriteriaSummary,
                set.logic === 'KOMBINIERT' ? 'Combined' : set.logic
            ]);
        });

        return `
            <h3 id="methods_comparative_criteria">Comparative T2w Criteria Sets</h3>
            <p>To provide a robust benchmark for the Avocado Sign, we evaluated two distinct types of T2w criteria sets:</p>
            <p><strong>1. Literature-Based Criteria:</strong> We applied three criteria sets from previously published, influential studies to their respective target populations within our cohort (Table 2). These included the complex, size-dependent criteria from the ESGAR consensus group for the surgery-alone cohort, criteria based on morphological features by Koh et al. for the overall cohort, and a size-only criterion for post-nCRT restaging by Barbaro et al. ${helpers.getReference('Rutegard_2025')}, ${helpers.getReference('Koh_2008')}, ${helpers.getReference('Barbaro_2024')}.</p>
            ${helpers.createPublicationTableHTML(table2Config)}
            <p><strong>2. Cohort-Optimized Criteria (Brute-Force):</strong> To establish a data-driven "best-case" benchmark for T2w morphology within our specific dataset, we performed a systematic brute-force optimization. A computational algorithm exhaustively tested all possible combinations of the five T2w features and logical operators (AND/OR) to identify the set that maximized a pre-selected diagnostic metric (${bruteForceMetricForPublication}). The best-performing criteria set for the overall cohort was used for the primary comparison against the Avocado Sign.</p>
        `;
    }

    function generateReferenceStandardHTML(stats, commonData) {
        return `
            <h3 id="methods_reference_standard">Reference Standard</h3>
            <p>The definitive reference standard for N-status was the histopathological examination of the total mesorectal excision specimens performed by experienced gastrointestinal pathologists. All identified lymph nodes were meticulously dissected and analyzed for the presence of metastatic tumor cells. A patient was classified as N-positive if metastases were found in at least one lymph node.</p>
        `;
    }

    function generateStatisticalAnalysisHTML(stats, commonData) {
        const helpers = publicationHelpers;
        const statisticalSignificanceLevel = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL;

        return `
            <h3 id="methods_statistical_analysis">Statistical Analysis</h3>
            <p>Descriptive statistics were used to summarize patient characteristics. Diagnostic performance metrics—including sensitivity, specificity, positive predictive value, negative predictive value, and accuracy—were calculated for each diagnostic method. Wilson score method was used for 95% confidence intervals (CIs) of proportions, and the bootstrap percentile method (${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} replications) was used for CIs of the area under the receiver operating characteristic curve (AUC) and F1-score.</p>
            <p>The primary comparison between the AUC of the Avocado Sign and the cohort-optimized T2w criteria was performed using the method described by DeLong et al. for correlated ROC curves. McNemar’s test was used to compare accuracies. For associations between individual categorical features and N-status, Fisher's exact test was used. All statistical analyses were performed using custom software scripts (JavaScript, Version ES6+). A two-sided ${helpers.formatPValueForPublication(statisticalSignificanceLevel - 0.001)} was considered to indicate statistical significance.</p>
        `;
    }

    return Object.freeze({
        generateStudyDesignHTML,
        generateMriProtocolAndImageAnalysisHTML,
        generateComparativeCriteriaHTML,
        generateReferenceStandardHTML,
        generateStatisticalAnalysisHTML
    });

})();
