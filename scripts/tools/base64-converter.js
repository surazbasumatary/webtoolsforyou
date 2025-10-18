document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Reset both tabs when switching
            resetTextTab();
            resetFileTab();
        });
    });

    // Text Conversion Elements
    const directionRadios = document.querySelectorAll('input[name="direction"]');
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const convertText = document.getElementById('convertText');
    const copyOutput = document.getElementById('copyOutput');
    const clearText = document.getElementById('clearText');
    const inputLabel = document.getElementById('inputLabel');
    const outputLabel = document.getElementById('outputLabel');

    // File Conversion Elements
    const fileDirectionRadios = document.querySelectorAll('input[name="fileDirection"]');
    const fileUpload = document.getElementById('fileUpload');
    const fileInput = document.getElementById('fileInput');
    const fileUploadTitle = document.getElementById('fileUploadTitle');
    const fileUploadDescription = document.getElementById('fileUploadDescription');
    const fileInfo = document.getElementById('fileInfo');
    const convertFile = document.getElementById('convertFile');
    const fileResult = document.getElementById('fileResult');
    const fileOutput = document.getElementById('fileOutput');
    const copyFileOutput = document.getElementById('copyFileOutput');
    const downloadFile = document.getElementById('downloadFile');
    const clearFile = document.getElementById('clearFile');

    // File info elements
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileType = document.getElementById('fileType');

    // History elements
    const historyList = document.getElementById('historyList');
    const clearHistory = document.getElementById('clearHistory');

    let currentFile = null;
    let conversionHistory = StorageUtils.get('base64History', []);

    // Initialize
    updateTextLabels();
    updateFileLabels();
    loadConversionHistory();
    setupEventListeners();

    function setupEventListeners() {
        // Text conversion events
        directionRadios.forEach(radio => {
            radio.addEventListener('change', updateTextLabels);
        });
        convertText.addEventListener('click', convertTextBase64);
        copyOutput.addEventListener('click', copyTextOutput);
        clearText.addEventListener('click', resetTextTab);

        // File conversion events
        fileDirectionRadios.forEach(radio => {
            radio.addEventListener('change', updateFileLabels);
        });
        fileUpload.addEventListener('click', () => fileInput.click());
        fileUpload.addEventListener('dragover', handleDragOver);
        fileUpload.addEventListener('drop', handleFileDrop);
        fileInput.addEventListener('change', handleFileSelect);
        convertFile.addEventListener('click', convertFileBase64);
        copyFileOutput.addEventListener('click', copyFileOutputText);
        downloadFile.addEventListener('click', downloadDecodedFile);
        clearFile.addEventListener('click', resetFileTab);

        // History events
        clearHistory.addEventListener('click', clearConversionHistory);
    }

    function updateTextLabels() {
        const isEncoding = document.querySelector('input[name="direction"]:checked').value === 'encode';
        
        inputLabel.textContent = isEncoding ? 'Text to encode:' : 'Base64 to decode:';
        outputLabel.textContent = isEncoding ? 'Base64 result:' : 'Decoded text:';
        
        inputText.placeholder = isEncoding 
            ? 'Enter text to encode to Base64...' 
            : 'Enter Base64 string to decode...';
    }

    function updateFileLabels() {
        const isEncoding = document.querySelector('input[name="fileDirection"]:checked').value === 'encode';
        
        fileUploadTitle.textContent = isEncoding 
            ? 'Drop your file here or click to browse' 
            : 'Drop Base64 text file here or click to browse';
        
        fileUploadDescription.textContent = isEncoding 
            ? 'Select a file to encode to Base64' 
            : 'Select a Base64 text file to decode';
        
        resetFileTab();
    }

    function convertTextBase64() {
        const input = inputText.value.trim();
        const isEncoding = document.querySelector('input[name="direction"]:checked').value === 'encode';
        
        if (!input) {
            UIUtils.showNotification('Please enter some text to convert', 'warning');
            return;
        }

        try {
            let result;
            if (isEncoding) {
                // Encode to Base64
                result = btoa(unescape(encodeURIComponent(input)));
            } else {
                // Decode from Base64
                result = decodeURIComponent(escape(atob(input)));
            }
            
            outputText.value = result;
            addToHistory(input, result, isEncoding ? 'encode' : 'decode', 'text');
            UIUtils.showNotification('Conversion completed!', 'success');
            
        } catch (error) {
            console.error('Base64 conversion error:', error);
            UIUtils.showNotification('Error converting text. Please check your input.', 'error');
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        fileUpload.style.borderColor = '#4361ee';
        fileUpload.style.backgroundColor = '#f0f4ff';
    }

    function handleFileDrop(e) {
        e.preventDefault();
        fileUpload.style.borderColor = '#e1e5e9';
        fileUpload.style.backgroundColor = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    function handleFile(file) {
        const isEncoding = document.querySelector('input[name="fileDirection"]:checked').value === 'encode';
        
        if (!isEncoding && !file.name.toLowerCase().endsWith('.txt')) {
            UIUtils.showNotification('For decoding, please select a .txt file containing Base64', 'warning');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            UIUtils.showNotification('File size must be less than 10MB', 'error');
            return;
        }

        currentFile = file;
        displayFileInfo(file);
    }

    function displayFileInfo(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileType.textContent = `Type: ${file.type || 'Unknown'}`;
        fileInfo.classList.remove('hidden');
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function convertFileBase64() {
        if (!currentFile) {
            UIUtils.showNotification('Please select a file first', 'warning');
            return;
        }

        const isEncoding = document.querySelector('input[name="fileDirection"]:checked').value === 'encode';

        try {
            UIUtils.showLoading(convertFile);

            if (isEncoding) {
                // Encode file to Base64
                const base64String = await fileToBase64(currentFile);
                fileOutput.value = base64String;
                fileResult.classList.remove('hidden');
                addToHistory(currentFile.name, base64String.substring(0, 100) + '...', 'encode', 'file');
            } else {
                // Decode Base64 to file
                const base64String = await FileUtils.readFileAsText(currentFile);
                const binaryString = atob(base64String);
                const bytes = new Uint8Array(binaryString.length);
                
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                const blob = new Blob([bytes], { type: 'application/octet-stream' });
                currentFile = blob;
                fileOutput.value = 'File decoded successfully. Click "Download File" to save.';
                fileResult.classList.remove('hidden');
                addToHistory(currentFile.name, 'File decoded', 'decode', 'file');
            }
            
            UIUtils.showNotification('File conversion completed!', 'success');
            
        } catch (error) {
            console.error('File conversion error:', error);
            UIUtils.showNotification('Error converting file. Please check your file.', 'error');
        } finally {
            convertFile.innerHTML = '<i class="fas fa-sync-alt"></i> Convert File';
        }
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data URL prefix to get pure Base64
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function copyTextOutput() {
        if (!outputText.value.trim()) {
            UIUtils.showNotification('No text to copy', 'warning');
            return;
        }

        copyToClipboard(outputText.value, 'Text copied to clipboard!');
    }

    function copyFileOutputText() {
        if (!fileOutput.value.trim()) {
            UIUtils.showNotification('No Base64 to copy', 'warning');
            return;
        }

        copyToClipboard(fileOutput.value, 'Base64 copied to clipboard!');
    }

    async function copyToClipboard(text, successMessage) {
        try {
            await navigator.clipboard.writeText(text);
            UIUtils.showNotification(successMessage, 'success');
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            UIUtils.showNotification(successMessage, 'success');
        }
    }

    function downloadDecodedFile() {
        if (!currentFile || !(currentFile instanceof Blob)) {
            UIUtils.showNotification('No decoded file available', 'warning');
            return;
        }

        const filename = 'decoded-file'; // You could try to extract original filename from Base64 metadata
        FileUtils.downloadFile(currentFile, filename, currentFile.type);
        UIUtils.showNotification('File downloaded!', 'success');
    }

    function resetTextTab() {
        inputText.value = '';
        outputText.value = '';
    }

    function resetFileTab() {
        currentFile = null;
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        fileResult.classList.add('hidden');
        fileOutput.value = '';
    }

    function addToHistory(input, output, direction, type) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            input: StringUtils.truncate(input, 50),
            output: StringUtils.truncate(output, 50),
            direction: direction,
            type: type
        };
        
        conversionHistory.unshift(historyItem);
        conversionHistory = conversionHistory.slice(0, 15); // Keep last 15 items
        StorageUtils.set('base64History', conversionHistory);
        loadConversionHistory();
    }

    function loadConversionHistory() {
        historyList.innerHTML = '';
        
        if (conversionHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">No conversion history</p>';
            return;
        }
        
        conversionHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-content">
                    <div class="history-type">${item.type === 'text' ? '📝 Text' : '📁 File'} ${item.direction}</div>
                    <div class="history-input">${item.input}</div>
                    <div class="history-output">${item.output}</div>
                    <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
                </div>
                <button class="history-use" data-item='${JSON.stringify(item)}'>
                    <i class="fas fa-redo"></i>
                </button>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Add event listeners to use buttons
        document.querySelectorAll('.history-use').forEach(btn => {
            btn.addEventListener('click', function() {
                const item = JSON.parse(this.getAttribute('data-item'));
                // For text items, we can reload the input
                if (item.type === 'text') {
                    // Switch to text tab
                    document.querySelector('[data-tab="text"]').click();
                    inputText.value = item.input;
                    // Set direction
                    document.querySelector(`input[name="direction"][value="${item.direction}"]`).checked = true;
                    updateTextLabels();
                    UIUtils.showNotification('Conversion loaded from history!', 'info');
                }
            });
        });
    }

    function clearConversionHistory() {
        conversionHistory = [];
        StorageUtils.set('base64History', conversionHistory);
        loadConversionHistory();
        UIUtils.showNotification('Conversion history cleared!', 'info');
    }
});

// Add CSS for base64 converter
const base64ConverterStyles = `
.conversion-direction, .file-conversion-direction {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    justify-content: center;
}

.direction-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.75rem 1.5rem;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.direction-option:hover {
    border-color: #4361ee;
}

.direction-option input[type="radio"] {
    display: none;
}

.radio-checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #e1e5e9;
    border-radius: 50%;
    position: relative;
    transition: all 0.3s ease;
}

.direction-option input[type="radio"]:checked + .radio-checkmark {
    border-color: #4361ee;
}

.direction-option input[type="radio"]:checked + .radio-checkmark::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: #4361ee;
    border-radius: 50%;
}

.direction-option input[type="radio"]:checked ~ span:last-child {
    color: #4361ee;
    font-weight: 600;
}

.conversion-actions, .file-conversion-actions {
    margin: 1.5rem 0;
}

.text-actions, .file-result-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.file-upload-area {
    margin: 2rem 0;
}

.file-info {
    margin-top: 1rem;
}

.file-details {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    background: #f8f9fa;
}

.file-icon {
    width: 50px;
    height: 50px;
    background: #4361ee;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
}

.file-meta {
    flex: 1;
}

.file-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.file-size, .file-type {
    color: #666;
    font-size: 0.9rem;
}

.conversion-history {
    margin: 3rem 0;
}

.history-list {
    max-height: 400px;
    overflow-y: auto;
    margin: 1rem 0;
}

.history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
}

.history-item:hover {
    border-color: #4361ee;
}

.history-content {
    flex: 1;
}

.history-type {
    font-weight: 600;
    color: #4361ee;
    margin-bottom: 0.25rem;
}

.history-input, .history-output {
    margin-bottom: 0.25rem;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
}

.history-input {
    color: #666;
}

.history-output {
    color: #4361ee;
}

.history-time {
    font-size: 0.8rem;
    color: #999;
}

.history-use {
    background: transparent;
    border: 1px solid #4361ee;
    color: #4361ee;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.history-use:hover {
    background: #4361ee;
    color: white;
}

.base64-info {
    margin: 3rem 0;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.info-card {
    padding: 1.5rem;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    background: #f8f9fa;
}

.info-card h5 {
    color: #4361ee;
    margin-bottom: 1rem;
    border-bottom: 2px solid #e1e5e9;
    padding-bottom: 0.5rem;
}

.info-card p {
    line-height: 1.6;
    color: #666;
}

.info-card ul {
    padding-left: 1.5rem;
    color: #666;
}

.info-card li {
    margin-bottom: 0.5rem;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .conversion-direction, .file-conversion-direction {
        flex-direction: column;
        gap: 1rem;
    }
    
    .text-actions, .file-result-actions {
        flex-direction: column;
    }
    
    .file-details {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }
    
    .history-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = base64ConverterStyles;
document.head.appendChild(styleSheet);