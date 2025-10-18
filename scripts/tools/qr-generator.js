// QR Code Generator with enhanced functionality and error handling
class QRCodeGenerator {
    constructor() {
        this.currentSize = 300;
        this.errorCorrectionLevel = 'M';
        this.fgColor = '#000000';
        this.bgColor = '#FFFFFF';
        this.qrcode = null;
        this.currentData = '';

        // Check if QRCode library is available
        if (typeof QRCode === 'undefined') {
            console.error('QRCode.js library not loaded');
            this.showLibraryError();
            return;
        }

        this.initializeElements();
        this.attachEventListeners();
        this.setupRealTimeGeneration();
    }

    initializeElements() {
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');

        // Input elements
        this.textInput = document.getElementById('text-input');
        this.wifiSSID = document.getElementById('wifi-ssid');
        this.wifiPassword = document.getElementById('wifi-password');
        this.wifiSecurity = document.getElementById('wifi-security');
        this.wifiHidden = document.getElementById('wifi-hidden');
        this.emailAddress = document.getElementById('email-address');
        this.emailSubject = document.getElementById('email-subject');
        this.emailBody = document.getElementById('email-body');
        this.phoneNumber = document.getElementById('phone-number');
        this.smsNumber = document.getElementById('sms-number');
        this.smsMessage = document.getElementById('sms-message');

        // Customization elements
        this.sizeSlider = document.getElementById('size-slider');
        this.sizeValue = document.getElementById('size-value');
        this.fgColorInput = document.getElementById('fg-color');
        this.bgColorInput = document.getElementById('bg-color');
        this.errorLevelBtns = document.querySelectorAll('.error-level-btn');

        // Action elements
        this.generateBtn = document.getElementById('generate-btn');
        this.downloadPngBtn = document.getElementById('download-png');
        this.downloadSvgBtn = document.getElementById('download-svg');
        this.qrDisplay = document.getElementById('qr-display');
        this.downloadOptions = document.getElementById('download-options');
        this.qrPlaceholder = document.querySelector('.qr-placeholder');
    }

    attachEventListeners() {
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Size slider
        this.sizeSlider.addEventListener('input', (e) => {
            this.currentSize = parseInt(e.target.value);
            this.sizeValue.textContent = `${this.currentSize}px`;
            this.debouncedRegenerate();
        });

        // Color inputs
        [this.fgColorInput, this.bgColorInput].forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target === this.fgColorInput) this.fgColor = e.target.value;
                if (e.target === this.bgColorInput) this.bgColor = e.target.value;
                this.debouncedRegenerate();
            });
        });

        // Error correction level
        this.errorLevelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.errorLevelBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.errorCorrectionLevel = e.target.dataset.level;
                this.debouncedRegenerate();
            });
        });

        // Generate button
        this.generateBtn.addEventListener('click', () => this.generateQRCode());

        // Download buttons
        this.downloadPngBtn.addEventListener('click', () => this.downloadPNG());
        this.downloadSvgBtn.addEventListener('click', () => this.downloadSVG());

        // Theme toggle
        this.initTheme();

        // Input validation
        this.setupInputValidation();
    }

    setupRealTimeGeneration() {
        // Debounce function to prevent excessive regeneration
        this.debouncedRegenerate = this.debounce(() => {
            if (this.currentData) {
                this.generateQRCode();
            }
        }, 500);

        // Add input listeners for real-time generation
        const inputs = [
            this.textInput, this.wifiSSID, this.wifiPassword, 
            this.emailAddress, this.emailSubject, this.emailBody,
            this.phoneNumber, this.smsNumber, this.smsMessage
        ];

        inputs.forEach(input => {
            if (input) {
                input.addEventListener('input', this.debouncedRegenerate);
            }
        });

        // Select and checkbox listeners
        [this.wifiSecurity, this.wifiHidden].forEach(element => {
            if (element) {
                element.addEventListener('change', this.debouncedRegenerate);
            }
        });
    }

    setupInputValidation() {
        // Phone number validation
        if (this.phoneNumber) {
            this.phoneNumber.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^\d+-\s]/g, '');
            });
        }

        if (this.smsNumber) {
            this.smsNumber.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^\d+-\s]/g, '');
            });
        }

        // Email validation
        if (this.emailAddress) {
            this.emailAddress.addEventListener('blur', (e) => {
                const email = e.target.value;
                if (email && !this.isValidEmail(email)) {
                    this.showInputError(e.target, 'Please enter a valid email address');
                } else {
                    this.clearInputError(e.target);
                }
            });
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showInputError(input, message) {
        this.clearInputError(input);
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem;';
        input.parentNode.appendChild(errorDiv);
    }

    clearInputError(input) {
        input.classList.remove('error');
        const existingError = input.parentNode.querySelector('.input-error');
        if (existingError) {
            existingError.remove();
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showLibraryError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;';
        errorDiv.innerHTML = `
            <strong>Error:</strong> QRCode.js library not loaded. 
            Please include the library in your HTML:
            <code>&lt;script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"&gt;&lt;/script&gt;</code>
        `;
        
        const container = this.qrDisplay || document.body;
        container.appendChild(errorDiv);
    }

    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');

        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');

            if (sunIcon && moonIcon) {
                if (isDark) {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                    localStorage.setItem('theme', 'dark');
                } else {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                    localStorage.setItem('theme', 'light');
                }
            }
        });
    }

    switchTab(tabName) {
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // Regenerate QR code if we have data
        if (this.currentData) {
            this.debouncedRegenerate();
        }
    }

    getCurrentTabData() {
        const activeTab = document.querySelector('.tab-button.active').dataset.tab;

        switch(activeTab) {
            case 'text':
                return this.textInput.value || '';

            case 'wifi':
                const ssid = this.wifiSSID.value;
                const password = this.wifiPassword.value;
                const security = this.wifiSecurity.value;
                const hidden = this.wifiHidden.checked ? 'true' : 'false';

                if (!ssid.trim()) return '';

                // WiFi QR code format: WIFI:T:WPA;S:mynetwork;P:mypass;H:false;;
                return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;

            case 'email':
                const email = this.emailAddress.value.trim();
                if (!email) return '';

                const subject = this.emailSubject.value;
                const body = this.emailBody.value;
                let mailto = `mailto:${encodeURIComponent(email)}`;

                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);

                if (params.length > 0) {
                    mailto += '?' + params.join('&');
                }

                return mailto;

            case 'phone':
                const phone = this.phoneNumber.value.trim();
                return phone ? `tel:${phone}` : '';

            case 'sms':
                const smsNum = this.smsNumber.value.trim();
                if (!smsNum) return '';

                const smsMsg = this.smsMessage.value;
                // SMS format: sms:number?body=message
                return smsMsg ? `sms:${smsNum}?body=${encodeURIComponent(smsMsg)}` : `sms:${smsNum}`;

            default:
                return '';
        }
    }

    validateData(data) {
        if (!data.trim()) {
            return { isValid: false, message: 'Please enter some data to generate a QR code' };
        }

        // Check data length limits for QR codes
        const maxLength = {
            'L': 2953, // Low error correction
            'M': 2331, // Medium
            'Q': 1663, // Quality
            'H': 1273  // High
        }[this.errorCorrectionLevel];

        if (data.length > maxLength) {
            return { 
                isValid: false, 
                message: `Data too long for selected error correction level. Maximum ${maxLength} characters.` 
            };
        }

        return { isValid: true };
    }

    generateQRCode() {
        const data = this.getCurrentTabData();
        this.currentData = data;

        const validation = this.validateData(data);
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }

        try {
            // Hide placeholder
            if (this.qrPlaceholder) {
                this.qrPlaceholder.style.display = 'none';
            }

            // Clear previous QR code
            this.clearPreviousQR();

            // Create container for QR code
            const qrContainer = document.createElement('div');
            qrContainer.id = 'qr-output';
            qrContainer.style.cssText = `
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 1rem;
                background: white;
                border-radius: 0.5rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            `;

            // Add accessibility
            qrContainer.setAttribute('role', 'img');
            qrContainer.setAttribute('aria-label', 'Generated QR Code');

            this.qrDisplay.appendChild(qrContainer);

            // Map error correction levels
            const correctionLevelMap = {
                'L': QRCode.CorrectLevel.L,
                'M': QRCode.CorrectLevel.M,
                'Q': QRCode.CorrectLevel.Q,
                'H': QRCode.CorrectLevel.H
            };

            // Generate QR code using qrcode.js
            this.qrcode = new QRCode(qrContainer, {
                text: data,
                width: this.currentSize,
                height: this.currentSize,
                colorDark: this.fgColor,
                colorLight: this.bgColor,
                correctLevel: correctionLevelMap[this.errorCorrectionLevel]
            });

            // Show download options
            this.downloadOptions.style.display = 'flex';

            // Scroll to QR code
            qrContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (error) {
            console.error('QR Code generation failed:', error);
            alert('Failed to generate QR code. Please try again.');
        }
    }

    clearPreviousQR() {
        const existingQR = document.getElementById('qr-output');
        if (existingQR) {
            existingQR.remove();
        }

        // Clean up QRCode instance
        if (this.qrcode) {
            this.qrcode.clear();
            this.qrcode = null;
        }
    }

    downloadPNG() {
        if (!this.qrcode) {
            alert('Please generate a QR code first');
            return;
        }

        try {
            const qrOutput = document.querySelector('#qr-output img') || document.querySelector('#qr-output canvas');

            if (!qrOutput) {
                throw new Error('QR code element not found');
            }

            let dataUrl;

            if (qrOutput.tagName === 'IMG') {
                dataUrl = qrOutput.src;
            } else if (qrOutput.tagName === 'CANVAS') {
                dataUrl = qrOutput.toDataURL('image/png');
            } else {
                throw new Error('Unsupported QR code element');
            }

            const link = document.createElement('a');
            link.download = `qrcode-${new Date().getTime()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('PNG download failed:', error);
            alert('Failed to download PNG. Please try again.');
        }
    }

    downloadSVG() {
        if (!this.qrcode) {
            alert('Please generate a QR code first');
            return;
        }

        try {
            // Get the canvas element
            const canvas = document.querySelector('#qr-output canvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }

            // Create a proper vector SVG
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, this.currentSize, this.currentSize);
            const data = imageData.data;

            // Create SVG path data
            let pathData = '';
            const moduleSize = Math.max(1, this.currentSize / Math.sqrt(data.length / 4));

            for (let y = 0; y < this.currentSize; y += moduleSize) {
                for (let x = 0; x < this.currentSize; x += moduleSize) {
                    const index = (y * this.currentSize + x) * 4;
                    // Check if pixel is dark (QR code module)
                    if (data[index] < 128) { // Dark module
                        pathData += ` M${x},${y} h${moduleSize} v${moduleSize} h-${moduleSize} z`;
                    }
                }
            }

            const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${this.currentSize}" height="${this.currentSize}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${this.bgColor}"/>
    <path d="${pathData}" fill="${this.fgColor}"/>
</svg>`;

            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.download = `qrcode-${new Date().getTime()}.svg`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);

        } catch (error) {
            console.error('SVG download failed:', error);
            alert('Failed to download SVG. Please try again.');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load QRCode.js library if not already loaded
    if (typeof QRCode === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
        script.onload = () => new QRCodeGenerator();
        script.onerror = () => console.error('Failed to load QRCode.js library');
        document.head.appendChild(script);
    } else {
        new QRCodeGenerator();
    }
});