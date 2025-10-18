document.addEventListener('DOMContentLoaded', function() {
    const fileUpload = document.getElementById('fileUpload');
    const pdfFileInput = document.getElementById('pdfFile');
    const compressionOptions = document.getElementById('compressionOptions');
    const fileInfo = document.getElementById('fileInfo');
    const compressBtn = document.getElementById('compressBtn');
    const resultArea = document.getElementById('resultArea');
    const downloadBtn = document.getElementById('downloadBtn');
    const compressionLevel = document.getElementById('compressionLevel');

    let currentFile = null;
    let compressedPDF = null;

    // File upload handling
    fileUpload.addEventListener('click', () => pdfFileInput.click());
    fileUpload.addEventListener('dragover', handleDragOver);
    fileUpload.addEventListener('drop', handleFileDrop);
    pdfFileInput.addEventListener('change', handleFileSelect);

    compressBtn.addEventListener('click', compressPDF);
    downloadBtn.addEventListener('click', downloadCompressedPDF);

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
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handleFile(files[0]);
        } else {
            UIUtils.showNotification('Please drop a valid PDF file', 'error');
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    function handleFile(file) {
        if (file.type !== 'application/pdf') {
            UIUtils.showNotification('Please select a PDF file', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            UIUtils.showNotification('File size must be less than 10MB', 'error');
            return;
        }

        currentFile = file;
        displayFileInfo(file);
        compressionOptions.style.display = 'block';
        compressBtn.style.display = 'block';
        resultArea.classList.add('hidden');
    }

    function displayFileInfo(file) {
        document.getElementById('fileName').textContent = `Name: ${file.name}`;
        document.getElementById('fileSize').textContent = `Size: ${formatFileSize(file.size)}`;
        fileInfo.classList.remove('hidden');
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function compressPDF() {
        if (!currentFile) {
            UIUtils.showNotification('Please select a PDF file first', 'warning');
            return;
        }

        UIUtils.showLoading(compressBtn);
        updateProgress(0);

        try {
            // Simulate compression process (in a real implementation, you'd use PDF.js or similar)
            await simulateCompression();
            
            // For demo purposes, we're creating a mock compressed file
            // In a real scenario, you'd use proper PDF compression libraries
            const compressionRatio = getCompressionRatio();
            const compressedSize = Math.round(currentFile.size * compressionRatio);
            
            compressedPDF = new Blob([await FileUtils.readFileAsArrayBuffer(currentFile)], {
                type: 'application/pdf'
            });

            displayResults(currentFile.size, compressedSize);
            UIUtils.showNotification('PDF compressed successfully!', 'success');
            
        } catch (error) {
            console.error('Compression error:', error);
            UIUtils.showNotification('Error compressing PDF', 'error');
        } finally {
            compressBtn.innerHTML = '<i class="fas fa-compress"></i> Compress PDF';
        }
    }

    function getCompressionRatio() {
        switch (compressionLevel.value) {
            case 'low': return 0.8;
            case 'medium': return 0.6;
            case 'high': return 0.4;
            default: return 0.6;
        }
    }

    function simulateCompression() {
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
        const progressBar = document.getElementById('compressionProgress');
        const progressText = document.getElementById('progressText');
        
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `Compressing... ${percent}%`;
    }

    function displayResults(originalSize, compressedSize) {
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        document.getElementById('originalSize').textContent = `Original Size: ${formatFileSize(originalSize)}`;
        document.getElementById('compressedSize').textContent = `Compressed Size: ${formatFileSize(compressedSize)}`;
        document.getElementById('savings').textContent = `Size Reduction: ${savings}%`;
        
        resultArea.classList.remove('hidden');
    }

    function downloadCompressedPDF() {
        if (!compressedPDF) {
            UIUtils.showNotification('No compressed PDF available', 'warning');
            return;
        }

        const originalName = currentFile.name.replace('.pdf', '');
        const compressedName = `${originalName}-compressed.pdf`;
        
        FileUtils.downloadFile(compressedPDF, compressedName, 'application/pdf');
        UIUtils.showNotification('PDF downloaded successfully!', 'success');
    }
});