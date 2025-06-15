window.titlePageGenerator = (() => {

    function generateTitlePageHTML(stats, commonData) {
        
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
        
        const html = `
            <div class="publication-title-page" style="page-break-after: always; padding: 2rem; border-bottom: 1px solid #ccc; margin-bottom: 2rem;">
                <h1 style="font-size: 1.8rem; font-weight: bold; margin-bottom: 1rem; color: #000;">${title}</h1>
                
                <p style="font-size: 1.1rem; margin-bottom: 1rem;"><strong>Authors:</strong> ${authors}</p>
                
                <p style="font-size: 1rem; margin-bottom: 2rem;"><strong>From the:</strong> ${institution}</p>
                
                <hr style="margin: 2rem 0;">
                
                <div style="font-size: 0.9rem; color: #333;">
                    <p><strong>Corresponding Author:</strong><br>
                        ${correspondingAuthor.name}<br>
                        ${institution}<br>
                        ${correspondingAuthor.address}<br>
                        Email: ${correspondingAuthor.email}<br>
                        Telephone: ${correspondingAuthor.phone}
                    </p>
                    
                    <p><strong>Manuscript Type:</strong> ${manuscriptType}</p>
                    
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
