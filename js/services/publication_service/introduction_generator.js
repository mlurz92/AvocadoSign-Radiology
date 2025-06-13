const introductionGenerator = (() => {

    function generateIntroductionHTML(stats, commonData) {
        const helpers = publicationHelpers;

        const introText = `
            <p>Accurate preoperative determination of mesorectal lymph node status (N-status) in patients with rectal cancer is of paramount importance, as it directly influences therapeutic strategies, ranging from primary surgery to neoadjuvant chemoradiotherapy (nCRT) and organ-preserving "watch-and-wait" approaches ${helpers.getReference('REFERENCE_SAUER_2004')}–${helpers.getReference('REFERENCE_SMITH_2015')}. Magnetic resonance imaging (MRI) is the established gold standard for local staging; however, its accuracy for N-staging, which traditionally relies on T2-weighted (T2w) morphological criteria such as size, border irregularity, and signal heterogeneity, remains a subject of debate ${helpers.getReference('REFERENCE_BEETS_TAN_2018')}.</p>
            <p>Multiple studies and meta-analyses have highlighted the suboptimal diagnostic performance of these T2w criteria, with reported sensitivities and specificities often falling below 80% ${helpers.getReference('REFERENCE_ZHANG_2017')}, ${helpers.getReference('REFERENCE_AL_SUKHNI_2012')}. This diagnostic uncertainty can lead to both over- and undertreatment, underscoring a critical need for more reliable imaging markers. While advanced techniques like diffusion-weighted imaging have been explored, they have not yet consistently surpassed morphological assessment in clinical practice ${helpers.getReference('REFERENCE_HAO_2025')}.</p>
            <p>Our group previously introduced the "Avocado Sign" (AS), a novel marker observed on contrast-enhanced T1-weighted MRI, defined as a hypointense core within a homogeneously hyperintense lymph node ${helpers.getReference('REFERENCE_LURZ_SCHAEFER_2025')}. The initial evaluation suggested high diagnostic accuracy and excellent interobserver reproducibility. However, a direct and robust comparison against both established literature-based criteria and a data-optimized "best-case" scenario for T2w morphology on the same patient cohort has been lacking.</p>
            <p>This study aims to rigorously evaluate the diagnostic performance of the Avocado Sign in comparison with a spectrum of T2w criteria. Our primary hypothesis is that the Avocado Sign is diagnostically non-inferior to the best possible T2w criteria combination derived from our cohort and superior to commonly cited literature-based criteria, thereby offering a more reliable and simpler alternative for nodal staging in rectal cancer.</p>
        `;

        return introText;
    }

    return Object.freeze({
        generateIntroductionHTML
    });

})();