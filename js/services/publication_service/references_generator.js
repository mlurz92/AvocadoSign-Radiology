window.referencesGenerator = (() => {

    function generateReferencesHTML(stats, commonData) {
        const allReferences = commonData?.references;
        if (!allReferences || typeof allReferences !== 'object') {
            return '<p class="text-warning">References could not be loaded from configuration.</p>';
        }

        // This function is effectively a placeholder.
        // The final, correctly numbered reference list is generated dynamically
        // in publication_tab.js to ensure proper citation order based on appearance in the text.
        // This keeps the module structure intact without executing redundant code.

        return `<h3 id="references_main">References</h3><p class="text-muted">[The numbered reference list will be generated here based on the order of citation in the text.]</p>`;
    }

    return Object.freeze({
        generateReferencesHTML
    });

})();
