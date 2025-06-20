window.exportService = (() => {

    function generateFilename(typeKey, kollektiv, extension, options = {}) {
        const dateStr = getCurrentDateString(window.APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getCohortDisplayName(kollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        let filenameType = window.APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[typeKey] || typeKey || 'Export';

        if (options.chartName) {
            filenameType = filenameType.replace('{ChartName}', options.chartName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        }
        if (options.tableName) {
            filenameType = filenameType.replace('{TableName}', options.tableName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        } else if (typeKey === 'TABLE_PNG_EXPORT' && options.tableId) {
             filenameType = filenameType.replace('{TableName}', options.tableId.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        }

        if (options.studyId && filenameType.includes('{StudyID}')) {
             const safeStudyId = String(options.studyId).replace(/[^a-z0-9_-]/gi, '_');
             filenameType = filenameType.replace('{StudyID}', safeStudyId);
        } else {
             filenameType = filenameType.replace('_{StudyID}', '').replace('{StudyID}', '');
        }

        if (options.sectionName && filenameType.includes('{SectionName}')) {
            const safeSectionName = String(options.sectionName).replace(/[^a-z0-9_-]/gi, '_').substring(0,20);
            filenameType = filenameType.replace('{SectionName}', safeSectionName);
        } else {
            filenameType = filenameType.replace('_{SectionName}', '').replace('{SectionName}', '');
        }

        const filename = window.APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE
            .replace('{TYPE}', filenameType)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension);
        return filename;
    }

    function downloadFile(content, filename, mimeType) {
        try {
            if (content === null || content === undefined) {
                 window.uiManager.showToast(`Export failed: No data generated for ${filename}.`, 'warning');
                 return false;
            }
            let blob;
            if (content instanceof Blob) {
                blob = content;
                if (blob.size === 0) {
                    window.uiManager.showToast(`Export failed: Empty file generated for ${filename}.`, 'warning');
                    return false;
                }
            } else {
                 const stringContent = String(content);
                 if (stringContent.length === 0) {
                    window.uiManager.showToast(`Export failed: Empty file generated for ${filename}.`, 'warning');
                    return false;
                 }
                 blob = new Blob([stringContent], { type: mimeType });
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                if (document.body.contains(a)) {
                    document.body.removeChild(a);
                }
                window.URL.revokeObjectURL(url);
            }, 150);
            return true;
        } catch (error) {
            window.uiManager.showToast(`Error downloading file '${filename}'.`, 'danger');
            return false;
        }
    }

    async function convertSvgToPngBlob(svgElement, targetWidth = 800) {
        if (typeof html2canvas === 'undefined') {
            return Promise.reject(new Error("html2canvas library not loaded."));
        }
        return new Promise((resolve, reject) => {
            if (!svgElement || typeof svgElement.cloneNode !== 'function') {
                return reject(new Error("Invalid SVG element for PNG conversion."));
            }
            try {
                const svgClone = svgElement.cloneNode(true);
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svgClone.setAttribute('version', '1.1');
                svgClone.style.backgroundColor = window.APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                const styles = getComputedStyle(svgElement);
                const viewBox = svgElement.viewBox?.baseVal;
                let sourceWidth = parseFloat(svgClone.getAttribute('width')) || parseFloat(styles.width) || svgElement.width?.baseVal?.value || viewBox?.width || targetWidth;
                let sourceHeight = parseFloat(svgClone.getAttribute('height')) || parseFloat(styles.height) || svgElement.height?.baseVal?.value || viewBox?.height || (targetWidth * 0.75);

                if (sourceWidth <= 0 || sourceHeight <= 0) { sourceWidth = viewBox?.width || targetWidth; sourceHeight = viewBox?.height || (targetWidth * 0.75); }
                if (sourceWidth <= 0 || sourceHeight <= 0) { return reject(new Error("SVG dimensions could not be determined.")); }

                const scaleFactor = targetWidth / sourceWidth;
                const targetHeight = sourceHeight * scaleFactor;

                svgClone.setAttribute('width', String(targetWidth));
                svgClone.setAttribute('height', String(targetHeight));

                const elementsToStyle = svgClone.querySelectorAll('*');
                elementsToStyle.forEach(el => {
                    const computed = window.getComputedStyle(el);
                    const styleProps = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'text-anchor', 'dominant-baseline', 'opacity', 'stroke-dasharray'];
                    let styleString = el.getAttribute('style') || '';
                    styleProps.forEach(prop => {
                        if (computed[prop] && computed[prop] !== 'none' && computed[prop] !== '0px' && computed[prop] !== 'auto') {
                            styleString += `${prop}:${computed[prop]}; `;
                        }
                    });
                    if (styleString) el.setAttribute('style', styleString);
                });

                const svgXml = new XMLSerializer().serializeToString(svgClone);
                const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgXml)))}`;

                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { return reject(new Error("Canvas Context not available.")); }
                    ctx.fillStyle = window.APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (blob) { resolve(blob); }
                        else { reject(new Error("Canvas toBlob failed.")); }
                    }, 'image/png');
                };
                img.onerror = () => { reject(new Error("Error loading SVG image for PNG conversion.")); };
                img.src = svgDataUrl;
            } catch (error) {
                reject(new Error(`Error during SVG-to-PNG conversion: ${error.message}`));
            }
        });
    }

     async function convertSvgToSvgBlob(svgElement) {
         return new Promise((resolve, reject) => {
             if (!svgElement || typeof svgElement.cloneNode !== 'function') return reject(new Error("Invalid SVG element for SVG export."));
              try {
                 const svgClone = svgElement.cloneNode(true);
                 svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                 svgClone.setAttribute('version', '1.1');
                 const elementsToStyle = svgClone.querySelectorAll('*');
                 elementsToStyle.forEach(el => {
                    const computed = window.getComputedStyle(el);
                    const styleProps = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'text-anchor', 'dominant-baseline', 'opacity', 'stroke-dasharray'];
                    let styleString = el.getAttribute('style') || '';
                    styleProps.forEach(prop => {
                        if (computed[prop] && computed[prop] !== 'none' && computed[prop] !== '0px' && computed[prop] !== 'auto') {
                            styleString += `${prop}:${computed[prop]}; `;
                        }
                    });
                    if (styleString) el.setAttribute('style', styleString);
                });

                 const svgXml = new XMLSerializer().serializeToString(svgClone);
                 const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
                 resolve(blob);
              } catch(error) {
                 reject(new Error(`Error during SVG-to-SVG Blob conversion: ${error.message}`));
              }
         });
     }
    
    async function convertTableToPngBlob(tableElementId, targetWidth = 800) {
        if (typeof html2canvas === 'undefined') {
            return Promise.reject(new Error("html2canvas library not loaded."));
        }
        return new Promise(async (resolve, reject) => {
            try {
                const tableElement = document.getElementById(tableElementId);
                if (!tableElement) return reject(new Error(`Table element with ID '${tableElementId}' not found.`));

                const canvas = await html2canvas(tableElement, {
                    scale: window.APP_CONFIG.EXPORT_SETTINGS.TABLE_PNG_EXPORT_SCALE,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false
                });
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Canvas toBlob failed for table."));
                }, 'image/png');
            } catch (error) {
                window.uiManager.showToast('Could not render table for export.', 'danger');
                const errorBlob = new Blob([`Error rendering table to PNG: ${error.message}`], { type: 'text/plain' });
                resolve(errorBlob);
            }
        });
    }

    function generateStatistikCSVString(stats, kollektiv, criteria, logic) {
        if (!stats || !stats.descriptive) return null;
        const formatCriteriaFunc = typeof window.studyT2CriteriaManager !== 'undefined' ? window.studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A';
        const appliedT2Label = `${window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME} (${formatCriteriaFunc(criteria, logic, true)})`;
        const csvData = []; 
        const na = window.APP_CONFIG.NA_PLACEHOLDER;
        const fv = (v, d, p = false) => formatNumber(v, d, na, p);
        const fp = (v, d) => formatPercent(v, d, na);
        const fCI = (o, d, isP) => !o || typeof o !== 'object' || o.lower === null || o.upper === null || isNaN(o.lower) || isNaN(o.upper) ? [na, na] : [fv(o.lower, d, true), fv(o.upper, d, true)];

        try {
            csvData.push(['Parameter', 'Wert']); 
            csvData.push(['Kollektiv', getCohortDisplayName(kollektiv)]); 
            csvData.push(['Angewandte T2 Logik', logic]); 
            csvData.push(['Angewandte T2 Kriterien', formatCriteriaFunc(criteria, logic)]); 
            csvData.push(['Anzahl Patienten', stats.descriptive.patientCount]); 
            csvData.push([]);
            csvData.push(['Metrik (Deskriptiv)', 'Wert (Median)', 'Mean', 'SD', 'Min', 'Max']); 
            const d = stats.descriptive;
            csvData.push(['Alter (Jahre)', fv(d.age?.median, 1, true), fv(d.age?.mean, 1, true), fv(d.age?.sd, 1, true), fv(d.age?.min, 0, true), fv(d.age?.max, 0, true)]);
            csvData.push(['Geschlecht Männlich (n)', `${d.sex?.m ?? 0}`]);
            csvData.push(['Geschlecht Männlich (%)', `${fp(d.patientCount > 0 ? (d.sex?.m ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['Geschlecht Weiblich (n)', `${d.sex?.f ?? 0}`]);
            csvData.push(['Geschlecht Weiblich (%)', `${fp(d.patientCount > 0 ? (d.sex?.f ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['Therapie direkt OP (n)', `${d.therapy?.surgeryAlone ?? 0}`]);
            csvData.push(['Therapie direkt OP (%)', `${fp(d.patientCount > 0 ? (d.therapy?.surgeryAlone ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['Therapie nRCT (n)', `${d.therapy?.neoadjuvantTherapy ?? 0}`]);
            csvData.push(['Therapie nRCT (%)', `${fp(d.patientCount > 0 ? (d.therapy?.neoadjuvantTherapy ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['N Status (+)', `${d.nStatus?.plus ?? 0}`]);
            csvData.push(['N Status (+ / %)', `${fp(d.patientCount > 0 ? (d.nStatus?.plus ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['AS Status (+)', `${d.asStatus?.plus ?? 0}`]);
            csvData.push(['AS Status (+ / %)', `${fp(d.patientCount > 0 ? (d.asStatus?.plus ?? 0) / d.patientCount : NaN, 1)}`]);
            csvData.push(['T2 Status (+)', `${d.t2Status?.plus ?? 0}`]);
            csvData.push(['T2 Status (+ / %)', `${fp(d.patientCount > 0 ? (d.t2Status?.plus ?? 0) / d.patientCount : NaN, 1)}`]);
            const fLKRow = (lk) => [fv(lk?.median, 1, true), fv(lk?.mean, 1, true), fv(lk?.sd, 1, true), fv(lk?.min, 0, true), fv(lk?.max, 0, true)];
            csvData.push(['LK N gesamt (Median)', ...fLKRow(d.lnCounts?.n?.total)]); 
            csvData.push(['LK N+ (Median, nur N+ Pat.)', ...fLKRow(d.lnCounts?.n?.plus)]); 
            csvData.push(['LK AS gesamt (Median)', ...fLKRow(d.lnCounts?.as?.total)]); 
            csvData.push(['LK AS+ (Median, nur AS+ Pat.)', ...fLKRow(d.lnCounts?.as?.plus)]); 
            csvData.push(['LK T2 gesamt (Median)', ...fLKRow(d.lnCounts?.t2?.total)]); 
            csvData.push(['LK T2+ (Median, nur T2+ Pat.)', ...fLKRow(d.lnCounts?.t2?.plus)]); 
            csvData.push([]);
            csvData.push(['Metrik (Diagnostik)', 'Methode', 'Wert', '95% CI Lower', '95% CI Upper', 'SE (Bootstrap)', 'CI Methode']); 
            const addPerfRow = (metricKey, metricName, objAS, objT2) => { const isRate = !(metricKey === 'auc' || metricKey === 'f1' || metricKey === 'youden'); const digits = metricKey === 'auc' || metricKey === 'youden' || metricKey === 'f1' ? 3 : 1; const ciAS = fCI(objAS?.ci, digits, isRate); const ciT2 = fCI(objT2?.ci, digits, isRate); const valAS = fv(objAS?.value, digits, true); const valT2 = fv(objT2?.value, digits, true); csvData.push([metricName, 'AS', valAS, ciAS[0], ciAS[1], fv(objAS?.se, 4, true), objAS?.method || na]); csvData.push([metricName, appliedT2Label, valT2, ciT2[0], ciT2[1], fv(objT2?.se, 4, true), objT2?.method || na]); }; 
            const gAS = stats.performanceAS; 
            const gT2 = stats.performanceT2Applied; 
            addPerfRow('sens', 'Sensitivität', gAS?.sens, gT2?.sens); 
            addPerfRow('spec', 'Spezifität', gAS?.spec, gT2?.spec); 
            addPerfRow('ppv', 'PPV', gAS?.ppv, gT2?.ppv); 
            addPerfRow('npv', 'NPV', gAS?.npv, gT2?.npv); 
            addPerfRow('acc', 'Accuracy', gAS?.acc, gT2?.acc); 
            addPerfRow('auc', 'AUC', gAS?.auc, gT2?.auc); 
            addPerfRow('f1', 'F1-Score', gAS?.f1, gT2?.f1); 
            addPerfRow('youden', 'Youden-Index', gAS?.youden, gT2?.youden); 
            csvData.push([]);
            csvData.push([`Vergleichstest (AS vs. ${appliedT2Label})`, 'Test Statistik', 'p-Wert', 'Methode']); 
            const v = stats.comparisonASvsT2Applied; 
            csvData.push(['Accuracy (McNemar)', fv(v?.mcnemar?.statistic, 3, true), getPValueText(v?.mcnemar?.pValue, false), v?.mcnemar?.method || na]); 
            csvData.push(['AUC (DeLong)', fv(v?.delong?.Z, 3, true), getPValueText(v?.delong?.pValue, false), v?.delong?.method || na]); 
            csvData.push([]);
            csvData.push(['Assoziation mit N-Status', 'Merkmal Key', 'Merkmal Name', 'OR', 'OR CI Lower', 'OR CI Upper', 'RD', 'RD CI Lower', 'RD CI Upper', 'Phi', 'Test Statistik', 'p-Wert', 'Test Methode']); 
            const addAssocRow = (key, name, obj) => { if (!obj) return; const orCI = fCI(obj.or?.ci, 2, false); const rdCI = fCI(obj.rd?.ci, 3, false); csvData.push([ key, name, fv(obj.or?.value, 2, true), orCI[0], orCI[1], fv(obj.rd?.value, 3, true), rdCI[0], rdCI[1], fv(obj.phi?.value, 2, true), fv(obj.statistic ?? NaN, 2, true), getPValueText(obj.pValue, false), obj.testName || na ]); }; 
            const a = stats.associationsApplied; 
            addAssocRow('as', 'AS Positiv', a?.as); 
            if(a?.size_mwu) { csvData.push(['size_mwu', a.size_mwu.featureName || 'LK Größe MWU', na, na, na, na, na, na, na, fv(a.size_mwu.Z, 2, true), getPValueText(a.size_mwu.pValue, false), a.size_mwu.testName || na ]); } 
            ['size', 'shape', 'border', 'homogeneity', 'signal'].forEach(fKey => { if(a && a[fKey]) { addAssocRow(fKey, a[fKey].featureName || `T2 ${fKey}`, a[fKey]); } });
            
            return Papa.unparse(csvData, { delimiter: window.APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" });
        } catch (error) {
             return null;
        }
    }

    function generateBruteForceTXTString(resultsData) {
        if (!resultsData || !resultsData.results || resultsData.results.length === 0) return "No Brute-Force results available.";
        try {
            const formatCriteriaFunc = typeof window.studyT2CriteriaManager !== 'undefined' ? window.studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatting Error';
            const { results, metric, duration, totalTested, cohort, nTotal, nPlus, nMinus } = resultsData;
            const cohortName = getCohortDisplayName(cohort);
            const bestResult = results[0];
            const na = window.APP_CONFIG.NA_PLACEHOLDER;
            
            let report = `Brute-Force Optimization Report\r\n==================================================\r\n`;
            report += `Date of Analysis: ${new Date().toLocaleString('en-US')}\r\n`;
            report += `Analyzed Cohort: ${cohortName}\r\n`;
            report += `   - Total Patients: ${formatNumber(nTotal, 0, na)}\r\n`;
            report += `   - N+ Patients: ${formatNumber(nPlus, 0, na)}\r\n`;
            report += `   - N- Patients: ${formatNumber(nMinus, 0, na)}\r\n`;
            report += `Optimized Target Metric: ${metric}\r\n`;
            report += `Total Duration: ${formatNumber((duration || 0) / 1000, 1, na, true)} seconds\r\n`;
            report += `Combinations Tested: ${formatNumber(totalTested, 0, na, true)}\r\n`;
            report += `==================================================\r\n\r\n`;

            if (bestResult) {
                report += `--- Best Result ---\r\n`;
                report += `Logic: ${bestResult.logic.toUpperCase()}\r\n`;
                report += `Criteria: ${formatCriteriaFunc(bestResult.criteria, bestResult.logic)}\r\n`;
                report += `Achieved ${metric}: ${formatNumber(bestResult.metricValue, 4, na, true)}\r\n\r\n`;
            }

            report += `--- Top 10 Results (including identical values) ---\r\n`;
            report += `Rank | ${metric.padEnd(12)} | Logic | Criteria\r\n`;
            report += `-----|--------------|-------|------------------------------------------\r\n`;

            let rank = 1, displayedCount = 0, lastMetricValue = -Infinity; const precision = 8;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue;
                const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision));
                const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision));
                let currentRank = rank;
                const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > 1e-8;
                if (i > 0 && isNewRank) { rank = displayedCount + 1; currentRank = rank; }
                else if (i > 0) { currentRank = rank; }
                if (rank > 10 && isNewRank) break;
                report += `${String(currentRank).padEnd(4)} | ${formatNumber(result.metricValue, 4, na, true).padEnd(12)} | ${result.logic.toUpperCase().padEnd(5)} | ${formatCriteriaFunc(result.criteria, result.logic)}\r\n`;
                if (isNewRank || i === 0) { lastMetricValue = result.metricValue; }
                displayedCount++;
            }
            report += `==================================================\r\n`;
            return report;
        } catch (error) {
             return null;
        }
    }

    function generateMarkdownTableString(dataOrStats, tableType, kollektiv, criteria = null, logic = null, options = {}) {
        try {
            let headers = [], rows = [], title = ''; 
            const kollektivDisplayName = getCohortDisplayName(kollektiv); 
            const escMD = (text) => escapeHTML(String(text ?? '')); 
            const na = window.APP_CONFIG.NA_PLACEHOLDER;
            const formatCriteriaFunc = typeof window.studyT2CriteriaManager !== 'undefined' ? window.studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A'; 
            const t2CriteriaLabelShort = options.t2CriteriaLabelShort || 'T2';

            if (tableType.startsWith('publication_')) {
                let sectionTitle = 'Publication Content';
                if(options.subSectionLabel) sectionTitle = options.subSectionLabel;
                else if (tableType === 'publication_abstract') sectionTitle = 'Abstract';
                else if (tableType === 'publication_introduction') sectionTitle = 'Introduction';
                else if (tableType === 'publication_discussion') sectionTitle = 'Discussion';
                else if (tableType === 'publication_references') sectionTitle = 'References';
                return `# ${sectionTitle}\n\n${dataOrStats}`;
            }
            
            if (tableType === 'daten') { title = 'Data List'; headers = ['ID', 'Last Name', 'First Name', 'Sex', 'Age', 'Therapy', 'N', 'AS', 'T2', 'Notes']; if(!Array.isArray(dataOrStats)) return `# ${title}...\n\nError: Invalid data.`; rows = dataOrStats.map(p => [p.id, p.lastName || '', p.firstName || '', p.sex || '', p.age ?? '', getCohortDisplayName(p.therapy), p.nStatus ?? na, p.asStatus ?? na, p.t2Status ?? na, p.notes || ''].map(escMD)); }
            else if (tableType === 'auswertung') { title = 'Analysis Table'; headers = ['ID', 'Name', 'Therapy', 'N', 'AS', 'T2', 'N+/N total', 'AS+/AS total', 'T2+/T2 total']; if(!Array.isArray(dataOrStats)) return `# ${title}...\n\nError: Invalid data.`; rows = dataOrStats.map(p => [p.id, p.lastName || '', getCohortDisplayName(p.therapy), p.nStatus ?? na, p.asStatus ?? na, p.t2Status ?? na, `${formatNumber(p.countPathologyNodesPositive, 0, na)} / ${formatNumber(p.countPathologyNodes, 0, na)}`, `${formatNumber(p.countASNodesPositive, 0, na)} / ${formatNumber(p.countASNodes, 0, na)}`, `${formatNumber(p.countT2NodesPositive, 0, na)} / ${formatNumber(p.countT2Nodes, 0, na)}`].map(escMD)); }
            else if (tableType === 'deskriptiv') { title = 'Descriptive Statistics'; const stats = dataOrStats; if (!stats || !stats.patientCount) return `# ${title} (Cohort: ${kollektivDisplayName})\n\nNo data available.`; const total = stats.patientCount; headers = ['Metric', 'Value']; const fLKRowMD = (lk) => `${formatNumber(lk?.median, 1, na)} (${formatNumber(lk?.min, 0, na)}-${formatNumber(lk?.max, 0, na)}) \\[Mean: ${formatNumber(lk?.mean, 1, na)} ± ${formatNumber(lk?.sd, 1, na)}\\]`; rows = [ ['Number of Patients', total], ['Median Age (Min-Max) \\[Mean ± SD\\]', `${formatNumber(stats.age?.median, 1, na)} (${formatNumber(stats.age?.min, 0, na)} - ${formatNumber(stats.age?.max, 0, na)}) \\[${formatNumber(stats.age?.mean, 1, na)} ± ${formatNumber(stats.age?.sd, 1, na)}\\]`], ['Sex (m/f) (n / %)', `${stats.sex?.m ?? 0} / ${stats.sex?.f ?? 0} (${formatPercent((stats.sex?.m ?? 0) / total, 1)} / ${formatPercent((stats.sex?.f ?? 0) / total, 1)})`], ['Therapy (Upfront Surgery / nRCT) (n / %)', `${stats.therapy?.surgeryAlone ?? 0} / ${stats.therapy?.neoadjuvantTherapy ?? 0} (${formatPercent((stats.therapy?.surgeryAlone ?? 0) / total, 1)} / ${formatPercent((stats.therapy?.neoadjuvantTherapy ?? 0) / total, 1)})`], ['N Status (+ / -) (n / %)', `${stats.nStatus?.plus ?? 0} / ${stats.nStatus?.minus ?? 0} (${formatPercent((stats.nStatus?.plus ?? 0) / total, 1)} / ${formatPercent((stats.nStatus?.minus ?? 0) / total, 1)})`], ['AS Status (+ / -) (n / %)', `${stats.asStatus?.plus ?? 0} / ${stats.asStatus?.minus ?? 0} (${formatPercent((stats.asStatus?.plus ?? 0) / total, 1)} / ${formatPercent((stats.asStatus?.minus ?? 0) / total, 1)})`], ['T2 Status (+ / -) (n / %)', `${stats.t2Status?.plus ?? 0} / ${stats.t2Status?.minus ?? 0} (${formatPercent((stats.t2Status?.plus ?? 0) / total, 1)} / ${formatPercent((stats.t2Status?.minus ?? 0) / total, 1)})`], ['Median LN N total (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lnCounts?.n?.total)], ['Median LN N+ (Min-Max) \\[Mean ± SD\\] (only N+ Pat.)', fLKRowMD(stats.lnCounts?.n?.plus)], ['Median LN AS total (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lnCounts?.as?.total)], ['Median LN AS+ (Min-Max) \\[Mean ± SD\\] (only AS+ Pat.)', fLKRowMD(stats.lnCounts?.as?.plus)], ['Median LN T2 total (Min-Max) \\[Mean ± SD\\]', fLKRowMD(stats.lnCounts?.t2?.total)], ['Median LN T2+ (Min-Max) \\[Mean ± SD\\] (only T2+ Pat.)', fLKRowMD(stats.lnCounts?.t2?.plus)] ].map(r => r.map(escMD)); }
            else if (tableType === 'comp_as_perf') { title = `Diagnostic Performance (AS) for Cohorts`; const { statsGesamt, statsSurgeryAlone, statsNeoadjuvantTherapy } = dataOrStats || {}; if (!statsGesamt && !statsSurgeryAlone && !statsNeoadjuvantTherapy) return `# ${title}\n\nError: Invalid data.`; headers = ['Cohort', 'Sens. (95% CI)', 'Spec. (95% CI)', 'PPV (95% CI)', 'NPV (95% CI)', 'Acc. (95% CI)', 'AUC (95% CI)']; const fRow = (s, k) => { const d = getCohortDisplayName(k); if (!s || typeof s.matrix !== 'object') return [d + ' (N=?)', na, na, na, na, na, na].map(escMD); const n = s.matrix ? (s.matrix.tp + s.matrix.fp + s.matrix.fn + s.matrix.tn) : 0; const fCI_p = (m, ky) => { const dig = (ky === 'auc') ? 3 : ((ky === 'f1' || ky === 'balAcc') ? 3 : 1); const isP = !(ky === 'f1' || ky === 'auc' || ky === 'balAcc'); return formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, dig, isP, na); }; return [`${d} (N=${n})`, fCI_p(s.sens, 'sens'), fCI_p(s.spec, 'spec'), fCI_p(s.ppv, 'ppv'), fCI_p(s.npv, 'npv'), fCI_p(s.acc, 'acc'), fCI_p(s.auc, 'auc')].map(escMD); }; rows = [ fRow(statsGesamt?.performanceAS, 'Overall'), fRow(statsSurgeryAlone?.performanceAS, 'surgeryAlone'), fRow(statsNeoadjuvantTherapy?.performanceAS, 'neoadjuvantTherapy') ]; }
            else if (tableType === 'comp_as_vs_t2_perf' || tableType === 'comp_as_vs_t2_comp') { const { performanceAS, performanceT2 } = dataOrStats || {}; title = `Comparison Diagnostic Performance (AS vs. ${escMD(t2CriteriaLabelShort)})`; if (!performanceAS || !performanceT2) return `# ${title} (Cohort: ${kollektivDisplayName})\n\nError: Invalid data for comparison.`; headers = ['Metric', 'AS (Value, 95% CI)', `${escMD(t2CriteriaLabelShort)} (Value, 95% CI)`]; const fRow = (mKey, nm, isP = true, d = 1) => { const mAS = performanceAS[mKey]; const mT2 = performanceT2[mKey]; const dig = (mKey === 'auc' || mKey === 'f1' || mKey === 'balAcc') ? 3 : d; const vAS = formatCI(mAS?.value, mAS?.ci?.lower, mAS?.ci?.upper, dig, isP, na); const vT2 = formatCI(mT2?.value, mT2?.ci?.lower, mT2?.ci?.upper, dig, isP, na); return [nm, vAS, vT2]; }; rows = [ fRow('sens', 'Sensitivity'), fRow('spec', 'Specificity'), fRow('ppv', 'PPV'), fRow('npv', 'NPV'), fRow('acc', 'Accuracy'), fRow('auc', 'AUC', false, 3), fRow('f1', 'F1-Score', false, 3) ].map(r => r.map(escMD)); }
            else if (tableType === 'comp_as_vs_t2_tests') { const { comparison } = dataOrStats || {}; title = `Statistical Comparison (AS vs. ${escMD(t2CriteriaLabelShort)})`; if (!comparison) return `# ${title} (Cohort: ${kollektivDisplayName})\n\nError: Invalid data for comparison tests.`; headers = ['Test', 'Statistic Value', 'p-Value', 'Method']; rows = [ ['McNemar (Accuracy)', `${formatNumber(comparison?.mcnemar?.statistic, 3, na)} (df=${comparison?.mcnemar?.df || na})`, `${getPValueText(comparison?.mcnemar?.pValue, true)} ${getStatisticalSignificanceSymbol(comparison?.mcnemar?.pValue)}`, `${comparison?.mcnemar?.method || na}`], ['DeLong (AUC)', `Z=${formatNumber(comparison?.delong?.Z, 3, na)}`, `${getPValueText(comparison?.delong?.pValue, true)} ${getStatisticalSignificanceSymbol(comparison?.delong?.pValue)}`, `${comparison?.delong?.method || na}`] ].map(r => r.map(escMD)); }
            else { return `# Unknown table type for Markdown: ${tableType}`; }
            const headerLine = `| ${headers.join(' | ')} |`; const separatorLine = `|${headers.map(() => '---').join('|')}|`; const bodyLines = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
            let metaInfo = `# ${title}`; if (!['daten', 'auswertung', 'comp_as_perf'].includes(tableType)) metaInfo += ` (Cohort: ${kollektivDisplayName})`; metaInfo += '\n'; if(criteria && logic && ['auswertung', 'deskriptiv'].includes(tableType)) metaInfo += `\n_T2 Basis (applied): ${escMD(formatCriteriaFunc(criteria, logic))}_\n\n`; else if (options.t2CriteriaLabelFull && ['comp_as_vs_t2_perf', 'comp_as_vs_t2_tests', 'comp_as_vs_t2_comp'].includes(tableType)) metaInfo += `\n_T2 Basis (comparison): ${escMD(options.t2CriteriaLabelFull)}_\n\n`; else metaInfo += '\n';
            return `${metaInfo}${headerLine}\n${separatorLine}\n${bodyLines}`;
        } catch (error) {
            return `# Error generating Markdown table for ${tableType}.`;
        }
   }

   function generateFilteredDataCSVString(data) {
       if (!Array.isArray(data) || data.length === 0) return null;
       try {
           const columns = ["id", "lastName", "firstName", "birthDate", "sex", "age", "therapy", "examDate", "nStatus", "countPathologyNodes", "countPathologyNodesPositive", "asStatus", "countASNodes", "countASNodesPositive", "t2Status", "countT2Nodes", "countT2NodesPositive", "notes"];
           const csvData = data.map(p => { const row = {}; columns.forEach(col => { row[col] = p[col] ?? ''; }); return row; });
           return Papa.unparse(csvData, { header: true, delimiter: window.APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" });
       } catch (error) {
           return null;
       }
   }

    function generateComprehensiveReportHTML(data, allBruteForceResults, kollektiv, criteria, logic) {
        try {
            const statsDataForAllKollektive = window.statisticsService.calculateAllPublicationStats(data, criteria, logic, allBruteForceResults);
            const config = window.APP_CONFIG.REPORT_SETTINGS;
            if (!data || !statsDataForAllKollektive || !criteria || !logic || !config) return '<html><head><title>Error</title></head><body>Error: Necessary data or configuration for report missing.</body></html>';

            const formatCriteriaFunc = typeof window.studyT2CriteriaManager !== 'undefined' ? window.studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'N/A';
            const kollektivName = getCohortDisplayName(kollektiv); const timestamp = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium'}); const criteriaString = formatCriteriaFunc(criteria, logic); 
            const appliedCriteriaDisplayName = `Applied T2 (${formatCriteriaFunc(criteria, logic, true)})`;
            
            const getChartSVG = (element) => { if(!element) return `<p class="text-muted small">[Chart element not found]</p>`; try { const clone = element.cloneNode(true); clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('version', '1.1'); clone.style.backgroundColor = window.APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff'; const vb = clone.getAttribute('viewBox')?.split(' '); let w = clone.getAttribute('width'), h = clone.getAttribute('height'); if (vb && vb.length === 4 && parseFloat(vb[2]) > 0 && parseFloat(vb[3]) > 0) { clone.setAttribute('width', vb[2]); clone.setAttribute('height', vb[3]); } else if (!w || !h || parseFloat(w) <= 0 || parseFloat(h) <= 0) { clone.setAttribute('width', '400'); clone.setAttribute('height', '300'); } const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style"); styleEl.textContent = `svg { font-family: ${getComputedStyle(document.body).fontFamily || 'sans-serif'}; } .axis path, .axis line { fill: none; stroke: #6c757d; shape-rendering: crispEdges; stroke-width: 1px; } .axis text { font-size: 10px; fill: #212529; } .axis-label { font-size: 11px; fill: #212529; text-anchor: middle; } .grid .tick { stroke: #dee2e6; stroke-opacity: 0.6; } .grid path { stroke-width: 0; } .legend { font-size: 10px; fill: #212529; } .bar { opacity: 0.9; } .roc-curve { fill: none; stroke-width: 2px; } .reference-line { stroke: #adb5bd; stroke-width: 1px; stroke-dasharray: 4 2; } .auc-label { font-weight: bold; font-size: 11px; }`; clone.prepend(styleEl); return clone.outerHTML; } catch (e) { return `<p class="text-danger small">[Error embedding chart: ${e.message}]</p>`; } };
            
            const chartSVGs = {};
            document.querySelectorAll('.dashboard-chart-container svg, .comp-chart-container svg, [id*="chart-stat-"] svg').forEach(svgEl => {
                const containerId = svgEl.closest('div[id]')?.id;
                if(containerId) chartSVGs[containerId] = getChartSVG(svgEl);
            });

            const statsDataForCurrentKollektiv = statsDataForAllKollektive[kollektiv];
            const na = window.APP_CONFIG.NA_PLACEHOLDER;
            let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${config.REPORT_TITLE} - ${kollektivName}</title>`; html += `<style> body { font-family: sans-serif; font-size: 10pt; line-height: 1.4; padding: 25px; max-width: 800px; margin: auto; color: #212529; background-color: #fff;} h1, h2, h3 { color: #333; margin-top: 1.2em; margin-bottom: 0.6em; padding-bottom: 0.2em; border-bottom: 1px solid #ccc; page-break-after: avoid; } h1 { font-size: 16pt; border-bottom-width: 2px; } h2 { font-size: 14pt; } h3 { font-size: 12pt; font-weight: bold; border-bottom: none; margin-bottom: 0.4em; } table { border-collapse: collapse; width: 100%; margin-bottom: 1em; font-size: 9pt; page-break-inside: avoid; } th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: top; word-wrap: break-word; } th { background-color: #f2f2f2; font-weight: bold; } .chart-container { text-align: center; margin: 1em 0; page-break-inside: avoid; background-color: #fff; padding: 10px; border: 1px solid #eee; max-width: 100%; overflow: hidden; } .chart-container svg { max-width: 100%; height: auto; display: block; margin: auto; } .meta-info { background-color: #f9f9f9; border: 1px solid #eee; padding: 10px 15px; margin-bottom: 1.5em; font-size: 9pt; } .meta-info ul { list-style: none; padding: 0; margin: 0; } .meta-info li { margin-bottom: 0.3em; } .small { font-size: 8pt; } .text-muted { color: #6c757d; } ul { padding-left: 20px; margin-top: 0.5em;} li { margin-bottom: 0.2em; } .report-footer { margin-top: 2em; padding-top: 1em; border-top: 1px solid #ccc; font-size: 8pt; color: #888; text-align: center; } .no-print { display: none; } @media print { body { padding: 10px; } .meta-info { background-color: #fff; border: none; padding: 0 0 1em 0;} } </style></head><body>`;
            html += `<h1>${config.REPORT_TITLE}</h1>`; if (config.INCLUDE_APP_VERSION) html += `<p class="text-muted small">Generated with: ${window.APP_CONFIG.APP_NAME} v${window.APP_CONFIG.APP_VERSION}</p>`; if (config.INCLUDE_GENERATION_TIMESTAMP) html += `<p class="text-muted small">Generated on: ${timestamp}</p>`;
            html += `<div class="meta-info"><h3>Analysis Configuration</h3><ul>`; if (config.INCLUDE_KOLLEKTIV_INFO) html += `<li><strong>Analyzed Cohort:</strong> ${kollektivName} (N=${statsDataForCurrentKollektiv?.descriptive?.patientCount || 0})</li>`; if (config.INCLUDE_T2_CRITERIA) html += `<li><strong>Applied T2-Criteria:</strong> Logic: ${logic}, Criteria: ${criteriaString}</li>`; html += `</ul></div>`;
            if (config.INCLUDE_DESCRIPTIVES_TABLE && statsDataForCurrentKollektiv?.descriptive) { html += `<h2>Descriptive Statistics</h2><table><thead><tr><th>Metric</th><th>Value (Median)</th><th>Mean</th><th>SD</th><th>Min</th><th>Max</th></tr></thead><tbody>`; const d = statsDataForCurrentKollektiv.descriptive; const fv = (v, dig = 1, useStd = false) => formatNumber(v, dig, na, useStd); const fP = (v, dig = 1) => formatPercent(v, dig, na); const addRowHTML = (l, vl=na, m=na, s=na, mn=na, mx=na) => `<tr><td>${l}</td><td>${vl}</td><td>${m}</td><td>${s}</td><td>${mn}</td><td>${mx}</td></tr>`; html += addRowHTML('Age (Years)', fv(d.age?.median, 1), fv(d.age?.mean, 1), fv(d.age?.sd, 1), fv(d.age?.min, 0), fv(d.age?.max, 0)); html += addRowHTML('Sex Male (n / %)', `${d.sex?.m ?? 0} / ${fP(d.patientCount > 0 ? (d.sex?.m ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('Sex Female (n / %)', `${d.sex?.f ?? 0} / ${fP(d.patientCount > 0 ? (d.sex?.f ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('Therapy Upfront Surgery (n / %)', `${d.therapy?.surgeryAlone ?? 0} / ${fP(d.patientCount > 0 ? (d.therapy?.surgeryAlone ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('Therapy nRCT (n / %)', `${d.therapy?.neoadjuvantTherapy ?? 0} / ${fP(d.patientCount > 0 ? (d.therapy?.neoadjuvantTherapy ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('N Status (+ / %)', `${d.nStatus?.plus ?? 0} / ${fP(d.patientCount > 0 ? (d.nStatus?.plus ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('AS Status (+ / %)', `${d.asStatus?.plus ?? 0} / ${fP(d.patientCount > 0 ? (d.asStatus?.plus ?? 0) / d.patientCount : NaN, 1)}`); html += addRowHTML('T2 Status (+ / %)', `${d.t2Status?.plus ?? 0} / ${fP(d.patientCount > 0 ? (d.t2Status?.plus ?? 0) / d.patientCount : NaN, 1)}`); const fLK = (lk) => `${fv(lk?.median,1)} (${fv(lk?.min,0)}-${fv(lk?.max,0)})`; html += addRowHTML('LN N total (Median (Min-Max))', fLK(d.lnCounts?.n?.total), fv(d.lnCounts?.n?.total?.mean,1), fv(d.lnCounts?.n?.total?.sd,1),fv(d.lnCounts?.n?.total?.min,0), fv(d.lnCounts?.n?.total?.max,0)); html += addRowHTML('LN N+ (Median (Min-Max), only N+ Pat.)', fLK(d.lnCounts?.n?.plus), fv(d.lnCounts?.n?.plus?.mean,1), fv(d.lnCounts?.n?.plus?.sd,1),fv(d.lnCounts?.n?.plus?.min,0), fv(d.lnCounts?.n?.plus?.max,0)); html += addRowHTML('LN AS total (Median (Min-Max))', fLK(d.lnCounts?.as?.total), fv(d.lnCounts?.as?.total?.mean,1), fv(d.lnCounts?.as?.total?.sd,1),fv(d.lnCounts?.as?.total?.min,0), fv(d.lnCounts?.as?.total?.max,0)); html += addRowHTML('LN AS+ (Median (Min-Max), only AS+ Pat.)', fLK(d.lnCounts?.as?.plus), fv(d.lnCounts?.as?.plus?.mean,1), fv(d.lnCounts?.as?.plus?.sd,1),fv(d.lnCounts?.as?.plus?.min,0), fv(d.lnCounts?.as?.plus?.max,0)); html += addRowHTML('LN T2 total (Median (Min-Max))', fLK(d.lnCounts?.t2?.total), fv(d.lnCounts?.t2?.total?.mean,1), fv(d.lnCounts?.t2?.total?.sd,1),fv(d.lnCounts?.t2?.total?.min,0), fv(d.lnCounts?.t2?.total?.max,0)); html += addRowHTML('LN T2+ (Median (Min-Max), only T2+ Pat.)', fLK(d.lnCounts?.t2?.plus), fv(d.lnCounts?.t2?.plus?.mean,1), fv(d.lnCounts?.t2?.plus?.sd,1),fv(d.lnCounts?.t2?.plus?.min,0), fv(d.lnCounts?.t2?.plus?.max,0)); html += `</tbody></table>`; }
            if (config.INCLUDE_DESCRIPTIVES_CHARTS) { html += `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 1em; justify-content: space-around;">`; if (chartSVGs['chart-dash-age']) html += `<div class="chart-container" style="flex: 1 1 45%; min-width: 300px;"><h3>Age Distribution</h3>${chartSVGs['chart-dash-age']}</div>`; if (chartSVGs['chart-dash-gender']) html += `<div class="chart-container" style="flex: 1 1 45%; min-width: 300px;"><h3>Sex Distribution</h3>${chartSVGs['chart-dash-gender']}</div>`; html += `</div>`; }
            const addPerfSectionHTML = (title, statsObj) => { if (!statsObj) return ''; let sHtml = `<h2>${title}</h2><table><thead><tr><th>Metric</th><th>Value (95% CI)</th><th>CI Method</th></tr></thead><tbody>`; const fCI_local = (m, d=1, p=true) => formatCI(m?.value, m?.ci?.lower, m?.ci?.upper, d, p, na); sHtml += `<tr><td>Sensitivity</td><td>${fCI_local(statsObj.sens)}</td><td>${statsObj.sens?.method || na}</td></tr>`; sHtml += `<tr><td>Specificity</td><td>${fCI_local(statsObj.spec)}</td><td>${statsObj.spec?.method || na}</td></tr>`; sHtml += `<tr><td>PPV</td><td>${fCI_local(statsObj.ppv)}</td><td>${statsObj.ppv?.method || na}</td></tr>`; sHtml += `<tr><td>NPV</td><td>${fCI_local(statsObj.npv)}</td><td>${statsObj.npv?.method || na}</td></tr>`; sHtml += `<tr><td>Accuracy</td><td>${fCI_local(statsObj.acc)}</td><td>${statsObj.acc?.method || na}</td></tr>`; sHtml += `<tr><td>AUC</td><td>${fCI_local(statsObj.auc, 3, false)}</td><td>${statsObj.auc?.method || na}</td></tr>`; sHtml += `<tr><td>F1-Score</td><td>${fCI_local(statsObj.f1, 3, false)}</td><td>${statsObj.f1?.method || na}</td></tr>`; sHtml += `</tbody></table>`; return sHtml; };
            if (config.INCLUDE_AS_PERFORMANCE_TABLE && statsDataForCurrentKollektiv?.performanceAS) { html += addPerfSectionHTML('Diagnostic Performance: Avocado Sign (vs. N)', statsDataForCurrentKollektiv.performanceAS); }
            if (config.INCLUDE_T2_PERFORMANCE_TABLE && statsDataForCurrentKollektiv?.performanceT2Applied) { html += addPerfSectionHTML(`Diagnostic Performance: T2 (${appliedCriteriaDisplayName} vs. N)`, statsDataForCurrentKollektiv.performanceT2Applied); }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_TABLE && statsDataForCurrentKollektiv?.comparisonASvsT2Applied) { html += `<h2>Statistical Comparison: AS vs. T2 (${appliedCriteriaDisplayName})</h2><table><thead><tr><th>Test</th><th>Statistic</th><th>p-Value</th><th>Method</th></tr></thead><tbody>`; const v = statsDataForCurrentKollektiv.comparisonASvsT2Applied; html += `<tr><td>Accuracy (McNemar)</td><td>${formatNumber(v?.mcnemar?.statistic, 3, na, true)} (df=${v?.mcnemar?.df || na})</td><td>${getPValueText(v?.mcnemar?.pValue, false)} ${getStatisticalSignificanceSymbol(v?.mcnemar?.pValue)}</td><td>${v?.mcnemar?.method || na}</td></tr>`; html += `<tr><td>AUC (DeLong)</td><td>Z=${formatNumber(v?.delong?.Z, 3, na, true)}</td><td>${getPValueText(v?.delong?.pValue, false)} ${getStatisticalSignificanceSymbol(v?.delong?.pValue)}</td><td>${v?.delong?.method || na}</td></tr>`; html += `</tbody></table>`; }
            if (config.INCLUDE_AS_VS_T2_COMPARISON_CHART) { const chartKey = Object.keys(chartSVGs).find(k => k.startsWith('comp-chart')); if(chartSVGs[chartKey]) { html += `<div class="chart-container"><h3>Comparison of Selected Metrics (AS vs T2 - ${appliedCriteriaDisplayName})</h3>${chartSVGs[chartKey]}</div>`; } }
            if (config.INCLUDE_ASSOCIATIONS_TABLE && statsDataForCurrentKollektiv?.associationsApplied && Object.keys(statsDataForCurrentKollektiv.associationsApplied).length > 0) { html += `<h2>Association with N-Status</h2><table><thead><tr><th>Feature</th><th>OR (95% CI)</th><th>RD (%) (95% CI)</th><th>Phi</th><th>p-Value</th><th>Test</th></tr></thead><tbody>`; const a = statsDataForCurrentKollektiv.associationsApplied; const fRowAssoc = (nm, obj) => { if (!obj) return ''; const orS = formatCI(obj.or?.value, obj.or?.ci?.lower, obj.or?.ci?.upper, 2, false, na); const rdV = formatNumber(obj.rd?.value !== null && !isNaN(obj.rd?.value) ? obj.rd.value * 100 : 1, na, true); const rdL = formatNumber(obj.rd?.ci?.lower !== null && !isNaN(obj.rd?.ci?.lower) ? obj.rd.ci.lower * 100 : 1, na, true); const rdU = formatNumber(obj.rd?.ci?.upper !== null && !isNaN(obj.rd?.ci?.upper) ? obj.rd.ci.upper * 100 : 1, na, true); const rdS = rdV !== na ? `${rdV}% (${rdL}% - ${rdU}%)` : na; const phiS = formatNumber(obj.phi?.value, 2, na, true); const pS = getPValueText(obj.pValue, false) + ' ' + getStatisticalSignificanceSymbol(obj.pValue); const tN = obj.testName || na; return `<tr><td>${nm}</td><td>${orS}</td><td>${rdS}</td><td>${phiS}</td><td>${pS}</td><td>${tN}</td></tr>`; }; html += fRowAssoc('AS Positive', a?.as); if (a?.size_mwu) html += `<tr><td>${a.size_mwu.featureName || 'LN Size (Median Comp.)'}</td><td>${na}</td><td>${na}</td><td>${na}</td><td>${getPValueText(a.size_mwu.pValue, false)} ${getStatisticalSignificanceSymbol(a.size_mwu.pValue)}</td><td>${a.size_mwu.testName || na}</td></tr>`; ['size', 'shape', 'border', 'homogeneity', 'signal'].forEach(k => { if (a && a[k]) { const isActive = criteria[k]?.active === true; html += fRowAssoc(a[k].featureName + (isActive ? '' : ' (inactive)'), a[k]); } }); html += `</tbody></table>`; }
            const currentKollektivBfResult = allBruteForceResults ? allBruteForceResults[kollektiv] : null;
            if (config.INCLUDE_BRUTEFORCE_BEST_RESULT && currentKollektivBfResult && Object.values(currentKollektivBfResult)[0]?.bestResult) {
                const bestResultForMetric = Object.values(currentKollektivBfResult)[0];
                html += `<h2>Best Brute-Force Result (for Cohort: ${kollektivName})</h2><div class="meta-info"><ul>`; 
                const best = bestResultForMetric.bestResult; 
                html += `<li><strong>Optimized Metric:</strong> ${bestResultForMetric.metric}</li><li><strong>Best Value:</strong> ${formatNumber(best.metricValue, 4, na, true)}</li><li><strong>Logic:</strong> ${best.logic?.toUpperCase()}</li><li><strong>Criteria:</strong> ${formatCriteriaFunc(best.criteria, best.logic)}</li></ul><p class="small text-muted">Cohort N=${formatNumber(bestResultForMetric.nTotal, 0, na)} (N+: ${formatNumber(bestResultForMetric.nPlus, 0, na)}, N-: ${formatNumber(bestResultForMetric.nMinus, 0, na)})</p></div>`; 
            }
            html += `<div class="report-footer">${config.REPORT_AUTHOR} - ${timestamp}</div></body></html>`; return html;
        } catch (error) {
             return `<html><head><title>Error</title></head><body>Error creating report: ${error.message}</body></html>`;
        }
    }

    async function exportSingleChart(chartElementId, format, kollektiv, options = {}) {
         const svgElement = document.getElementById(chartElementId)?.querySelector('svg'); if (!svgElement) { window.uiManager.showToast(`Chart '${chartElementId}' not found for export.`, 'danger'); return; }
         const chartName = options.chartName || chartElementId.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
         try {
             let blob = null, filenameKey, mimeType, ext;
             if (format === 'png') { window.uiManager.showToast(`Generating PNG for Chart ${chartName}...`, 'info', 1500); blob = await convertSvgToPngBlob(svgElement); filenameKey = 'CHART_SINGLE_PNG'; mimeType = 'image/png'; ext = 'png'; }
             else if (format === 'svg') { window.uiManager.showToast(`Generating SVG for Chart ${chartName}...`, 'info', 1500); blob = await convertSvgToSvgBlob(svgElement); filenameKey = 'CHART_SINGLE_SVG'; mimeType = 'image/svg+xml;charset=utf-8'; ext = 'svg'; }
             else { throw new Error(`Invalid export format: ${format}`); }
             if (blob) {
                const filename = generateFilename(filenameKey, kollektiv, ext, { chartName, ...options });
                if (downloadFile(blob, filename, mimeType)) window.uiManager.showToast(`Chart ${chartName} exported as ${format.toUpperCase()}.`, 'success');
             } else {
                 throw new Error("Blob generation failed.");
             }
         } catch (error) { window.uiManager.showToast(`Error during chart export (${format.toUpperCase()}).`, 'danger'); }
    }

    async function exportTablePNG(tableElementId, kollektiv, typeKey, tableName = 'Tabelle') {
         window.uiManager.showToast(`Generating PNG for table ${tableName}...`, 'info', 1500);
         try {
             const tableElement = document.getElementById(tableElementId); const baseWidth = tableElement?.offsetWidth || 800;
             const blob = await convertTableToPngBlob(tableElementId, baseWidth);
             if (blob) {
                const filename = generateFilename(typeKey, kollektiv, 'png', {tableName: tableName, tableId: tableElementId});
                if(downloadFile(blob, filename, 'image/png')) window.uiManager.showToast(`Table '${tableName}' exported as PNG.`, 'success');
             } else {
                throw new Error("Table blob generation failed.");
             }
         } catch(error) { window.uiManager.showToast(`Error during table PNG export for '${tableName}'.`, 'danger'); }
     }

    async function exportChartsZip(containerSelector, typeKey, kollektiv, format) {
        if (!window.JSZip) {
            window.uiManager.showToast("JSZip library not loaded. Cannot create ZIP package.", "danger");
            return;
        }
        window.uiManager.showToast(`Generating ${format.toUpperCase()} ZIP package...`, 'info', 2000);
        const zip = new JSZip();
        
        const chartContainers = document.querySelectorAll('.dashboard-chart-container, .comp-chart-container, [id*="chart-stat-"]');
        let filesAdded = 0;

        for (const container of chartContainers) {
            const svgElement = container.querySelector('svg');
            if (!svgElement) continue;
            
            const chartName = container.id.replace(/^chart-/, '').replace(/-container$/, '').replace(/-content$/, '').replace(/-[0-9]+$/, '');
            try {
                let blob;
                if (format === 'png') {
                    blob = await convertSvgToPngBlob(svgElement);
                } else {
                    blob = await convertSvgToSvgBlob(svgElement);
                }
                if (blob) {
                    const filename = generateFilename(`CHART_SINGLE_${format.toUpperCase()}`, kollektiv, format, { chartName });
                    zip.file(filename, blob);
                    filesAdded++;
                }
            } catch (error) {
                window.uiManager.showToast(`Could not export chart '${chartName}'.`, 'warning');
            }
        }

        if (filesAdded > 0) {
            const zipFilename = generateFilename(typeKey, kollektiv, 'zip');
            const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
            if (downloadFile(content, zipFilename, "application/zip")) window.uiManager.showToast(`${filesAdded} chart(s) successfully exported in ZIP package.`, 'success');
        } else {
            window.uiManager.showToast(`No charts found or generated for the ${format.toUpperCase()} ZIP package.`, 'warning');
        }
    }

    async function exportCategoryZip(category, data, bfResults, kollektiv, criteria, logic) {
        if (!window.JSZip) {
            window.uiManager.showToast("JSZip library not loaded. Cannot create ZIP package.", "danger");
            return;
        }
        
        if (category === 'png') {
            await exportChartsZip('#app-container', 'PNG_ZIP', kollektiv, 'png');
            return;
        }
        if (category === 'svg') {
            await exportChartsZip('#app-container', 'SVG_ZIP', kollektiv, 'svg');
            return;
        }

        window.uiManager.showToast(`Generating ${category.toUpperCase()} ZIP package...`, 'info', 2000);
        const zip = new JSZip();
        let filesAdded = 0;
        let statsDataForAllKollektive = null;
        const lang = window.state.getCurrentPublikationLang();

        const needsStats = ['all', 'csv', 'md', 'html', 'radiology-submission'].includes(category.toLowerCase().replace('-zip', ''));
        if (needsStats && data && data.length > 0 && criteria && logic) {
            try {
                statsDataForAllKollektive = window.statisticsService.calculateAllPublicationStats(data, criteria, logic, bfResults);
            } catch (e) {
                window.uiManager.showToast(`Error during statistics calculation for ${category.toUpperCase()} ZIP.`, 'danger');
                return;
            }
            if (!statsDataForAllKollektive || !statsDataForAllKollektive[kollektiv]) {
                if (category === 'csv-zip' || category.toLowerCase() === 'html-zip') {
                    window.uiManager.showToast(`Statistics for cohort '${kollektiv}' could not be calculated for ZIP package.`, 'warning');
                }
            }
        }
        const currentKollektivStats = statsDataForAllKollektive ? statsDataForAllKollektive[kollektiv] : null;

        const addFile = (filename, content) => {
            if (content !== null && content !== undefined && (typeof content === 'string' ? content.length > 0 : content.size > 0)) {
                zip.file(filename, content);
                filesAdded++;
                return true;
            }
            return false;
        };
        try {
            if (['all', 'csv'].includes(category)) {
                if (currentKollektivStats) addFile(generateFilename('STATS_CSV', kollektiv, 'csv'), generateStatistikCSVString(currentKollektivStats, kollektiv, criteria, logic));
                if (data && data.length > 0) addFile(generateFilename('FILTERED_DATA_CSV', kollektiv, 'csv'), generateFilteredDataCSVString(window.dataProcessor.filterDataByCohort(data, kollektiv)));
            }
            if (['all', 'md'].includes(category)) {
                if (currentKollektivStats?.descriptive) addFile(generateFilename('DESCRIPTIVE_MD', kollektiv, 'md'), generateMarkdownTableString(currentKollektivStats.descriptive, 'deskriptiv', kollektiv));
                if (data && data.length > 0) {
                    addFile(generateFilename('DATEN_MD', kollektiv, 'md'), generateMarkdownTableString(window.dataProcessor.filterDataByCohort(data, kollektiv), 'daten', kollektiv));
                    addFile(generateFilename('AUSWERTUNG_MD', kollektiv, 'md'), generateMarkdownTableString(window.t2CriteriaManager.evaluateDataset(window.dataProcessor.filterDataByCohort(data, kollektiv), criteria, logic), 'auswertung', kollektiv, criteria, logic));
                }

                if (window.PUBLICATION_CONFIG && window.state && window.publicationService && window.APP_CONFIG) {
                    const commonDataForPub = { appName: window.APP_CONFIG.APP_NAME, appVersion: window.APP_CONFIG.APP_VERSION, nOverall: data.length, nPositive: data.filter(p => p.nStatus === '+').length, nSurgeryAlone: data.filter(p => p.therapy === 'surgeryAlone').length, nNeoadjuvantTherapy: data.filter(p => p.therapy === 'neoadjuvantTherapy').length, references: window.APP_CONFIG.REFERENCES_FOR_PUBLICATION, bruteForceMetricForPublication: window.state.getPublicationBruteForceMetric(), currentLanguage: lang, rawData: data };
                    window.PUBLICATION_CONFIG.sections.forEach(mainSection => {
                        const sectionContent = window.publicationService.generateSectionHTML(mainSection.id, statsDataForAllKollektive, commonDataForPub);
                        const typeKey = `PUBLICATION_SECTION_MD`;
                        const sectionName = mainSection.labelKey.replace(/_main$/, '').replace(/_/g, '-');
                        addFile(generateFilename(typeKey, kollektiv, 'md', { sectionName: sectionName }), `# ${window.APP_CONFIG.UI_TEXTS.publicationTab.sectionLabels[mainSection.labelKey]}\n\n${sectionContent.replace(/<[^>]*>/g, '')}`);
                    });
                }
            }
            if (['all'].includes(category) && bfResults && bfResults[kollektiv]) {
                Object.keys(bfResults[kollektiv]).forEach(metric => {
                    addFile(generateFilename('BRUTEFORCE_TXT', kollektiv, 'txt', { studyId: metric }), generateBruteForceTXTString(bfResults[kollektiv][metric]));
                });
            }
            if (['all', 'html'].includes(category) && data && data.length > 0) { addFile(generateFilename('COMPREHENSIVE_REPORT_HTML', kollektiv, 'html'), generateComprehensiveReportHTML(data, bfResults, kollektiv, criteria, logic)); }
            if (category === 'radiology-submission') { await exportRadiologySubmissionPackage(data, statsDataForAllKollektive, bfResults); return; }

            if (filesAdded > 0) {
                const zipFilename = generateFilename(`${category.toUpperCase()}_ZIP`, kollektiv, 'zip');
                const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                if (downloadFile(content, zipFilename, "application/zip")) window.uiManager.showToast(`${filesAdded} file(s) successfully exported in ${category.toUpperCase()} ZIP package.`, 'success');
            } else { window.uiManager.showToast(`No files found or generated for the ${category.toUpperCase()} ZIP package.`, 'warning'); }
        } catch (error) { window.uiManager.showToast(`Error creating ${category.toUpperCase()} ZIP package.`, 'danger'); }
    }

    function exportComparisonData(actionId, comparisonData, kollektiv) {
        let content = null, filenameKey = null, extension = null, mimeType = null, options = {}, success = false; 
        const na = window.APP_CONFIG.NA_PLACEHOLDER;
        if (!comparisonData) { window.uiManager.showToast("No data available for comparison export.", "warning"); return; }
        const { performanceAS, performanceT2, comparison, comparisonCriteriaSet, cohortForComparison, t2ShortName } = comparisonData || {};
        const isAsPurView = actionId.includes('-as-pur-');
        
        const appliedCriteria = window.t2CriteriaManager.getAppliedCriteria();
        const appliedLogic = window.t2CriteriaManager.getAppliedLogic();
        const formatCriteriaFunc = window.studyT2CriteriaManager.formatCriteriaForDisplay;

        options.studyId = comparisonCriteriaSet?.id || null;

        if (comparisonCriteriaSet?.id === window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
            options.t2CriteriaLabelShort = `${window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME}`;
            options.t2CriteriaLabelFull = `${window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME} (${formatCriteriaFunc(appliedCriteria, appliedLogic, false)})`;
        } else if (t2ShortName) {
            options.t2CriteriaLabelShort = t2ShortName;
            options.t2CriteriaLabelFull = comparisonCriteriaSet?.studyInfo?.keyCriteriaSummary || formatCriteriaFunc(comparisonCriteriaSet.criteria, comparisonCriteriaSet.logic, false);
        }

        try {
            if (isAsPurView && actionId === 'download-performance-as-pur-csv') {
                 const { statsGesamt, statsSurgeryAlone, statsNeoadjuvantTherapy } = comparisonData || {};
                 const allStatsData = { statsGesamt, statsSurgeryAlone, statsNeoadjuvantTherapy }; 
                 const headers = ['Cohort', 'N', 'Sens', 'Sens CI Low', 'Sens CI High', 'Spec', 'Spec CI Low', 'Spec CI High', 'PPV', 'PPV CI Low', 'PPV CI High', 'NPV', 'NPV CI Low', 'NPV CI High', 'Acc', 'Acc CI Low', 'Acc CI High', 'AUC', 'AUC CI Low', 'AUC CI High', 'F1', 'F1 CI Low', 'F1 CI High', 'CI Method']; 
                 const fVal = (v, d=1, useStd = false) => formatNumber(v, d, na, useStd);
                 const rows = Object.entries(allStatsData).map(([key, stats]) => { let k = key.replace('stats',''); let dN = (k === 'Gesamt') ? 'Overall' : (k === 'SurgeryAlone') ? 'surgeryAlone' : 'neoadjuvantTherapy'; if (!stats || typeof stats.matrix !== 'object') return [getCohortDisplayName(dN), 0, ...Array(21).fill(na), na]; const n = stats.matrix ? (stats.matrix.tp + stats.matrix.fp + stats.matrix.fn + stats.matrix.tn) : 0; const fRowData = (m, metric_k) => { const dig = (metric_k === 'auc' || metric_k === 'f1') ? 3 : 1; return [fVal(m?.value, dig, true), fVal(m?.ci?.lower, dig, true), fVal(m?.ci?.upper, dig, true)]; }; return [ getCohortDisplayName(dN), n, ...fRowData(stats.sens, 'sens'), ...fRowData(stats.spec, 'spec'), ...fRowData(stats.ppv, 'ppv'), ...fRowData(stats.npv, 'npv'), ...fRowData(stats.acc, 'acc'), ...fRowData(stats.auc, 'auc'), ...fRowData(stats.f1, 'f1'), stats.sens?.method || na ]; });
                 content = Papa.unparse([headers, ...rows], { delimiter: window.APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" }); filenameKey = 'COMP_AS_PERF_CSV'; extension = 'csv'; mimeType = 'text/csv;charset=utf-8;';
            } else if (isAsPurView && actionId === 'download-performance-as-pur-md') { options.kollektiv = kollektiv; content = generateMarkdownTableString(comparisonData, 'comp_as_perf', kollektiv, null, null, options); filenameKey = 'COMP_AS_PERF_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
            } else if (actionId === 'download-performance-as-vs-t2-csv') { if (!performanceAS || !performanceT2) { window.uiManager.showToast("Comparison data for CSV missing.", "warning"); return; } const headers = ['Metric', 'AS (Value)', 'AS (95% CI)', 'T2 (Value)', 'T2 (95% CI)', 'CI Method AS', 'CI Method T2']; const fRow = (mKey, nm, isP = true, d = 1) => { const mAS = performanceAS[mKey]; const mT2 = performanceT2[mKey]; const dig = (mKey === 'auc' || mKey === 'f1') ? 3 : d; const ciAS = `(${formatNumber(mAS?.ci?.lower, dig, na, true)} - ${formatNumber(mAS?.ci?.upper, dig, na, true)})`; const ciT2 = `(${formatNumber(mT2?.ci?.lower, dig, na, true)} - ${formatNumber(mT2?.ci?.upper, dig, na, true)})`; const valAS = formatNumber(mAS?.value, dig, na, true); const valT2 = formatNumber(mT2?.value, dig, na, true); return [nm, valAS, ciAS, valT2, ciT2, mAS?.method || na, mT2?.method || na]; }; const rows = [ fRow('sens', 'Sensitivity'), fRow('spec', 'Specificity'), fRow('ppv', 'PPV'), fRow('npv', 'NPV'), fRow('acc', 'Accuracy'), fRow('auc', 'AUC', false, 3), fRow('f1', 'F1-Score', false, 3) ]; content = Papa.unparse([headers, ...rows], { delimiter: window.APP_CONFIG.EXPORT_SETTINGS.CSV_DELIMITER || ";" }); filenameKey = 'COMP_AS_VS_T2_PERF_CSV'; extension = 'csv'; mimeType = 'text/csv;charset=utf-8;';
            } else if (actionId === 'download-comp-table-as-vs-t2-md') { content = generateMarkdownTableString(comparisonData, 'comp_as_vs_t2_comp', kollektiv, null, null, options); filenameKey = 'COMP_AS_VS_T2_COMP_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
            } else if (actionId === 'download-tests-as-vs-t2-md') { content = generateMarkdownTableString(comparisonData, 'comp_as_vs_t2_tests', kollektiv, null, null, options); filenameKey = 'COMP_AS_VS_T2_TESTS_MD'; extension = 'md'; mimeType = 'text/markdown;charset=utf-8;';
            }
        } catch(error) {
            window.uiManager.showToast(`Error during comparison export (${actionId}).`, "danger");
            return;
        }

        if(content !== null && filenameKey && extension && mimeType) { const filename = generateFilename(filenameKey, kollektiv, extension, options); if(downloadFile(content, filename, mimeType)) window.uiManager.showToast(`Comparison data (${extension}) exported: ${filename}`, 'success'); }
        else if(!actionId.includes('-chart-') && !actionId.startsWith('dl-') ) { window.uiManager.showToast("Export for this option is not available or data is missing/error during generation.", "warning"); }
    }
    
    function exportStatistikCSV(stats, kollektiv, criteria, logic) {
        const content = generateStatistikCSVString(stats, kollektiv, criteria, logic);
        if (content) {
            const filename = generateFilename('STATS_CSV', kollektiv, 'csv');
            downloadFile(content, filename, 'text/csv;charset=utf-8;');
        }
    }
    
    function exportBruteForceReport(resultsData) {
        const content = generateBruteForceTXTString(resultsData);
        if (content && resultsData?.cohort) {
            const filename = generateFilename('BRUTEFORCE_TXT', resultsData.cohort, 'txt');
            downloadFile(content, filename, 'text/plain;charset=utf-8;');
        }
    }
    
    function exportTableMarkdown(data, tableType, kollektiv, criteria, logic) {
        const content = generateMarkdownTableString(data, tableType, kollektiv, criteria, logic);
        if (content) {
            const filenameKey = (tableType === 'daten') ? 'DATEN_MD' : 'AUSWERTUNG_MD';
            const filename = generateFilename(filenameKey, kollektiv, 'md');
            downloadFile(content, filename, 'text/markdown;charset=utf-8;');
        }
    }
    
    function exportFilteredDataCSV(data, kollektiv) {
        const content = generateFilteredDataCSVString(data);
        if (content) {
            const filename = generateFilename('FILTERED_DATA_CSV', kollektiv, 'csv');
            downloadFile(content, filename, 'text/csv;charset=utf-8;');
        }
    }
    
    function exportComprehensiveReportHTML(data, bfResults, kollektiv, criteria, logic) {
        const content = generateComprehensiveReportHTML(data, bfResults, kollektiv, criteria, logic);
        if (content) {
            const filename = generateFilename('COMPREHENSIVE_REPORT_HTML', kollektiv, 'html');
            downloadFile(content, filename, 'text/html;charset=utf-8;');
        }
    }

    async function exportRadiologySubmissionPackage(data, allStats, bfResults) {
        if (!window.JSZip || typeof window.htmlToDocx === 'undefined') {
            window.uiManager.showToast("Required export libraries (JSZip, htmlToDocx) are not available.", "danger");
            return;
        }

        window.uiManager.showToast("Generating Radiology Submission Package...", "info", 4000);
        const zip = new JSZip();
        
        const lang = window.state.getCurrentPublikationLang();
        const overallCohortId = window.APP_CONFIG.COHORTS.OVERALL.id;
        
        const commonData = {
            appName: window.APP_CONFIG.APP_NAME, appVersion: window.APP_CONFIG.APP_VERSION,
            nOverall: allStats?.[overallCohortId]?.descriptive?.patientCount || 0,
            nPositive: allStats?.[overallCohortId]?.descriptive?.nStatus?.plus || 0,
            nSurgeryAlone: allStats?.[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id]?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: allStats?.[window.APP_CONFIG.COHORTS.NEOADJUVANT.id]?.descriptive?.patientCount || 0,
            references: window.APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: window.state.getPublicationBruteForceMetric(),
            currentLanguage: lang, rawData: data
        };

        try {
            const fullTitlePageHTML = `<!DOCTYPE html><html><head><style>body{font-family: Arial, sans-serif; font-size: 12pt;}</style></head><body>${window.publicationService.generateSectionHTML('title_main', allStats, commonData)}</body></html>`;
            const mainManuscriptHTML = `<!DOCTYPE html><html><head><style>body{font-family: Arial, sans-serif; font-size: 12pt; line-height: 2;} p { margin-bottom: 1em; text-align: justify; } table { border-collapse: collapse; margin-top: 1em; margin-bottom: 1em;} th, td {border: 1px solid #ccc; padding: 6px;} th { background-color: #f2f2f2; } </style></head><body>${window.publicationService.generateFullPublicationHTML(allStats, commonData)}</body></html>`;
            
            const titlePageBlob = await window.htmlToDocx.asBlob(fullTitlePageHTML, { title: 'Title Page' });
            zip.file("Title_Page.docx", titlePageBlob);
            
            const manuscriptBlob = await window.htmlToDocx.asBlob(mainManuscriptHTML, { title: 'Main Manuscript' });
            zip.file("Main_Manuscript_Anonymized.docx", manuscriptBlob);

            const flowchartContainer = document.getElementById('figure-1-flowchart-container');
            if (flowchartContainer) {
                const svgElement = flowchartContainer.querySelector('svg');
                if(svgElement) {
                    const svgBlob = await convertSvgToSvgBlob(svgElement);
                    zip.file("Figure_1.svg", svgBlob);
                }
            }

            const stardContent = window.stardGenerator.generateStardChecklistData().map(item => `${item.section} - Item ${item.item}: ${item.label}\nLocation: ${item.location}`).join('\n\n');
            zip.file("STARD_Checklist.md", stardContent);
            
            const zipContent = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
            downloadFile(zipContent, "Radiology_Submission_Package.zip", "application/zip");
            window.uiManager.showToast("Radiology Submission Package successfully generated.", "success");

        } catch(error) {
            window.uiManager.showToast("Failed to generate submission package. Check console for details.", "danger");
        }
    }


    return Object.freeze({
        exportStatistikCSV,
        exportBruteForceReport,
        exportTableMarkdown,
        exportFilteredDataCSV,
        exportComprehensiveReportHTML,
        exportSingleChart,
        exportTablePNG,
        exportCategoryZip,
        exportComparisonData,
        exportRadiologySubmissionPackage,
        generateFilename
    });

})();