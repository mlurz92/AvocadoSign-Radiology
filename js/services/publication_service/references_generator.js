const referencesGenerator = (() => {

    function generateReferencesHTML(stats, commonData) {
        const allReferences = commonData?.references;
        if (!allReferences || typeof allReferences !== 'object') {
            return '<p class="text-warning">References could not be loaded from configuration.</p>';
        }

        const publicationReferences = Object.values(allReferences)
            .filter(ref => typeof ref === 'object' && ref.id && !ref.isInternal)
            .sort((a, b) => a.id - b.id);

        if (publicationReferences.length === 0) {
            return '<p>No references to display.</p>';
        }

        const listItems = publicationReferences.map(ref => `<li>${ref.text}</li>`).join('');
        
        return `<ol>${listItems}</ol>`;
    }

    return Object.freeze({
        generateReferencesHTML
    });

})();