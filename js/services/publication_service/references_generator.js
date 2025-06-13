const referencesGenerator = (() => {

    function generateReferencesHTML(stats, commonData) {
        const allReferences = commonData?.references;
        if (!allReferences || typeof allReferences !== 'object') {
            return '<p class="text-warning">References could not be loaded from configuration.</p>';
        }

        // Filter out internal references and sort by ID to ensure correct numbering
        const publicationReferences = Object.values(allReferences)
            .filter(ref => typeof ref === 'object' && ref.id && !ref.isInternal)
            .sort((a, b) => a.id - b.id);

        if (publicationReferences.length === 0) {
            return '<p>No references to display.</p>';
        }

        const listItems = publicationReferences.map(ref => `<li>${ref.text}</li>`).join('');
        
        return `<h4 id="references_main">References</h4><ol>${listItems}</ol>`;
    }

    return Object.freeze({
        generateReferencesHTML
    });

})();
