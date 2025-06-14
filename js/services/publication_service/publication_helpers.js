window.publicationHelpers = (() => {

    function formatPValueForPublication(pValue) {
        const p = parseFloat(pValue);
        if (p === null || p === undefined || isNaN(p) || !isFinite(p)) return 'N/A';

        const prefix = '<em>P</em>';
        if (p < 0.001) return `${prefix} < .001`;
        if (p > 0.99) return `${prefix} > .99`;
        
        if (p < 0.05 && p >= 0.01 && (Math.round(p * 100) / 100).toFixed(2) === '0.05') {
            return `${prefix} = .${p.toFixed(3).substring(2)}`;
        }
        
        if (p < 0.01) {
            return `${prefix} = .${p.toFixed(3).substring(2)}`;
        }
        
        return `${prefix} = .${p.toFixed(2).substring(2)}`;
    }

    function formatValueForPublication(value, digits = 0, isPercent = false) {
        const num = parseFloat(value);
        if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
            return 'N/A';
        }
        const finalValue = isPercent ? num * 100 : num;
        return finalValue.toFixed(digits);
    }

    function formatMetricForPublication(metric, name, showValueOnly = false) {
        if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) {
            return 'N/A';
        }

        let isPercent = false;
        let digits = 2;

        switch (name.toLowerCase()) {
            case 'sens':
            case 'spec':
            case 'ppv':
            case 'npv':
            case 'acc':
                digits = 1;
                isPercent = true;
                break;
            case 'auc':
            case 'kappa':
            case 'balacc':
                digits = 2;
                isPercent = false;
                break;
            case 'f1':
                digits = 3;
                isPercent = false;
                break;
            case 'or':
            case 'rd':
            case 'phi':
            case 'z':
            case 'statistic':
                digits = 2;
                isPercent = false;
                break;
            default:
                digits = 2;
                isPercent = false;
                break;
        }

        const valueStr = formatValueForPublication(metric.value, digits, isPercent);
        let valueWithUnit = isPercent ? `${valueStr}%` : valueStr;
        
        if (!isPercent && valueStr.startsWith('0.')) {
            valueWithUnit = `.${valueStr.substring(2)}`;
        }

        if (showValueOnly || !metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
            return valueWithUnit;
        }

        const lowerStr = formatValueForPublication(metric.ci.lower, digits, isPercent);
        const upperStr = formatValueForPublication(metric.ci.upper, digits, isPercent);
        
        let ciStr;
        if (isPercent) {
             ciStr = `${lowerStr}%, ${upperStr}%`;
        } else {
            const formattedLower = lowerStr.startsWith('0.') ? `.${lowerStr.substring(2)}` : lowerStr;
            const formattedUpper = upperStr.startsWith('0.') ? `.${upperStr.substring(2)}` : upperStr;
            ciStr = `${formattedLower}, ${formattedUpper}`;
        }

        return `${valueWithUnit} (95% CI: ${ciStr})`;
    }

    function createPublicationTableHTML(config) {
        if (!config || !Array.isArray(config.headers) || !Array.isArray(config.rows)) {
            return '<p>Error: Invalid table configuration.</p>';
        }

        const { id, caption, headers, rows, notes } = config;
        let tableHtml = `<div class="table-responsive my-4" id="${id}">`;
        tableHtml += `<table class="table table-sm table-striped small">`;
        if (caption) {
            tableHtml += `<caption><strong>${caption}</strong></caption>`;
        }
        tableHtml += `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;

        rows.forEach(row => {
            tableHtml += `<tr>${row.map((cell, index) => {
                const cellData = (cell === null || cell === undefined) ? '' : String(cell);
                const isIndented = cellData.startsWith('   ');
                const tag = (index === 0 && !isIndented) ? 'th' : 'td';
                const style = isIndented ? 'style="padding-left: 2em;"' : (tag === 'th' ? 'style="text-align: left;"' : '');
                const scope = (tag === 'th') ? 'scope="row"' : '';
                return `<${tag} ${scope} ${style}>${cellData.trim()}</${tag}>`;
            }).join('')}</tr>`;
        });
        tableHtml += `</tbody>`;

        if (notes) {
            tableHtml += `<tfoot><tr><td colspan="${headers.length}" class="text-muted small p-2" style="font-size: 8pt; text-align: left;">${notes}</td></tr></tfoot>`;
        }

        tableHtml += `</table></div>`;
        return tableHtml;
    }

    function getReference(id) {
        const ref = window.APP_CONFIG.REFERENCES_FOR_PUBLICATION[id];
        return ref ? `[${id}]` : '[REF NOT FOUND]';
    }

    return Object.freeze({
        formatPValueForPublication,
        formatMetricForPublication,
        formatValueForPublication,
        createPublicationTableHTML,
        getReference
    });

})();
