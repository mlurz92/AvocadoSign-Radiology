window.publicationService = (() => {

    const contentGenerators = {
        'abstract_main': window.abstractGenerator.generateAbstractHTML,
        'introduction_main': window.introductionGenerator.generateIntroductionHTML,
        
        'methoden_studienanlage_ethik': window.methodsGenerator.generateStudyDesignHTML,
        'methoden_mrt_protokoll_akquisition': window.methodsGenerator.generateMriProtocolAndImageAnalysisHTML,
        'methoden_vergleichskriterien_t2': window.methodsGenerator.generateComparativeCriteriaHTML,
        'methoden_referenzstandard_histopathologie': window.methodsGenerator.generateReferenceStandardHTML,
        'methoden_statistische_analyse_methoden': window.methodsGenerator.generateStatisticalAnalysisHTML,

        'ergebnisse_patientencharakteristika': window.resultsGenerator.generatePatientCharacteristicsHTML,
        'ergebnisse_as_diagnostische_guete': window.resultsGenerator.generateASPerformanceHTML,
        'ergebnisse_vergleich_as_vs_t2': window.resultsGenerator.generateComparisonHTML,

        'discussion_main': window.discussionGenerator.generateDiscussionHTML,
        'references_main': window.referencesGenerator.generateReferencesHTML
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

        const mainSection = window.PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (mainSection && Array.isArray(mainSection.subSections) && mainSection.subSections.length > 0) {
            let combinedHTML = '';
            try {
                mainSection.subSections.forEach(sub => {
                    const subGenerator = contentGenerators[sub.id];
                    if (typeof subGenerator === 'function') {
                        combinedHTML += subGenerator(stats, commonData);
                    } else {
                         combinedHTML += `<div class="alert alert-warning">Content generator for sub-section ID '${sub.id}' not found.</div>`;
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
