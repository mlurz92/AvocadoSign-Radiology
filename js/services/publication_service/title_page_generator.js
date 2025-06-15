window.titlePageGenerator = (() => {

    function generateTitlePageHTML(stats, commonData) {
        
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        const helpers = window.publicationHelpers;

        const title = "Avocado Sign versus T2-weighted Criteria for Nodal Staging in Rectal Cancer";
        const authors = "Markus Lurz, Arnd-Oliver Schäfer";
        const institution = "Department of Radiology and Nuclear Medicine, Leipzig, Germany";
        const correspondingAuthor = {
            name: "Markus Lurz",
            address: "Delitzscher Str. 141, 04129 Leipzig, Germany",
            email: "Markus.Lurz sanktgeorg.de",
            phone: "+49 (0)341 909-0000"
        };
        
        const manuscriptType = "Original Research";
        const fundingStatement = "The authors state that this work has not received any funding.";
        const dataSharingStatement = "Data generated or analyzed during the study are available from the corresponding author by request.";

        let keyResultsHTML = '<p>Key results could not be generated.</p>';
        let summaryStatementHTML = '<p>Summary statement could not be generated.</p>';

        if (overallStats && commonData) {
            const { performanceAS } = overallStats;
            const { nOverall, bruteForceMetricForPublication } = commonData;
            const bfResultForPub = overallStats.performanceT2Bruteforce?.[bruteForceMetricForPublication];
            const bfComparisonForPub = overallStats.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];

            summaryStatementHTML = `<p><strong>In a retrospective analysis of ${nOverall} patients with rectal cancer, the Avocado Sign on contrast-enhanced MRI demonstrated diagnostic performance for nodal staging that was non-inferior to a cohort-optimized T2-weighted criteria set.</strong></p>`;
            
            keyResultsHTML = `
                <h4 style="font-size: 1.1rem; font-weight: bold; margin-top: 1.5rem;">Key Results</h4>
                <ul style="padding-left: 20px; margin-top: 0.5rem;">
                    <li>In a retrospective study of ${nOverall} patients with rectal cancer, the Avocado Sign (AS) on contrast-enhanced MRI yielded an area under the receiver operating characteristic curve (AUC) of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc', false, true)}.</li>
                    ${bfResultForPub ? `<li>A cohort-optimized T2-weighted (T2w) criteria set, identified via brute-force analysis, yielded an AUC of ${helpers.formatMetricForPublication(bfResultForPub.auc, 'auc', false, true)}.</li>` : ''}
                    ${bfComparisonForPub ? `<li>The diagnostic performance of the AS was not inferior to that of the cohort-optimized T2w criteria (${helpers.formatPValueForPublication(bfComparisonForPub.delong.pValue)}).</li>` : ''}
                </ul>
            `;
        }
        
        const html = `
            <div class="publication-title-page" style="padding: 2rem; border-bottom: 2px solid #333; margin-bottom: 2rem;">
                <p style="font-size: 1rem; color: #555;"><strong>Article Type:</strong> ${manuscriptType}</p>
                <h1 style="font-size: 1.8rem; font-weight: bold; margin-bottom: 1rem; color: #000;">${title}</h1>
                <div style="font-size: 1rem; color: #333; margin-bottom: 1.5rem;">
                    <p style="margin-bottom: 0.25rem;"><strong>Authors:</strong> ${authors}</p>
                    <p style="margin-bottom: 0;"><strong>From the:</strong> ${institution}</p>
                </div>

                ${summaryStatementHTML}
                ${keyResultsHTML}
                
                <div style="font-size: 0.85rem; color: #444; margin-top: 2rem; border-top: 1px solid #ccc; padding-top: 1rem;">
                    <p><strong>Corresponding Author:</strong><br>
                        ${correspondingAuthor.name}, ${institution}, ${correspondingAuthor.address}. 
                        Email: ${correspondingAuthor.email}
                    </p>
                    <p><strong>Funding:</strong> ${fundingStatement}</p>
                    <p><strong>Data Sharing Statement:</strong> ${dataSharingStatement}</p>
                </div>
            </div>
        `;
        
        return html;
    }

    return Object.freeze({
        generateTitlePageHTML
    });

})();
