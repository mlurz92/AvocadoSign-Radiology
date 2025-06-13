const publicationService = (() => {

    const contentGenerators = {
        'abstract_main': abstractGenerator.generateAbstractHTML,
        'introduction_main': introductionGenerator.generateIntroductionHTML,
        
        'methoden_studienanlage_ethik': methodsGenerator.generateStudyDesignHTML,
        'methoden_mrt_protokoll_akquisition': methodsGenerator.generateMriProtocolAndImageAnalysisHTML,
        'methoden_vergleichskriterien_t2': methodsGenerator.generateComparativeCriteriaHTML,
        'methoden_referenzstandard_histopathologie': methodsGenerator.generateReferenceStandardHTML,
        'methoden_statistische_analyse_methoden': methodsGenerator.generateStatisticalAnalysisHTML,

        'ergebnisse_patientencharakteristika': resultsGenerator.generatePatientCharacteristicsHTML,
        'ergebnisse_as_diagnostische_guete': resultsGenerator.generateASPerformanceHTML,
        'ergebnisse_vergleich_as_vs_t2': resultsGenerator.generateComparisonHTML,

        'discussion_main': discussionGenerator.generateDiscussionHTML,
        'references_main': referencesGenerator.generateReferencesHTML
    };

    function generateSectionHTML(sectionId, stats, commonData) {
        const generator = contentGenerators[sectionId];

        if (typeof generator === 'function') {
            try {
                return generator(stats, commonData);
            } catch (error) {
                console.error(`Error generating content for section ${sectionId}:`, error);
                return `<div class="alert alert-danger">An error occurred while generating content for section '${sectionId}'. Please check the console for details.</div>`;
            }
        }

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (mainSection && mainSection.subSections.length > 1) {
            let combinedHTML = '';
            try {
                // Ensure sub-sections are rendered in their defined order
                mainSection.subSections.forEach(sub => {
                    const subGenerator = contentGenerators[sub.id];
                    if (typeof subGenerator === 'function') {
                        combinedHTML += subGenerator(stats, commonData);
                    }
                });
                return combinedHTML;
            } catch (error) {
                 console.error(`Error generating combined content for main section ${sectionId}:`, error);
                return `<div class="alert alert-danger">An error occurred while generating combined content for section '${sectionId}'. Please check the console.</div>`;
            }
        }
        
        return `<div class="alert alert-warning">Content generator for section ID '${sectionId}' not found or not implemented.</div>`;
    }
    
    return Object.freeze({
        generateSectionHTML
    });

})();
