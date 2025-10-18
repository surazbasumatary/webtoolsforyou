document.addEventListener('DOMContentLoaded', function() {
    const jsonInput = document.getElementById('jsonInput');
    const jsonOutput = document.getElementById('jsonOutput');
    const processJson = document.getElementById('processJson');
    const validateJson = document.getElementById('validateJson');
    const formatJson = document.getElementById('formatJson');
    const minifyJson = document.getElementById('minifyJson');
    const clearJson = document.getElementById('clearJson');
    const copyJson = document.getElementById('copyJson');
    const downloadJson = document.getElementById('downloadJson');
    const escapeJson = document.getElementById('escapeJson');
    const unescapeJson = document.getElementById('unescapeJson');
    const sortJson = document.getElementById('sortJson');
    const jsonToXml = document.getElementById('jsonToXml');
    const jsonToCsv = document.getElementById('jsonToCsv');
    const jsonToYaml = document.getElementById('jsonToYaml');

    // Stats elements
    const jsonSize = document.getElementById('jsonSize');
    const jsonLines = document.getElementById('jsonLines');
    const jsonDepth = document.getElementById('jsonDepth');
    const jsonKeys = document.getElementById('jsonKeys');

    // Options
    const useTabs = document.getElementById('useTabs');
    const quoteKeys = document.getElementById('quoteKeys');
    const trailingCommas = document.getElementById('trailingCommas');
    const indentSize = document.getElementById('indentSize');

    const resultArea = document.getElementById('resultArea');
    const errorArea = document.getElementById('errorArea');
    const errorMessage = document.getElementById('errorMessage');

    // Initialize
    setupEventListeners();
    loadExamples();

    function setupEventListeners() {
        processJson.addEventListener('click', processJsonData);
        validateJson.addEventListener('click', validateJsonData);
        formatJson.addEventListener('click', formatJsonData);
        minifyJson.addEventListener('click', minifyJsonData);
        clearJson.addEventListener('click', clearJsonData);
        copyJson.addEventListener('click', copyJsonOutput);
        downloadJson.addEventListener('click', downloadJsonFile);
        
        escapeJson.addEventListener('click', escapeJsonData);
        unescapeJson.addEventListener('click', unescapeJsonData);
        sortJson.addEventListener('click', sortJsonKeys);
        jsonToXml.addEventListener('click', convertJsonToXml);
        jsonToCsv.addEventListener('click', convertJsonToCsv);
        jsonToYaml.addEventListener('click', convertJsonToYaml);
    }

    function loadExamples() {
        const exampleCards = document.querySelectorAll('.example-card');
        exampleCards.forEach(card => {
            card.addEventListener('click', function() {
                const exampleType = this.getAttribute('data-example');
                loadExample(exampleType);
            });
        });
    }

    function loadExample(type) {
        const examples = {
            simple: '{"name": "John", "age": 30, "city": "New York"}',
            array: '[{"id": 1, "name": "Alice", "active": true}, {"id": 2, "name": "Bob", "active": false}]',
            nested: '{"user": {"profile": {"name": "John", "address": {"street": "123 Main St", "city": "NYC"}}, "preferences": {"theme": "dark"}}}',
            complex: '{"company": "Tech Corp", "employees": [{"name": "John", "department": "Engineering", "skills": ["JavaScript", "Python"], "projects": [{"name": "Website", "status": "completed"}, {"name": "Mobile App", "status": "in-progress"}]}]}'
        };
        
        jsonInput.value = examples[type] || examples.simple;
        processJsonData();
    }

    function processJsonData() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            UIUtils.showNotification('Please enter some JSON data', 'warning');
            return;
        }

        try {
            const parsedJson = JSON.parse(input);
            const formattedJson = formatJsonString(parsedJson);
            
            displayFormattedJson(formattedJson);
            updateJsonStats(parsedJson, formattedJson);
            showResultArea();
            
            UIUtils.showNotification('JSON processed successfully!', 'success');
            
        } catch (error) {
            showError(error.message);
        }
    }

    function validateJsonData() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            UIUtils.showNotification('Please enter some JSON data', 'warning');
            return;
        }

        try {
            JSON.parse(input);
            UIUtils.showNotification('✅ JSON is valid!', 'success');
            hideErrorArea();
        } catch (error) {
            showError(error.message);
        }
    }

    function formatJsonData() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            UIUtils.showNotification('Please enter some JSON data', 'warning');
            return;
        }

        try {
            const parsedJson = JSON.parse(input);
            const formattedJson = formatJsonString(parsedJson);
            jsonInput.value = formattedJson;
            UIUtils.showNotification('JSON formatted!', 'success');
        } catch (error) {
            showError(error.message);
        }
    }

    function minifyJsonData() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            UIUtils.showNotification('Please enter some JSON data', 'warning');
            return;
        }

        try {
            const parsedJson = JSON.parse(input);
            const minifiedJson = JSON.stringify(parsedJson);
            jsonInput.value = minifiedJson;
            UIUtils.showNotification('JSON minified!', 'success');
        } catch (error) {
            showError(error.message);
        }
    }

    function formatJsonString(obj) {
        const indentChar = useTabs.checked ? '\t' : ' '.repeat(parseInt(indentSize.value));
        return JSON.stringify(obj, null, indentChar);
    }

    function displayFormattedJson(jsonString) {
        // Simple syntax highlighting
        const highlighted = jsonString
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, '<span class="json-string">$1</span>')
            .replace(/\b(true|false|null)\b/g, '<span class="json-literal">$1</span>')
            .replace(/\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/g, '<span class="json-number">$&</span>')
            .replace(/(\{|\[)/g, '<span class="json-bracket">$1</span>')
            .replace(/(\}|\])/g, '<span class="json-bracket">$1</span>')
            .replace(/(:)/g, '<span class="json-colon">$1</span>')
            .replace(/(,)/g, '<span class="json-comma">$1</span>');
        
        jsonOutput.innerHTML = highlighted;
    }

    function updateJsonStats(parsedJson, formattedJson) {
        // Size
        const size = new Blob([formattedJson]).size;
        jsonSize.textContent = formatBytes(size);
        
        // Lines
        const lines = formattedJson.split('\n').length;
        jsonLines.textContent = lines;
        
        // Depth
        const depth = calculateJsonDepth(parsedJson);
        jsonDepth.textContent = depth;
        
        // Keys
        const keyCount = countJsonKeys(parsedJson);
        jsonKeys.textContent = keyCount;
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function calculateJsonDepth(obj, currentDepth = 0) {
        if (typeof obj !== 'object' || obj === null) {
            return currentDepth;
        }
        
        let maxDepth = currentDepth;
        
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                const depth = calculateJsonDepth(item, currentDepth + 1);
                maxDepth = Math.max(maxDepth, depth);
            });
        } else {
            Object.values(obj).forEach(value => {
                const depth = calculateJsonDepth(value, currentDepth + 1);
                maxDepth = Math.max(maxDepth, depth);
            });
        }
        
        return maxDepth;
    }

    function countJsonKeys(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return 0;
        }
        
        let count = 0;
        
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                count += countJsonKeys(item);
            });
        } else {
            count += Object.keys(obj).length;
            Object.values(obj).forEach(value => {
                count += countJsonKeys(value);
            });
        }
        
        return count;
    }

    function showResultArea() {
        resultArea.classList.remove('hidden');
        errorArea.classList.add('hidden');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorArea.classList.remove('hidden');
        resultArea.classList.add('hidden');
        UIUtils.showNotification('JSON validation failed', 'error');
    }

    function hideErrorArea() {
        errorArea.classList.add('hidden');
    }

    function clearJsonData() {
        jsonInput.value = '';
        jsonOutput.innerHTML = '';
        resultArea.classList.add('hidden');
        errorArea.classList.add('hidden');
        UIUtils.showNotification('JSON data cleared!', 'info');
    }

    async function copyJsonOutput() {
        const text = jsonOutput.textContent || jsonOutput.innerText;
        
        if (!text.trim()) {
            UIUtils.showNotification('No JSON to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            UIUtils.showNotification('JSON copied to clipboard!', 'success');
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            UIUtils.showNotification('JSON copied to clipboard!', 'success');
        }
    }

    function downloadJsonFile() {
        const text = jsonOutput.textContent || jsonOutput.innerText;
        
        if (!text.trim()) {
            UIUtils.showNotification('No JSON to download', 'warning');
            return;
        }

        const blob = new Blob([text], { type: 'application/json' });
        FileUtils.downloadFile(blob, 'formatted.json', 'application/json');
        UIUtils.showNotification('JSON file downloaded!', 'success');
    }

    function escapeJsonData() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            UIUtils.showNotification('Please enter some JSON data', 'warning');
            return;
        }

        try {
            const escaped = JSON.stringify(input);
            jsonInput.value = escaped;
            UIUtils.showNotification('JSON escaped!', 'success');
        } catch (error) {
            showError(error.message);
        }
    }

    function unescapeJsonData() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            UIUtils.showNotification('Please enter some JSON data', 'warning');
            return;
        }

        try {
            // Remove surrounding quotes if present
            let unescaped = input;
            if (unescaped.startsWith('"') && unescaped.endsWith('"')) {
                unescaped = unescaped.slice(1, -1);
            }
            
            // Parse the JSON string to unescape it
            unescaped = JSON.parse('"' + unescaped + '"');
            jsonInput.value = unescaped;
            UIUtils.showNotification('JSON unescaped!', 'success');
        } catch (error) {
            showError(error.message);
        }
    }

    function sortJsonKeys() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            UIUtils.showNotification('Please enter some JSON data', 'warning');
            return;
        }

        try {
            const parsedJson = JSON.parse(input);
            const sortedJson = sortObjectKeys(parsedJson);
            const formattedJson = formatJsonString(sortedJson);
            jsonInput.value = formattedJson;
            UIUtils.showNotification('JSON keys sorted!', 'success');
        } catch (error) {
            showError(error.message);
        }
    }

    function sortObjectKeys(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => sortObjectKeys(item));
        } else if (obj !== null && typeof obj === 'object') {
            const sorted = {};
            Object.keys(obj).sort().forEach(key => {
                sorted[key] = sortObjectKeys(obj[key]);
            });
            return sorted;
        }
        return obj;
    }

    function convertJsonToXml() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            UIUtils.showNotification('Please enter some JSON data', 'warning');
            return;
        }

        try {
            const parsedJson = JSON.parse(input);
            const xml = jsonToXmlString(parsedJson, 'root');
            jsonOutput.textContent = xml;
            displayFormattedJson(xml);
            showResultArea();
            UIUtils.showNotification('Converted to XML!', 'success');
        } catch (error) {
            showError(error.message);
        }
    }

    function jsonToXmlString(obj, tagName) {
        if (typeof obj === 'string') {
            return `<${tagName}>${escapeXml(obj)}</${tagName}>`;
        } else if (typeof obj === 'number' || typeof obj === 'boolean') {
            return `<${tagName}>${obj}</${tagName}>`;
        } else if (obj === null) {
            return `<${tagName}></${tagName}>`;
        } else if (Array.isArray(obj)) {
            return obj.map(item => jsonToXmlString(item, 'item')).join('\n');
        } else {
            let xml = '';
            for (const [key, value] of Object.entries(obj)) {
                xml += jsonToXmlString(value, key);
            }
            return `<${tagName}>\n${xml}\n</${tagName}>`;
        }
    }

    function escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    function convertJsonToCsv() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            UIUtils.showNotification('Please enter some JSON data', 'warning');
            return;
        }

        try {
            const parsedJson = JSON.parse(input);
            const csv = jsonToCsvString(parsedJson);
            jsonOutput.textContent = csv;
            displayFormattedJson(csv);
            showResultArea();
            UIUtils.showNotification('Converted to CSV!', 'success');
        } catch (error) {
            showError(error.message);
        }
    }

    function jsonToCsvString(obj) {
        if (Array.isArray(obj)) {
            if (obj.length === 0) return '';
            
            const headers = Object.keys(obj[0]);
            const csvRows = [headers.join(',')];
            
            for (const row of obj) {
                const values = headers.map(header => {
                    const value = row[header];
                    return `"${String(value || '').replace(/"/g, '""')}"`;
                });
                csvRows.push(values.join(','));
            }
            
            return csvRows.join('\n');
        } else {
            const headers = Object.keys(obj);
            const values = headers.map(header => {
                const value = obj[header];
                return `"${String(value || '').replace(/"/g, '""')}"`;
            });
            return headers.join(',') + '\n' + values.join(',');
        }
    }

    function convertJsonToYaml() {
        const input = jsonInput.value.trim();
        
        if (!input) {
            UIUtils.showNotification('Please enter some JSON data', 'warning');
            return;
        }

        try {
            const parsedJson = JSON.parse(input);
            const yaml = jsonToYamlString(parsedJson);
            jsonOutput.textContent = yaml;
            displayFormattedJson(yaml);
            showResultArea();
            UIUtils.showNotification('Converted to YAML!', 'success');
        } catch (error) {
            showError(error.message);
        }
    }

    function jsonToYamlString(obj, indent = '') {
        if (typeof obj === 'string') {
            return `"${obj}"`;
        } else if (typeof obj === 'number' || typeof obj === 'boolean') {
            return obj.toString();
        } else if (obj === null) {
            return 'null';
        } else if (Array.isArray(obj)) {
            if (obj.length === 0) return '[]';
            return obj.map(item => `${indent}- ${jsonToYamlString(item, indent + '  ')}`).join('\n');
        } else {
            const entries = Object.entries(obj);
            if (entries.length === 0) return '{}';
            return entries.map(([key, value]) => {
                return `${indent}${key}: ${jsonToYamlString(value, indent + '  ')}`;
            }).join('\n');
        }
    }
});

// Add CSS for JSON formatter
const jsonFormatterStyles = `
.json-editor {
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1.5rem;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
}

.editor-actions {
    display: flex;
    gap: 0.5rem;
}

#jsonInput {
    border: none;
    border-radius: 0;
    resize: vertical;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.4;
}

.json-actions {
    margin: 1.5rem 0;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.result-actions {
    display: flex;
    gap: 0.5rem;
}

.json-output {
    background: #2d3748;
    color: #e2e8f0;
    padding: 1.5rem;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.4;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.json-string { color: #68d391; }
.json-number { color: #63b3ed; }
.json-literal { color: #fbb6ce; }
.json-bracket { color: #fbd38d; }
.json-colon { color: #e2e8f0; }
.json-comma { color: #e2e8f0; }

.json-stats {
    display: flex;
    gap: 2rem;
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.json-stats .stat {
    text-align: center;
}

.json-stats .stat strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #666;
    font-size: 0.8rem;
}

.json-stats .stat span {
    font-size: 1.2rem;
    font-weight: bold;
    color: #4361ee;
}

.error-area {
    border: 2px solid #e74c3c;
    border-radius: 8px;
    padding: 1.5rem;
    background: #fdf2f2;
}

.error-area h4 {
    color: #e74c3c;
    margin-bottom: 1rem;
}

.error-message {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    border-left: 4px solid #e74c3c;
    font-family: 'Courier New', monospace;
    color: #c53030;
}

.json-tools {
    margin: 2rem 0;
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
}

.tool-btn {
    background: white;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    font-weight: 500;
}

.tool-btn:hover {
    border-color: #4361ee;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.tool-btn i {
    margin-right: 0.5rem;
    color: #4361ee;
}

.json-examples {
    margin: 2rem 0;
}

.examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.example-card {
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.example-card:hover {
    border-color: #4361ee;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.example-card h5 {
    color: #4361ee;
    margin-bottom: 1rem;
}

.example-card code {
    background: #f8f9fa;
    padding: 0.75rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    color: #666;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.json-info {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.format-options {
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .editor-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .editor-actions {
        flex-wrap: wrap;
    }
    
    .result-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .json-stats {
        flex-direction: column;
        gap: 1rem;
    }
    
    .tools-grid {
        grid-template-columns: 1fr;
    }
    
    .examples-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = jsonFormatterStyles;
document.head.appendChild(styleSheet);