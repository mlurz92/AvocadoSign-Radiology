window.publicationService = (() => {

    const contentGenerators = {
        'title_main': window.titlePageGenerator.generateTitlePageHTML,
        'abstract_main': window.abstractGenerator.generateAbstractHTML,
        'introduction_main': window.introductionGenerator.generateIntroductionHTML,
        'methoden_studienanlage_ethik': window.methodsGenerator.generateStudyDesignHTML,
        'methoden_mrt_protokoll_akquisition': window.methodsGenerator.generateMriProtocolAndImageAnalysisHTML,
        'methoden_vergleichskriterien_t2': window.methodsGenerator.generateComparativeCriteriaHTML,
        'methoden_referenzstandard_histopathologie': window.methodsGenerator.generateReferenceStandardHTML,
        'methoden_statistische_analyse_methoden': window.methodsGenerator.generateStatisticalAnalysisHTML,
        'ergebnisse_patientencharakteristika': window.resultsGenerator.generatePatientCharacteristicsHTML,
        'ergebnisse_vergleich_as_vs_t2': window.resultsGenerator.generateComparisonHTML,
        'discussion_main': window.discussionGenerator.generateDiscussionHTML,
        'references_main': window.referencesGenerator.generateReferencesHTML
    };

    function _processAndNumberReferences(html, allReferences) {
        const citedRefKeys = new Map();
        let refCounter = 1;

        const processedHtml = html.replace(/\[([A-Za-z0-9_]+)\]/g, (match, refKey) => {
            if (!allReferences[refKey]) {
                return `[REF_NOT_FOUND: ${refKey}]`;
            }
            if (!citedRefKeys.has(refKey)) {
                citedRefKeys.set(refKey, refCounter++);
            }
            const citationNumber = citedRefKeys.get(refKey);
            return `(${citationNumber})`;
        });

        const sortedCitedRefs = Array.from(citedRefKeys.entries()).sort((a, b) => a[1] - b[1]);

        let referencesHtml = '';
        if (sortedCitedRefs.length > 0) {
            const listItems = sortedCitedRefs.map(([key, number]) => {
                const refData = allReferences[key];
                if (!refData) {
                    return `<li>Reference for key '${key}' not found.</li>`;
                }
                const formattedText = refData.text.replace(/(\d{4};\d{1,3}:\d{1,4}–\d{1,4})/, '<strong>$1</strong>');
                return `<li>${formattedText}</li>`;
            }).join('');
            referencesHtml = `<h2 id="references_main">References</h2><ol>${listItems}</ol>`;
        }

        return { processedHtml, referencesHtml };
    }

    function generateSectionHTML(sectionId, stats, commonData) {
        const generator = contentGenerators[sectionId];
        if (typeof generator === 'function') {
            try {
                return generator(stats, commonData);
            } catch (error) {
                return `<div class="alert alert-danger">An error occurred while generating content for section '${sectionId}'.</div>`;
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
                    }
                });
                return combinedHTML;
            } catch (error) {
                return `<div class="alert alert-danger">An error occurred while generating combined content for section '${sectionId}'.</div>`;
            }
        }
        
        return `<div class="alert alert-warning">Content generator for section ID '${sectionId}' not found.</div>`;
    }
    
    function generateFullPublicationHTML(allCohortStats, commonData) {
        if (!allCohortStats || !commonData) {
            return '<div class="alert alert-warning">Statistical data or common configuration is missing for publication generation.</div>';
        }

        let rawContentHTML = window.titlePageGenerator.generateTitlePageHTML(allCohortStats, commonData);

        window.PUBLICATION_CONFIG.sections.forEach(section => {
            if (section.id === 'references_main') return;

            const sectionLabel = window.APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[section.labelKey] || section.labelKey;
            
            rawContentHTML += `<h2 id="${section.id}">${sectionLabel}</h2>`;
            rawContentHTML += generateSectionHTML(section.id, allCohortStats, commonData);
        });
        
        const allReferences = commonData?.references || {};
        const { processedHtml, referencesHtml } = _processAndNumberReferences(rawContentHTML, allReferences);
        
        return processedHtml + referencesHtml;
    }

    return Object.freeze({
        generateFullPublicationHTML,
        generateSectionHTML
    });

})();
