document.addEventListener('DOMContentLoaded', function() {
    const fileUpload = document.getElementById('fileUpload');
    const imageFile = document.getElementById('imageFile');
    const uploadArea = document.getElementById('uploadArea');
    const previewArea = document.getElementById('previewArea');
    const imagePreview = document.getElementById('imagePreview');
    const rotateLeft = document.getElementById('rotateLeft');
    const rotateRight = document.getElementById('rotateRight');
    const removeImage = document.getElementById('removeImage');
    const extractTextBtn = document.getElementById('extractTextBtn');
    const resultArea = document.getElementById('resultArea');
    const extractedText = document.getElementById('extractedText');
    const copyText = document.getElementById('copyText');
    const downloadText = document.getElementById('downloadText');
    const clearAll = document.getElementById('clearAll');
    const processingArea = document.getElementById('processingArea');
    const autoPreprocess = document.getElementById('autoPreprocess');
    const preserveFormatting = document.getElementById('preserveFormatting');
    const languageSelect = document.getElementById('languageSelect');

    // Statistics
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const lineCount = document.getElementById('lineCount');

    let currentImage = null;
    let rotation = 0;

    // Initialize Tesseract worker
    let worker = null;

    // Event listeners
    fileUpload.addEventListener('click', () => imageFile.click());
    fileUpload.addEventListener('dragover', handleDragOver);
    fileUpload.addEventListener('drop', handleFileDrop);
    imageFile.addEventListener('change', handleFileSelect);

    rotateLeft.addEventListener('click', () => rotateImage(-90));
    rotateRight.addEventListener('click', () => rotateImage(90));
    removeImage.addEventListener('click', removeCurrentImage);
    extractTextBtn.addEventListener('click', extractTextFromImage);
    copyText.addEventListener('click', copyExtractedText);
    downloadText.addEventListener('click', downloadExtractedText);
    clearAll.addEventListener('click', clearAllData);

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
        if (files.length > 0 && isImageFile(files[0])) {
            handleImageFile(files[0]);
        } else {
            UIUtils.showNotification('Please drop a valid image file', 'error');
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    }

    function isImageFile(file) {
        return file.type.startsWith('image/');
    }

    function handleImageFile(file) {
        if (!isImageFile(file)) {
            UIUtils.showNotification('Please select an image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            UIUtils.showNotification('File size must be less than 5MB', 'error');
            return;
        }

        currentImage = file;
        displayImagePreview(file);
        extractTextBtn.style.display = 'block';
        resultArea.classList.add('hidden');
    }

    function displayImagePreview(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            previewArea.classList.remove('hidden');
            uploadArea.style.display = 'none';
            rotation = 0; // Reset rotation
        };
        
        reader.readAsDataURL(file);
    }

    function rotateImage(degrees) {
        rotation += degrees;
        imagePreview.style.transform = `rotate(${rotation}deg)`;
    }

    function removeCurrentImage() {
        currentImage = null;
        imageFile.value = '';
        previewArea.classList.add('hidden');
        uploadArea.style.display = 'block';
        extractTextBtn.style.display = 'none';
        resultArea.classList.add('hidden');
    }

    async function extractTextFromImage() {
        if (!currentImage) {
            UIUtils.showNotification('Please select an image first', 'warning');
            return;
        }

        // Show processing area
        processingArea.classList.remove('hidden');
        resultArea.classList.add('hidden');
        updateProgress(0);

        try {
            // Initialize Tesseract worker
            if (!worker) {
                worker = await Tesseract.createWorker();
            }

            const language = languageSelect.value;
            await worker.loadLanguage(language);
            await worker.initialize(language);

            // Configure worker
            await worker.setParameters({
                tessedit_pageseg_mode: preserveFormatting.checked ? 6 : 8, // Sparse text vs uniform block
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:-()[]{}@#$%^&*+=_|/\\"\''
            });

            updateProgress(30);

            // Perform OCR
            const { data: { text, confidence } } = await worker.recognize(currentImage);
            
            updateProgress(100);

            // Display results
            displayExtractedText(text, confidence);
            
            UIUtils.showNotification(`Text extracted successfully! Confidence: ${confidence.toFixed(1)}%`, 'success');

        } catch (error) {
            console.error('OCR Error:', error);
            UIUtils.showNotification('Error extracting text from image', 'error');
        } finally {
            processingArea.classList.add('hidden');
        }
    }

    function updateProgress(percent) {
        const progressBar = document.getElementById('ocrProgress');
        progressBar.style.width = `${percent}%`;
    }

    function displayExtractedText(text, confidence) {
        let processedText = text.trim();
        
        // Clean up text based on options
        if (!preserveFormatting.checked) {
            // Remove extra whitespace and normalize
            processedText = processedText.replace(/\s+/g, ' ').trim();
        }
        
        extractedText.value = processedText;
        updateTextStatistics(processedText);
        resultArea.classList.remove('hidden');
        
        // Scroll to results
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }

    function updateTextStatistics(text) {
        const characters = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text.trim() ? text.split('\n').length : 0;
        
        charCount.textContent = characters;
        wordCount.textContent = words;
        lineCount.textContent = lines;
    }

    async function copyExtractedText() {
        if (!extractedText.value.trim()) {
            UIUtils.showNotification('No text to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(extractedText.value);
            UIUtils.showNotification('Text copied to clipboard!', 'success');
        } catch (err) {
            extractedText.select();
            document.execCommand('copy');
            UIUtils.showNotification('Text copied to clipboard!', 'success');
        }
    }

    function downloadExtractedText() {
        if (!extractedText.value.trim()) {
            UIUtils.showNotification('No text to download', 'warning');
            return;
        }

        const blob = new Blob([extractedText.value], { type: 'text/plain' });
        FileUtils.downloadFile(blob, 'extracted-text.txt', 'text/plain');
        UIUtils.showNotification('Text downloaded!', 'success');
    }

    function clearAllData() {
        removeCurrentImage();
        extractedText.value = '';
        resultArea.classList.add('hidden');
        updateTextStatistics('');
        UIUtils.showNotification('All data cleared!', 'info');
    }

    // Cleanup worker when page unloads
    window.addEventListener('beforeunload', async () => {
        if (worker) {
            await worker.terminate();
        }
    });
});

// Add CSS for image to text
const imageToTextStyles = `
.preview-area {
    margin: 2rem 0;
}

.preview-container {
    text-align: center;
}

#imagePreview {
    max-width: 100%;
    max-height: 400px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    transition: transform 0.3s ease;
}

.preview-controls {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
}

.ocr-options {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.extraction-stats {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.stat {
    text-align: center;
}

.stat strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #666;
}

.stat span {
    font-size: 1.2rem;
    font-weight: bold;
    color: #4361ee;
}

.loading-spinner {
    text-align: center;
    padding: 2rem;
}

.loading-spinner i {
    font-size: 3rem;
    color: #4361ee;
    margin-bottom: 1rem;
}

.loading-spinner h4 {
    margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
    .extraction-stats {
        flex-direction: column;
        gap: 1rem;
    }
    
    .preview-controls {
        flex-wrap: wrap;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = imageToTextStyles;
document.head.appendChild(styleSheet);