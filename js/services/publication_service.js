const publicationService = (() => {

    const contentGenerators = {
        'abstract_main': abstractGenerator.generateAbstractHTML,
        'introduction_main': introductionGenerator.generateIntroductionHTML,
        'methoden_studienanlage_ethik': methodsGenerator.generateMethodsHTML,
        'methoden_mrt_protokoll_akquisition': methodsGenerator.generateMethodsHTML,
        'methoden_vergleichskriterien_t2': methodsGenerator.generateMethodsHTML,
        'methoden_referenzstandard_histopathologie': methodsGenerator.generateMethodsHTML,
        'methoden_statistische_analyse_methoden': methodsGenerator.generateMethodsHTML,
        'ergebnisse_patientencharakteristika': resultsGenerator.generateResultsHTML,
        'ergebnisse_as_diagnostische_guete': resultsGenerator.generateResultsHTML,
        'ergebnisse_vergleich_as_vs_t2': resultsGenerator.generateResultsHTML,
        'discussion_main': discussionGenerator.generateDiscussionHTML,
        'references_main': referencesGenerator.generateReferencesHTML
    };
    
    const singleSectionGenerators = {
        'methoden_main': methodsGenerator.generateMethodsHTML,
        'ergebnisse_main': resultsGenerator.generateResultsHTML
    };

    function generateSectionHTML(sectionId, stats, commonData) {
        let generator;

        if (singleSectionGenerators[sectionId]) {
            generator = singleSectionGenerators[sectionId];
        } else {
            const mainSection = PUBLICATION_CONFIG.sections.find(s => s.subSections.some(sub => sub.id === sectionId));
            if (mainSection) {
                 const mainGeneratorKey = mainSection.id;
                 if (singleSectionGenerators[mainGeneratorKey]) {
                      generator = singleSectionGenerators[mainGeneratorKey];
                 } else {
                     const subSection = mainSection.subSections.find(sub => sub.id === sectionId);
                     generator = contentGenerators[subSection.id];
                 }
            }
        }

        if (typeof generator === 'function') {
            try {
                return generator(stats, commonData);
            } catch (error) {
                console.error(`Error generating content for section ${sectionId}:`, error);
                return `<p class="text-danger">An error occurred while generating content for section '${sectionId}'. Please check the console.</p>`;
            }
        }
        
        return `<p class="text-warning">Content generator for section ID '${sectionId}' not found.</p>`;
    }
    
    return Object.freeze({
        generateSectionHTML
    });

})();