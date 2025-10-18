document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    const colorInput = document.getElementById('colorInput');
    const applyColor = document.getElementById('applyColor');
    const colorPreview = document.getElementById('colorPreview');
    const colorFormats = document.getElementById('colorFormats');
    const colorHistory = document.getElementById('colorHistory');
    const copyHex = document.getElementById('copyHex');
    const copyRGB = document.getElementById('copyRGB');
    const copyHSL = document.getElementById('copyHSL');
    const generatePalette = document.getElementById('generatePalette');
    const colorPalette = document.getElementById('colorPalette');
    const paletteColors = document.getElementById('paletteColors');

    let currentColor = '#4361ee';
    let history = StorageUtils.get('colorHistory', []);

    // Initialize
    updateColorDisplay(currentColor);
    loadColorHistory();

    // Event listeners
    colorPicker.addEventListener('input', function() {
        currentColor = this.value;
        updateColorDisplay(currentColor);
        addToHistory(currentColor);
    });

    applyColor.addEventListener('click', applyCustomColor);
    colorInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') applyCustomColor();
    });

    copyHex.addEventListener('click', () => copyColorFormat('hex'));
    copyRGB.addEventListener('click', () => copyColorFormat('rgb'));
    copyHSL.addEventListener('click', () => copyColorFormat('hsl'));
    generatePalette.addEventListener('click', generateColorPalette);

    function applyCustomColor() {
        const input = colorInput.value.trim();
        if (!input) {
            UIUtils.showNotification('Please enter a color value', 'warning');
            return;
        }

        let color = parseColor(input);
        if (color) {
            currentColor = color;
            colorPicker.value = color;
            updateColorDisplay(color);
            addToHistory(color);
            colorInput.value = '';
        } else {
            UIUtils.showNotification('Invalid color format. Use HEX, RGB, or HSL.', 'error');
        }
    }

    function parseColor(input) {
        // HEX format
        if (input.startsWith('#')) {
            if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(input)) {
                return input.length === 4 ? `#${input[1]}${input[1]}${input[2]}${input[2]}${input[3]}${input[3]}` : input;
            }
        }

        // RGB format
        const rgbMatch = input.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                return rgbToHex(r, g, b);
            }
        }

        // HSL format
        const hslMatch = input.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i);
        if (hslMatch) {
            const h = parseInt(hslMatch[1]);
            const s = parseInt(hslMatch[2]);
            const l = parseInt(hslMatch[3]);
            if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
                return hslToHex(h, s, l);
            }
        }

        return null;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (h >= 0 && h < 60) {
            [r, g, b] = [c, x, 0];
        } else if (h >= 60 && h < 120) {
            [r, g, b] = [x, c, 0];
        } else if (h >= 120 && h < 180) {
            [r, g, b] = [0, c, x];
        } else if (h >= 180 && h < 240) {
            [r, g, b] = [0, x, c];
        } else if (h >= 240 && h < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return rgbToHex(r, g, b);
    }

    function updateColorDisplay(color) {
        colorPreview.style.backgroundColor = color;
        
        const rgb = hexToRgb(color);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        colorFormats.innerHTML = `
            <div class="color-format">
                <strong>HEX:</strong> <span class="color-value">${color.toUpperCase()}</span>
            </div>
            <div class="color-format">
                <strong>RGB:</strong> <span class="color-value">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</span>
            </div>
            <div class="color-format">
                <strong>HSL:</strong> <span class="color-value">hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</span>
            </div>
        `;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function addToHistory(color) {
        // Remove if already exists
        history = history.filter(c => c !== color);
        
        // Add to beginning
        history.unshift(color);
        
        // Keep only last 10 colors
        history = history.slice(0, 10);
        
        // Save to storage
        StorageUtils.set('colorHistory', history);
        
        // Update display
        loadColorHistory();
    }

    function loadColorHistory() {
        colorHistory.innerHTML = '';
        
        history.forEach(color => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-color" style="background-color: ${color}"></div>
                <span class="history-value">${color.toUpperCase()}</span>
            `;
            historyItem.addEventListener('click', () => {
                currentColor = color;
                colorPicker.value = color;
                updateColorDisplay(color);
            });
            colorHistory.appendChild(historyItem);
        });
    }

    async function copyColorFormat(format) {
        let textToCopy = '';
        
        switch (format) {
            case 'hex':
                textToCopy = currentColor.toUpperCase();
                break;
            case 'rgb':
                const rgb = hexToRgb(currentColor);
                textToCopy = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                break;
            case 'hsl':
                const rgb2 = hexToRgb(currentColor);
                const hsl = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);
                textToCopy = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
                break;
        }
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            UIUtils.showNotification(`${format.toUpperCase()} value copied!`, 'success');
        } catch (err) {
            UIUtils.showNotification('Failed to copy color value', 'error');
        }
    }

    function generateColorPalette() {
        const baseColor = hexToRgb(currentColor);
        const hsl = rgbToHsl(baseColor.r, baseColor.g, baseColor.b);
        
        const palette = [
            // Monochromatic
            adjustHsl(hsl, 0, 0, -30),
            adjustHsl(hsl, 0, 0, -15),
            hsl, // Base color
            adjustHsl(hsl, 0, 0, 15),
            adjustHsl(hsl, 0, 0, 30),
            
            // Analogous
            adjustHsl(hsl, -30, 0, 0),
            adjustHsl(hsl, -15, 0, 0),
            adjustHsl(hsl, 15, 0, 0),
            adjustHsl(hsl, 30, 0, 0),
            
            // Complementary
            adjustHsl(hsl, 180, 0, 0)
        ];
        
        paletteColors.innerHTML = '';
        
        palette.forEach(hslColor => {
            const hex = hslToHex(hslColor.h, hslColor.s, hslColor.l);
            const paletteItem = document.createElement('div');
            paletteItem.className = 'palette-item';
            paletteItem.innerHTML = `
                <div class="palette-color" style="background-color: ${hex}"></div>
                <span class="palette-value">${hex.toUpperCase()}</span>
            `;
            paletteItem.addEventListener('click', () => {
                currentColor = hex;
                colorPicker.value = hex;
                updateColorDisplay(hex);
            });
            paletteColors.appendChild(paletteItem);
        });
        
        colorPalette.classList.remove('hidden');
        UIUtils.showNotification('Color palette generated!', 'success');
    }

    function adjustHsl(hsl, hDelta, sDelta, lDelta) {
        return {
            h: Math.max(0, Math.min(360, hsl.h + hDelta)),
            s: Math.max(0, Math.min(100, hsl.s + sDelta)),
            l: Math.max(0, Math.min(100, hsl.l + lDelta))
        };
    }
});

// Add CSS for color history and palette
const colorPickerStyles = `
.history-grid, .palette-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
    margin-top: 1rem;
}

.history-item, .palette-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #e1e5e9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.history-item:hover, .palette-item:hover {
    border-color: #4361ee;
    transform: translateY(-2px);
}

.history-color, .palette-color {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.history-value, .palette-value {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
}

.color-display {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    margin: 1rem 0;
}

.color-info {
    flex: 1;
}

.color-format {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 4px;
}

.color-value {
    font-family: 'Courier New', monospace;
    background: white;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    border: 1px solid #e1e5e9;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = colorPickerStyles;
document.head.appendChild(styleSheet);