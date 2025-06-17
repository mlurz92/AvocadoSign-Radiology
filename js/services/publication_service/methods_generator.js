window.methodsGenerator = (() => {

    function generateStudyDesignHTML(stats, commonData) {
        const { nOverall, nNeoadjuvantTherapy, nSurgeryAlone } = commonData;
        const helpers = window.publicationHelpers;

        return `
            <h3 id="methoden_studienanlage_ethik">Study Design and Patients</h3>
            <p>This retrospective, single-institution study was performed in compliance with the Health Insurance Portability and Accountability Act and received approval from the institutional review board; the requirement for written informed consent was waived. We performed a secondary analysis of a cohort of ${helpers.formatValueForPublication(nOverall, 0)} consecutive patients with histologically confirmed rectal cancer who underwent pelvic MRI for primary staging or restaging between January 2020 and November 2023 ${helpers.getReference('Lurz_Schaefer_2025')}.</p>
            <p>While the patient cohort is identical to that of the initial study describing the Avocado Sign, the present study focuses on a direct and rigorous comparison of its diagnostic performance against a spectrum of T2-weighted criteria. To ensure methodologic rigor and prevent bias, all imaging data for this comparative analysis were re-evaluated in a new, fully blinded reading session. Inclusion criteria were the availability of high-quality T2-weighted and contrast-enhanced T1-weighted MRI sequences and a definitive histopathological reference standard from the subsequent surgical resection specimen. Of the final cohort, ${helpers.formatValueForPublication(nSurgeryAlone, 0)} (${helpers.formatValueForPublication(nSurgeryAlone / nOverall, 0, true)}%) underwent primary surgery after initial staging, while ${helpers.formatValueForPublication(nNeoadjuvantTherapy, 0)} (${helpers.formatValueForPublication(nNeoadjuvantTherapy / nOverall, 0, true)}%) received neoadjuvant chemoradiotherapy and underwent subsequent restaging MRI prior to surgery.</p>
        `;
    }

    function generateMriProtocolAndImageAnalysisHTML(stats, commonData) {
        const helpers = window.publicationHelpers;
        return `
            <h3 id="methoden_mrt_protokoll_akquisition">MRI Protocol and Image Analysis</h3>
            <p>All MRI examinations were performed on a 3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers) with a phased-array body coil. To minimize bowel peristalsis, butylscopolamine was administered intravenously. The standardized protocol included high-resolution, multiplanar T2-weighted turbo spin-echo sequences (axial, sagittal, coronal) and an axial diffusion-weighted sequence. Following the intravenous administration of a weight-based dose (0.2 mL/kg) of a macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco), a fat-suppressed, T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence was acquired. Key imaging parameters for the axial T2-weighted sequence were: repetition time 4400 msec, echo time 81 msec, slice thickness 2 mm. For the post-contrast VIBE sequence, parameters included: repetition time 5.8 msec, echo time 2.5/3.7 msec, slice thickness 1.5 mm.</p>
            <p>Two board-certified radiologists (with 7 and 29 years of experience in abdominal MRI, respectively), who were blinded to the histopathological outcomes and each other's findings, independently reviewed all MRI studies. Any discrepancies in assessment were resolved by consensus with a third radiologist with 19 years of experience.</p>
            <p><strong>Avocado Sign (AS) Assessment:</strong> On the contrast-enhanced T1-weighted VIBE images, all visible mesorectal lymph nodes were assessed for the presence of the Avocado Sign, defined as a distinct hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape ${helpers.getReference('Lurz_Schaefer_2025')}. No minimum size threshold was applied for lymph node evaluation. A patient was classified as AS-positive if at least one such node was identified.</p>
            <p><strong>T2-weighted (T2w) Criteria Assessment:</strong> The same radiologists evaluated the T2w images for five standard morphological features: size (short-axis diameter), shape (round vs oval), border (sharp vs irregular), internal homogeneity (homogeneous vs heterogeneous), and signal intensity (low, intermediate, or high relative to muscle). A patient with no visible T2w nodes was considered T2-negative if any T2w criterion was active. This feature set formed the basis for all subsequent comparative analyses.</p>
        `;
    }

    function generateComparativeCriteriaHTML(stats, commonData) {
        const { bruteForceMetricForPublication } = commonData;
        const helpers = window.publicationHelpers;

        const table2Config = {
            id: 'table-methods-t2-literature',
            caption: 'Table 2: Literature-Based T2-Weighted MRI Criteria Sets Used for Comparison',
            headers: ['Criteria Set', 'Study', 'Applicable Cohort', 'Key Criteria Summary', 'Logic'],
            rows: []
        };

        const literatureSets = window.PUBLICATION_CONFIG.literatureCriteriaSets;
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
            <h3 id="methoden_vergleichskriterien_t2">Comparative T2w Criteria Sets</h3>
            <p>To provide a robust benchmark for the Avocado Sign, we evaluated two distinct types of T2w criteria sets:</p>
            <p><strong>1. Literature-Based Criteria:</strong> We applied three criteria sets from previously published, influential studies to their respective target populations within our cohort (Table 2). These included the complex, size-dependent criteria from the ESGAR consensus group for the surgery-alone cohort, criteria based on morphological features by Koh et al. for the overall cohort, and a size-only criterion for post-nCRT restaging by Barbaro et al. ${helpers.getReference('Rutegard_2025')}${helpers.getReference('Koh_2008')}${helpers.getReference('Barbaro_2024')}.</p>
            ${helpers.createPublicationTableHTML(table2Config)}
            <p><strong>2. Cohort-Optimized Criteria (Brute-Force):</strong> To establish a data-driven "best-case" benchmark for T2w morphology within our specific dataset, we performed a systematic brute-force optimization. A computational algorithm exhaustively tested all combinations of the five T2w features (size, shape, border, homogeneity, signal), their respective values (e.g., size thresholds from 0.1 mm to 25.0 mm in 0.1 mm increments), and the logical operators 'AND' and 'OR' to identify the set that maximized a pre-selected diagnostic metric (${bruteForceMetricForPublication}). The best-performing criteria set for each cohort was used for secondary comparisons against the Avocado Sign.</p>
        `;
    }

    function generateReferenceStandardHTML(stats, commonData) {
        return `
            <h3 id="methoden_referenzstandard_histopathologie">Reference Standard</h3>
            <p>The definitive reference standard for N-status was the histopathological examination of the total mesorectal excision specimens performed by experienced gastrointestinal pathologists. All identified lymph nodes were meticulously dissected and analyzed for the presence of metastatic tumor cells. A patient was classified as N-positive if metastases were found in at least one lymph node.</p>
        `;
    }

    function generateStatisticalAnalysisHTML(stats, commonData) {
        const helpers = window.publicationHelpers;
        const statisticalSignificanceLevel = window.APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL;
        const nBootstrap = window.APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS;
        const appVersion = window.APP_CONFIG.APP_VERSION;

        const methodsText = `Descriptive statistics were used to summarize patient characteristics. Diagnostic performance metrics—including sensitivity, specificity, positive and negative predictive values, and accuracy—were calculated for each diagnostic method. The Wilson score method was used for 95% confidence intervals (CIs) of proportions, and the bootstrap percentile method (${helpers.formatValueForPublication(nBootstrap, 0)} replications) was used for CIs of the area under the receiver operating characteristic curve (AUC).`;

        const comparisonText = `The primary comparison between the AUC of the Avocado Sign and other criteria was performed using the method described by DeLong et al. for correlated ROC curves. McNemar’s test was used to compare accuracies. For associations between individual categorical features and N-status, Fisher's exact test was used. All statistical analyses were performed using custom scripts developed in JavaScript (ES2020) and integrated within a dedicated web-based analysis tool (AvocadoSign-Radiology, Version ${appVersion}). These computations were validated against established libraries in Python (e.g., statsmodels, scikit-learn). A two-sided ${helpers.formatPValueForPublication(statisticalSignificanceLevel)} was considered to indicate statistical significance.`;

        return `
            <h3 id="methoden_statistische_analyse_methoden">Statistical Analysis</h3>
            <p>${methodsText}</p>
            <p>${comparisonText}</p>
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