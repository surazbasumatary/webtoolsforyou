document.addEventListener('DOMContentLoaded', function() {
    const conversionType = document.getElementById('conversionType');
    const formatOptions = document.getElementById('formatOptions');
    const fileUpload = document.getElementById('fileUpload');
    const fileInput = document.getElementById('fileInput');
    const uploadTitle = document.getElementById('uploadTitle');
    const uploadDescription = document.getElementById('uploadDescription');
    const fileInfo = document.getElementById('fileInfo');
    const conversionOptions = document.getElementById('conversionOptions');
    const dynamicOptions = document.getElementById('dynamicOptions');
    const convertBtn = document.getElementById('convertBtn');
    const processingArea = document.getElementById('processingArea');
    const resultArea = document.getElementById('resultArea');
    const downloadBtn = document.getElementById('downloadBtn');
    const newConversion = document.getElementById('newConversion');

    // File info elements
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileType = document.getElementById('fileType');
    const resultFileName = document.getElementById('resultFileName');
    const resultFileSize = document.getElementById('resultFileSize');
    const resultFileFormat = document.getElementById('resultFileFormat');
    const originalSizeStat = document.getElementById('originalSizeStat');
    const convertedSizeStat = document.getElementById('convertedSizeStat');
    const sizeChangeStat = document.getElementById('sizeChangeStat');

    let currentFile = null;
    let convertedFile = null;

    // Conversion formats
    const conversionFormats = {
        image: {
            name: 'Image Conversion',
            inputFormats: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
            outputFormats: [
                { format: 'JPEG', extension: '.jpg', mime: 'image/jpeg' },
                { format: 'PNG', extension: '.png', mime: 'image/png' },
                { format: 'GIF', extension: '.gif', mime: 'image/gif' },
                { format: 'WEBP', extension: '.webp', mime: 'image/webp' },
                { format: 'BMP', extension: '.bmp', mime: 'image/bmp' }
            ]
        },
        document: {
            name: 'Document Conversion',
            inputFormats: ['.txt', '.pdf', '.doc', '.docx'],
            outputFormats: [
                { format: 'PDF', extension: '.pdf', mime: 'application/pdf' },
                { format: 'TXT', extension: '.txt', mime: 'text/plain' },
                { format: 'DOC', extension: '.doc', mime: 'application/msword' }
            ]
        },
        audio: {
            name: 'Audio Conversion',
            inputFormats: ['.mp3', '.wav', '.ogg', '.m4a'],
            outputFormats: [
                { format: 'MP3', extension: '.mp3', mime: 'audio/mpeg' },
                { format: 'WAV', extension: '.wav', mime: 'audio/wav' },
                { format: 'OGG', extension: '.ogg', mime: 'audio/ogg' },
                { format: 'M4A', extension: '.m4a', mime: 'audio/mp4' }
            ]
        },
        video: {
            name: 'Video Conversion',
            inputFormats: ['.mp4', '.avi', '.mov', '.webm'],
            outputFormats: [
                { format: 'MP4', extension: '.mp4', mime: 'video/mp4' },
                { format: 'WEBM', extension: '.webm', mime: 'video/webm' },
                { format: 'AVI', extension: '.avi', mime: 'video/x-msvideo' }
            ]
        }
    };

    // Initialize
    updateFormatOptions();
    setupEventListeners();

    function setupEventListeners() {
        conversionType.addEventListener('change', updateFormatOptions);
        fileUpload.addEventListener('click', () => fileInput.click());
        fileUpload.addEventListener('dragover', handleDragOver);
        fileUpload.addEventListener('drop', handleFileDrop);
        fileInput.addEventListener('change', handleFileSelect);
        convertBtn.addEventListener('click', convertFile);
        downloadBtn.addEventListener('click', downloadConvertedFile);
        newConversion.addEventListener('click', resetConverter);
    }

    function updateFormatOptions() {
        const type = conversionType.value;
        const formats = conversionFormats[type];
        
        formatOptions.innerHTML = `
            <div class="format-info">
                <h4>${formats.name}</h4>
                <p>Supported input formats: ${formats.inputFormats.join(', ')}</p>
                <p>Available output formats: ${formats.outputFormats.map(f => f.format).join(', ')}</p>
            </div>
        `;
        
        uploadTitle.textContent = `Drop your ${type} file here or click to browse`;
        uploadDescription.textContent = `Supported formats: ${formats.inputFormats.join(', ')}`;
        
        // Reset file selection when type changes
        resetFileSelection();
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
        const type = conversionType.value;
        const formats = conversionFormats[type];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!formats.inputFormats.includes(fileExtension)) {
            UIUtils.showNotification(`Unsupported file format for ${type} conversion`, 'error');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            UIUtils.showNotification('File size must be less than 50MB', 'error');
            return;
        }

        currentFile = file;
        displayFileInfo(file);
        showConversionOptions();
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

    function showConversionOptions() {
        const type = conversionType.value;
        const formats = conversionFormats[type];
        
        dynamicOptions.innerHTML = `
            <div class="input-group">
                <label for="outputFormat">Convert to:</label>
                <select id="outputFormat">
                    ${formats.outputFormats.map(format => 
                        `<option value="${format.format}">${format.format} (${format.extension})</option>`
                    ).join('')}
                </select>
            </div>
            ${type === 'image' ? getImageOptions() : ''}
            ${type === 'audio' ? getAudioOptions() : ''}
            ${type === 'video' ? getVideoOptions() : ''}
        `;
        
        conversionOptions.classList.remove('hidden');
    }

    function getImageOptions() {
        return `
            <div class="input-group">
                <label for="imageQuality">Quality:</label>
                <input type="range" id="imageQuality" min="1" max="100" value="80">
                <span id="qualityValue">80%</span>
            </div>
            <div class="input-group">
                <label for="imageWidth">Width (px):</label>
                <input type="number" id="imageWidth" placeholder="Auto">
            </div>
            <div class="input-group">
                <label for="imageHeight">Height (px):</label>
                <input type="number" id="imageHeight" placeholder="Auto">
            </div>
        `;
    }

    function getAudioOptions() {
        return `
            <div class="input-group">
                <label for="audioBitrate">Bitrate:</label>
                <select id="audioBitrate">
                    <option value="128">128 kbps</option>
                    <option value="192">192 kbps</option>
                    <option value="256">256 kbps</option>
                    <option value="320">320 kbps</option>
                </select>
            </div>
        `;
    }

    function getVideoOptions() {
        return `
            <div class="input-group">
                <label for="videoQuality">Quality:</label>
                <select id="videoQuality">
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
        `;
    }

    async function convertFile() {
        if (!currentFile) {
            UIUtils.showNotification('Please select a file first', 'warning');
            return;
        }

        processingArea.classList.remove('hidden');
        conversionOptions.classList.add('hidden');
        updateProgress(0);

        try {
            // Simulate conversion process
            await simulateConversion();
            
            // For demo purposes, create a converted file
            // In a real implementation, you'd use proper conversion libraries
            const outputFormat = document.getElementById('outputFormat').value;
            const formatInfo = conversionFormats[conversionType.value].outputFormats.find(f => f.format === outputFormat);
            
            // Create a mock converted file (in real scenario, you'd process the actual file)
            convertedFile = new Blob([await FileUtils.readFileAsArrayBuffer(currentFile)], {
                type: formatInfo.mime
            });

            const convertedSize = Math.round(convertedFile.size * 0.8); // Simulate size change
            
            displayConversionResult(formatInfo, convertedSize);
            UIUtils.showNotification('File converted successfully!', 'success');
            
        } catch (error) {
            console.error('Conversion error:', error);
            UIUtils.showNotification('Error converting file', 'error');
        } finally {
            processingArea.classList.add('hidden');
        }
    }

    function simulateConversion() {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                updateProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    function updateProgress(percent) {
        const progressBar = document.getElementById('conversionProgress');
        progressBar.style.width = `${percent}%`;
    }

    function displayConversionResult(formatInfo, convertedSize) {
        const originalName = currentFile.name;
        const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
        const newFileName = baseName + formatInfo.extension;
        
        resultFileName.textContent = newFileName;
        resultFileSize.textContent = formatFileSize(convertedSize);
        resultFileFormat.textContent = `Format: ${formatInfo.format}`;
        
        originalSizeStat.textContent = formatFileSize(currentFile.size);
        convertedSizeStat.textContent = formatFileSize(convertedSize);
        
        const sizeChange = ((currentFile.size - convertedSize) / currentFile.size * 100).toFixed(1);
        sizeChangeStat.textContent = `${sizeChange}% reduction`;
        sizeChangeStat.style.color = sizeChange > 0 ? '#2ecc71' : '#e74c3c';
        
        resultArea.classList.remove('hidden');
    }

    function downloadConvertedFile() {
        if (!convertedFile) {
            UIUtils.showNotification('No converted file available', 'warning');
            return;
        }

        const originalName = currentFile.name;
        const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
        const outputFormat = document.getElementById('outputFormat').value;
        const formatInfo = conversionFormats[conversionType.value].outputFormats.find(f => f.format === outputFormat);
        const newFileName = baseName + formatInfo.extension;
        
        FileUtils.downloadFile(convertedFile, newFileName, formatInfo.mime);
        UIUtils.showNotification('File downloaded successfully!', 'success');
    }

    function resetConverter() {
        currentFile = null;
        convertedFile = null;
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        conversionOptions.classList.add('hidden');
        resultArea.classList.add('hidden');
        processingArea.classList.add('hidden');
    }

    function resetFileSelection() {
        currentFile = null;
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        conversionOptions.classList.add('hidden');
        resultArea.classList.add('hidden');
    }

    // Add event listeners for dynamic options
    document.addEventListener('input', function(e) {
        if (e.target.id === 'imageQuality') {
            document.getElementById('qualityValue').textContent = e.target.value + '%';
        }
    });
});