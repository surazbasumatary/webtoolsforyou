// image-compressor.js
class ImageCompressor {
    constructor() {
        this.originalFile = null;
        this.compressedBlob = null;
        this.originalImage = new Image();
        this.compressedImage = new Image();
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        
        // Control elements
        this.compressionControls = document.getElementById('compressionControls');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.targetSize = document.getElementById('targetSize');
        this.outputFormat = document.getElementById('outputFormat');
        
        // Preview elements
        this.previewContainer = document.getElementById('previewContainer');
        this.originalPreview = document.getElementById('originalPreview');
        this.compressedPreview = document.getElementById('compressedPreview');
        this.originalInfo = document.getElementById('originalInfo');
        this.compressedInfo = document.getElementById('compressedInfo');
        
        // Stats and action elements
        this.compressionStats = document.getElementById('compressionStats');
        this.actionButtons = document.getElementById('actionButtons');
        this.compressButton = document.getElementById('compressButton');
        this.downloadButton = document.getElementById('downloadButton');
        this.resetButton = document.getElementById('resetButton');
    }

    setupEventListeners() {
        // Upload area click
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Quality slider
        this.qualitySlider.addEventListener('input', () => {
            this.qualityValue.textContent = this.qualitySlider.value;
        });
        
        // Action buttons
        this.compressButton.addEventListener('click', () => this.compressImage());
        this.downloadButton.addEventListener('click', () => this.downloadImage());
        this.resetButton.addEventListener('click', () => this.resetTool());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/webp')) {
            this.showError('Please select a valid image file (JPEG, PNG, or WebP)');
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB');
            return;
        }

        this.originalFile = file;
        
        // Read and display original image
        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImage.src = e.target.result;
            this.originalPreview.src = e.target.result;
            
            this.showOriginalInfo();
            this.showControls();
        };
        reader.readAsDataURL(file);
    }

    showOriginalInfo() {
        const sizeKB = (this.originalFile.size / 1024).toFixed(2);
        const dimensions = `${this.originalImage.naturalWidth} × ${this.originalImage.naturalHeight}`;
        
        this.originalInfo.innerHTML = `
            <div class="file-info-item">
                <span>File Name:</span>
                <span>${this.originalFile.name}</span>
            </div>
            <div class="file-info-item">
                <span>File Size:</span>
                <span>${sizeKB} KB</span>
            </div>
            <div class="file-info-item">
                <span>Dimensions:</span>
                <span>${dimensions}</span>
            </div>
            <div class="file-info-item">
                <span>Type:</span>
                <span>${this.originalFile.type}</span>
            </div>
        `;
    }

    showControls() {
        this.compressionControls.classList.remove('hidden');
        this.previewContainer.classList.remove('hidden');
        this.actionButtons.classList.remove('hidden');
    }

    async compressImage() {
        if (!this.originalFile) return;

        this.compressButton.disabled = true;
        this.compressButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing...';

        try {
            const quality = parseInt(this.qualitySlider.value) / 100;
            const targetSizeKB = this.targetSize.value ? parseInt(this.targetSize.value) : null;
            const outputFormat = this.outputFormat.value === 'original' 
                ? this.originalFile.type.split('/')[1] 
                : this.outputFormat.value;

            this.compressedBlob = await this.compressImageToTarget(
                this.originalImage,
                quality,
                targetSizeKB,
                outputFormat
            );

            // Display compressed image
            this.compressedPreview.src = URL.createObjectURL(this.compressedBlob);
            
            // Show compressed file info
            this.showCompressedInfo();
            
            // Show compression stats
            this.showCompressionStats();

            this.downloadButton.disabled = false;

        } catch (error) {
            this.showError('Compression failed: ' + error.message);
        } finally {
            this.compressButton.disabled = false;
            this.compressButton.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Image';
        }
    }

    compressImageToTarget(image, initialQuality, targetSizeKB, format) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions to image dimensions
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            
            // Draw image on canvas
            ctx.drawImage(image, 0, 0);
            
            const compressWithQuality = (quality) => {
                return new Promise((resolve) => {
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, `image/${format}`, quality);
                });
            };

            const binarySearchCompression = async (minQuality, maxQuality, targetSize) => {
                const midQuality = (minQuality + maxQuality) / 2;
                const blob = await compressWithQuality(midQuality);
                const sizeKB = blob.size / 1024;
                
                // If we're close enough to target size or quality range is small
                if (Math.abs(sizeKB - targetSize) < 5 || (maxQuality - minQuality) < 0.05) {
                    return blob;
                }
                
                if (sizeKB > targetSize) {
                    // Need more compression (lower quality)
                    return binarySearchCompression(minQuality, midQuality, targetSize);
                } else {
                    // Can afford better quality
                    return binarySearchCompression(midQuality, maxQuality, targetSize);
                }
            };

            if (targetSizeKB) {
                // Use binary search to find optimal quality for target size
                binarySearchCompression(0.1, 1.0, targetSizeKB)
                    .then(resolve)
                    .catch(reject);
            } else {
                // Use fixed quality compression
                compressWithQuality(initialQuality)
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    showCompressedInfo() {
        if (!this.compressedBlob) return;

        const sizeKB = (this.compressedBlob.size / 1024).toFixed(2);
        const format = this.compressedBlob.type.split('/')[1].toUpperCase();
        
        this.compressedInfo.innerHTML = `
            <div class="file-info-item">
                <span>File Size:</span>
                <span>${sizeKB} KB</span>
            </div>
            <div class="file-info-item">
                <span>Format:</span>
                <span>${format}</span>
            </div>
            <div class="file-info-item">
                <span>Quality:</span>
                <span>${this.qualitySlider.value}%</span>
            </div>
        `;
    }

    showCompressionStats() {
        if (!this.compressedBlob || !this.originalFile) return;

        const originalSizeKB = this.originalFile.size / 1024;
        const compressedSizeKB = this.compressedBlob.size / 1024;
        const savings = ((originalSizeKB - compressedSizeKB) / originalSizeKB * 100).toFixed(1);
        
        this.compressionStats.innerHTML = `
            <h4><i class="fas fa-chart-line"></i> Compression Results</h4>
            <div class="file-info-item">
                <span>Original Size:</span>
                <span>${originalSizeKB.toFixed(2)} KB</span>
            </div>
            <div class="file-info-item">
                <span>Compressed Size:</span>
                <span>${compressedSizeKB.toFixed(2)} KB</span>
            </div>
            <div class="file-info-item">
                <span>Size Reduction:</span>
                <span style="color: #28a745; font-weight: bold;">${savings}%</span>
            </div>
            <div class="file-info-item">
                <span>Space Saved:</span>
                <span>${(originalSizeKB - compressedSizeKB).toFixed(2)} KB</span>
            </div>
        `;
        
        this.compressionStats.classList.remove('hidden');
    }

    downloadImage() {
        if (!this.compressedBlob) return;

        const originalName = this.originalFile.name.split('.')[0];
        const format = this.compressedBlob.type.split('/')[1];
        const fileName = `${originalName}-compressed.${format}`;
        
        const url = URL.createObjectURL(this.compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    resetTool() {
        this.originalFile = null;
        this.compressedBlob = null;
        
        // Reset UI
        this.fileInput.value = '';
        this.originalPreview.src = '';
        this.compressedPreview.src = '';
        this.originalInfo.innerHTML = '';
        this.compressedInfo.innerHTML = '';
        this.compressionStats.innerHTML = '';
        this.compressionStats.classList.add('hidden');
        this.compressionControls.classList.add('hidden');
        this.previewContainer.classList.add('hidden');
        this.actionButtons.classList.add('hidden');
        
        // Reset controls
        this.qualitySlider.value = 80;
        this.qualityValue.textContent = '80';
        this.targetSize.value = '';
        this.outputFormat.value = 'original';
        this.downloadButton.disabled = true;
    }

    showError(message) {
        alert('Error: ' + message);
    }
}

// Initialize the tool when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageCompressor();
});