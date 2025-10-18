document.addEventListener('DOMContentLoaded', function() {
    const conversionCategory = document.getElementById('conversionCategory');
    const fromValue = document.getElementById('fromValue');
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');
    const toValue = document.getElementById('toValue');
    const swapUnits = document.getElementById('swapUnits');
    const resultText = document.getElementById('resultText');
    const conversionDetails = document.getElementById('conversionDetails');
    const historyList = document.getElementById('historyList');
    const clearHistory = document.getElementById('clearHistory');
    const quickConversions = document.getElementById('quickConversions');

    // Unit definitions
    const unitCategories = {
        length: {
            name: 'Length',
            units: {
                meter: { name: 'Meters', factor: 1 },
                kilometer: { name: 'Kilometers', factor: 1000 },
                centimeter: { name: 'Centimeters', factor: 0.01 },
                millimeter: { name: 'Millimeters', factor: 0.001 },
                mile: { name: 'Miles', factor: 1609.344 },
                yard: { name: 'Yards', factor: 0.9144 },
                foot: { name: 'Feet', factor: 0.3048 },
                inch: { name: 'Inches', factor: 0.0254 }
            }
        },
        weight: {
            name: 'Weight',
            units: {
                kilogram: { name: 'Kilograms', factor: 1 },
                gram: { name: 'Grams', factor: 0.001 },
                milligram: { name: 'Milligrams', factor: 0.000001 },
                pound: { name: 'Pounds', factor: 0.453592 },
                ounce: { name: 'Ounces', factor: 0.0283495 },
                ton: { name: 'Tons', factor: 1000 }
            }
        },
        temperature: {
            name: 'Temperature',
            units: {
                celsius: { name: 'Celsius', isTemperature: true },
                fahrenheit: { name: 'Fahrenheit', isTemperature: true },
                kelvin: { name: 'Kelvin', isTemperature: true }
            }
        },
        area: {
            name: 'Area',
            units: {
                squareMeter: { name: 'Square Meters', factor: 1 },
                squareKilometer: { name: 'Square Kilometers', factor: 1000000 },
                squareMile: { name: 'Square Miles', factor: 2589988.11 },
                squareYard: { name: 'Square Yards', factor: 0.836127 },
                squareFoot: { name: 'Square Feet', factor: 0.092903 },
                squareInch: { name: 'Square Inches', factor: 0.00064516 },
                acre: { name: 'Acres', factor: 4046.86 },
                hectare: { name: 'Hectares', factor: 10000 }
            }
        },
        volume: {
            name: 'Volume',
            units: {
                liter: { name: 'Liters', factor: 1 },
                milliliter: { name: 'Milliliters', factor: 0.001 },
                cubicMeter: { name: 'Cubic Meters', factor: 1000 },
                gallon: { name: 'Gallons (US)', factor: 3.78541 },
                quart: { name: 'Quarts (US)', factor: 0.946353 },
                pint: { name: 'Pints (US)', factor: 0.473176 },
                cup: { name: 'Cups (US)', factor: 0.24 },
                fluidOunce: { name: 'Fluid Ounces (US)', factor: 0.0295735 }
            }
        },
        speed: {
            name: 'Speed',
            units: {
                meterPerSecond: { name: 'Meters/Second', factor: 1 },
                kilometerPerHour: { name: 'Kilometers/Hour', factor: 0.277778 },
                milePerHour: { name: 'Miles/Hour', factor: 0.44704 },
                knot: { name: 'Knots', factor: 0.514444 },
                footPerSecond: { name: 'Feet/Second', factor: 0.3048 }
            }
        },
        time: {
            name: 'Time',
            units: {
                second: { name: 'Seconds', factor: 1 },
                minute: { name: 'Minutes', factor: 60 },
                hour: { name: 'Hours', factor: 3600 },
                day: { name: 'Days', factor: 86400 },
                week: { name: 'Weeks', factor: 604800 },
                month: { name: 'Months', factor: 2592000 },
                year: { name: 'Years', factor: 31536000 }
            }
        },
        digital: {
            name: 'Digital Storage',
            units: {
                bit: { name: 'Bits', factor: 1 },
                byte: { name: 'Bytes', factor: 8 },
                kilobyte: { name: 'Kilobytes', factor: 8192 },
                megabyte: { name: 'Megabytes', factor: 8388608 },
                gigabyte: { name: 'Gigabytes', factor: 8589934592 },
                terabyte: { name: 'Terabytes', factor: 8796093022208 }
            }
        },
        currency: {
            name: 'Currency',
            units: {
                USD: { name: 'US Dollar', isCurrency: true },
                EUR: { name: 'Euro', isCurrency: true },
                GBP: { name: 'British Pound', isCurrency: true },
                JPY: { name: 'Japanese Yen', isCurrency: true },
                CAD: { name: 'Canadian Dollar', isCurrency: true },
                AUD: { name: 'Australian Dollar', isCurrency: true },
                INR: { name: 'Indian Rupee', isCurrency: true }
            }
        }
    };

    let conversionHistory = StorageUtils.get('conversionHistory', []);
    let exchangeRates = {};

    // Initialize
    populateCategory();
    loadConversionHistory();
    loadQuickConversions();
    updateUnits();
    performConversion();

    // Event listeners
    conversionCategory.addEventListener('change', updateUnits);
    fromValue.addEventListener('input', performConversion);
    fromUnit.addEventListener('change', performConversion);
    toUnit.addEventListener('change', performConversion);
    swapUnits.addEventListener('click', swapConversion);
    clearHistory.addEventListener('click', clearConversionHistory);

    // Fetch exchange rates for currency conversion
    if (conversionCategory.value === 'currency') {
        fetchExchangeRates();
    }

    function populateCategory() {
        // Already populated in HTML
    }

    function updateUnits() {
        const category = conversionCategory.value;
        const units = unitCategories[category].units;
        
        // Clear existing options
        fromUnit.innerHTML = '';
        toUnit.innerHTML = '';
        
        // Add units to dropdowns
        Object.keys(units).forEach(unitKey => {
            const unit = units[unitKey];
            
            const fromOption = document.createElement('option');
            fromOption.value = unitKey;
            fromOption.textContent = unit.name;
            fromUnit.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = unitKey;
            toOption.textContent = unit.name;
            toUnit.appendChild(toOption);
        });
        
        // Set sensible defaults
        if (category === 'temperature') {
            fromUnit.value = 'celsius';
            toUnit.value = 'fahrenheit';
        } else if (category === 'currency') {
            fromUnit.value = 'USD';
            toUnit.value = 'EUR';
            fetchExchangeRates();
        } else {
            // Set first unit as from, second as to
            const unitKeys = Object.keys(units);
            fromUnit.value = unitKeys[0];
            toUnit.value = unitKeys[1] || unitKeys[0];
        }
        
        performConversion();
    }

    async function fetchExchangeRates() {
        try {
            // Using a free exchange rate API (example using exchangerate-api.com)
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            exchangeRates = data.rates;
            performConversion();
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            // Fallback to hardcoded rates
            exchangeRates = {
                USD: 1,
                EUR: 0.85,
                GBP: 0.73,
                JPY: 110.0,
                CAD: 1.25,
                AUD: 1.35,
                INR: 74.0
            };
            performConversion();
        }
    }

    function performConversion() {
        const category = conversionCategory.value;
        const fromUnitKey = fromUnit.value;
        const toUnitKey = toUnit.value;
        const inputValue = parseFloat(fromValue.value) || 0;
        
        if (fromUnitKey === toUnitKey) {
            toValue.value = inputValue;
            displayResult(inputValue, inputValue, category, fromUnitKey, toUnitKey);
            return;
        }
        
        let result;
        
        if (category === 'temperature') {
            result = convertTemperature(inputValue, fromUnitKey, toUnitKey);
        } else if (category === 'currency') {
            result = convertCurrency(inputValue, fromUnitKey, toUnitKey);
        } else {
            result = convertStandard(inputValue, fromUnitKey, toUnitKey, category);
        }
        
        toValue.value = result.toFixed(6);
        displayResult(inputValue, result, category, fromUnitKey, toUnitKey);
        addToHistory(inputValue, result, category, fromUnitKey, toUnitKey);
    }

    function convertStandard(value, fromUnit, toUnit, category) {
        const units = unitCategories[category].units;
        const fromFactor = units[fromUnit].factor;
        const toFactor = units[toUnit].factor;
        
        // Convert to base unit first, then to target unit
        const baseValue = value * fromFactor;
        return baseValue / toFactor;
    }

    function convertTemperature(value, fromUnit, toUnit) {
        // Convert to Celsius first
        let celsius;
        
        switch (fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
        }
        
        // Convert from Celsius to target unit
        switch (toUnit) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return (celsius * 9/5) + 32;
            case 'kelvin':
                return celsius + 273.15;
        }
    }

    function convertCurrency(value, fromCurrency, toCurrency) {
        if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
            return value;
        }
        
        // Convert to USD first, then to target currency
        const usdValue = value / exchangeRates[fromCurrency];
        return usdValue * exchangeRates[toCurrency];
    }

    function displayResult(fromValue, toValue, category, fromUnit, toUnit) {
        const fromUnitName = unitCategories[category].units[fromUnit].name;
        const toUnitName = unitCategories[category].units[toUnit].name;
        
        resultText.innerHTML = `
            <strong>${fromValue} ${fromUnitName}</strong> = 
            <strong style="color: #4361ee;">${parseFloat(toValue.toFixed(6))} ${toUnitName}</strong>
        `;
        
        // Show conversion formula for common conversions
        let formula = '';
        if (category === 'temperature') {
            if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
                formula = `Formula: °F = (°C × 9/5) + 32`;
            } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
                formula = `Formula: °C = (°F - 32) × 5/9`;
            }
        }
        
        conversionDetails.innerHTML = formula ? `<p style="color: #666; font-style: italic;">${formula}</p>` : '';
    }

    function swapConversion() {
        const tempUnit = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = tempUnit;
        performConversion();
    }

    function addToHistory(fromValue, toValue, category, fromUnit, toUnit) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            category: category,
            fromValue: fromValue,
            fromUnit: fromUnit,
            toValue: toValue,
            toUnit: toUnit
        };
        
        conversionHistory.unshift(historyItem);
        conversionHistory = conversionHistory.slice(0, 10); // Keep only last 10
        StorageUtils.set('conversionHistory', conversionHistory);
        loadConversionHistory();
    }

    function loadConversionHistory() {
        historyList.innerHTML = '';
        
        if (conversionHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">No conversion history yet.</p>';
            return;
        }
        
        conversionHistory.forEach(item => {
            const fromUnitName = unitCategories[item.category].units[item.fromUnit].name;
            const toUnitName = unitCategories[item.category].units[item.toUnit].name;
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-content">
                    <strong>${item.fromValue} ${fromUnitName}</strong> → 
                    <strong style="color: #4361ee;">${parseFloat(item.toValue.toFixed(6))} ${toUnitName}</strong>
                </div>
                <div class="history-category">${unitCategories[item.category].name}</div>
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
                useHistoryItem(item);
            });
        });
    }

    function useHistoryItem(item) {
        conversionCategory.value = item.category;
        updateUnits();
        fromValue.value = item.fromValue;
        fromUnit.value = item.fromUnit;
        toUnit.value = item.toUnit;
        performConversion();
    }

    function clearConversionHistory() {
        conversionHistory = [];
        StorageUtils.set('conversionHistory', conversionHistory);
        loadConversionHistory();
        UIUtils.showNotification('Conversion history cleared!', 'info');
    }

    function loadQuickConversions() {
        const quickConversionsList = [
            { from: '1 kilometer', to: '0.621371 miles', category: 'length' },
            { from: '1 meter', to: '3.28084 feet', category: 'length' },
            { from: '1 kilogram', to: '2.20462 pounds', category: 'weight' },
            { from: '1 liter', to: '0.264172 gallons', category: 'volume' },
            { from: '1 celsius', to: '33.8 fahrenheit', category: 'temperature' },
            { from: '1 square meter', to: '10.7639 square feet', category: 'area' },
            { from: '1 kilometer/hour', to: '0.621371 miles/hour', category: 'speed' },
            { from: '1 megabyte', to: '1024 kilobytes', category: 'digital' }
        ];
        
        quickConversions.innerHTML = '';
        
        quickConversionsList.forEach(conv => {
            const quickItem = document.createElement('div');
            quickItem.className = 'quick-item';
            quickItem.innerHTML = `
                <div class="quick-from">${conv.from}</div>
                <div class="quick-arrow">→</div>
                <div class="quick-to">${conv.to}</div>
            `;
            quickItem.addEventListener('click', () => {
                // Set the category and trigger conversion
                conversionCategory.value = conv.category;
                updateUnits();
                fromValue.value = 1;
                performConversion();
            });
            quickConversions.appendChild(quickItem);
        });
    }
});

// Add CSS for unit converter
const unitConverterStyles = `
.unit-converter {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: end;
}

.unit-converter input, .unit-converter select {
    width: 100%;
}

.swap-btn {
    background: transparent;
    border: 2px solid #4361ee;
    color: #4361ee;
    padding: 0.75rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
}

.swap-btn:hover {
    background: #4361ee;
    color: white;
}

.result-text {
    font-size: 1.2rem;
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin: 1rem 0;
}

.conversion-details {
    text-align: center;
    margin-top: 1rem;
}

.history-list {
    max-height: 300px;
    overflow-y: auto;
    margin: 1rem 0;
}

.history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
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

.history-category {
    background: #f8f9fa;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    color: #666;
    margin: 0 1rem;
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

.quick-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.quick-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.quick-item:hover {
    border-color: #4361ee;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.quick-from, .quick-to {
    font-weight: 500;
}

.quick-arrow {
    color: #4361ee;
    font-weight: bold;
}

@media (max-width: 768px) {
    .unit-converter {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
    
    .swap-btn {
        order: 3;
        margin: 0.5rem 0;
    }
    
    .history-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .history-category {
        margin: 0;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = unitConverterStyles;
document.head.appendChild(styleSheet);