document.addEventListener('DOMContentLoaded', function() {
    const generatedPassword = document.getElementById('generatedPassword');
    const copyPassword = document.getElementById('copyPassword');
    const refreshPassword = document.getElementById('refreshPassword');
    const generatePassword = document.getElementById('generatePassword');
    const generatePassphrase = document.getElementById('generatePassphrase');
    const clearHistory = document.getElementById('clearHistory');
    const passwordHistory = document.getElementById('passwordHistory');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    // Options
    const passwordLength = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');
    const includeUppercase = document.getElementById('includeUppercase');
    const includeLowercase = document.getElementById('includeLowercase');
    const includeNumbers = document.getElementById('includeNumbers');
    const includeSymbols = document.getElementById('includeSymbols');
    const excludeSimilar = document.getElementById('excludeSimilar');
    const excludeAmbiguous = document.getElementById('excludeAmbiguous');

    // Advanced options
    const passwordPattern = document.getElementById('passwordPattern');
    const passphraseWords = document.getElementById('passphraseWords');
    const passphraseSeparator = document.getElementById('passphraseSeparator');

    // Character sets
    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        vowels: 'aeiou',
        consonants: 'bcdfghjklmnpqrstvwxyz'
    };

    // Similar and ambiguous characters to exclude
    const similarChars = 'il1Lo0O';
    const ambiguousChars = '{}[]()/\\\'"`~,;:.<>';

    let passwordHistoryList = StorageUtils.get('passwordHistory', []);

    // Initialize
    updateLengthDisplay();
    generateNewPassword();
    loadPasswordHistory();

    // Event listeners
    passwordLength.addEventListener('input', updateLengthDisplay);
    copyPassword.addEventListener('click', copyGeneratedPassword);
    refreshPassword.addEventListener('click', generateNewPassword);
    generatePassword.addEventListener('click', generateNewPassword);
    generatePassphrase.addEventListener('click', generateNewPassphrase);
    clearHistory.addEventListener('click', clearPasswordHistory);

    // Update options when they change
    [includeUppercase, includeLowercase, includeNumbers, includeSymbols].forEach(checkbox => {
        checkbox.addEventListener('change', validateOptions);
    });

    function updateLengthDisplay() {
        lengthValue.textContent = passwordLength.value;
    }

    function validateOptions() {
        const hasUppercase = includeUppercase.checked;
        const hasLowercase = includeLowercase.checked;
        const hasNumbers = includeNumbers.checked;
        const hasSymbols = includeSymbols.checked;

        // Ensure at least one character type is selected
        if (!hasUppercase && !hasLowercase && !hasNumbers && !hasSymbols) {
            // Auto-enable lowercase if nothing is selected
            includeLowercase.checked = true;
            UIUtils.showNotification('At least one character type must be selected', 'warning');
        }
    }

    function generateNewPassword() {
        const length = parseInt(passwordLength.value);
        const options = getGenerationOptions();
        
        let password;
        
        // Use custom pattern if provided
        if (passwordPattern.value.trim()) {
            password = generateFromPattern(passwordPattern.value);
        } else {
            password = generateRandomPassword(length, options);
        }
        
        generatedPassword.value = password;
        updatePasswordStrength(password);
        addToHistory(password);
    }

    function getGenerationOptions() {
        let charset = '';
        
        if (includeUppercase.checked) {
            let uppercase = charSets.uppercase;
            if (excludeSimilar.checked) {
                uppercase = removeChars(uppercase, similarChars);
            }
            charset += uppercase;
        }
        
        if (includeLowercase.checked) {
            let lowercase = charSets.lowercase;
            if (excludeSimilar.checked) {
                lowercase = removeChars(lowercase, similarChars);
            }
            charset += lowercase;
        }
        
        if (includeNumbers.checked) {
            let numbers = charSets.numbers;
            if (excludeSimilar.checked) {
                numbers = removeChars(numbers, similarChars);
            }
            charset += numbers;
        }
        
        if (includeSymbols.checked) {
            let symbols = charSets.symbols;
            if (excludeAmbiguous.checked) {
                symbols = removeChars(symbols, ambiguousChars);
            }
            charset += symbols;
        }
        
        return { charset };
    }

    function removeChars(source, charsToRemove) {
        return source.split('').filter(char => !charsToRemove.includes(char)).join('');
    }

    function generateRandomPassword(length, options) {
        const { charset } = options;
        
        if (!charset) {
            UIUtils.showNotification('Please select at least one character type', 'error');
            return '';
        }
        
        let password = '';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }
        
        return password;
    }

    function generateFromPattern(pattern) {
        const patternMap = {
            'C': () => getRandomChar(removeChars(charSets.uppercase, similarChars)),
            'c': () => getRandomChar(removeChars(charSets.lowercase, similarChars)),
            'V': () => getRandomChar(charSets.vowels.toUpperCase()),
            'v': () => getRandomChar(charSets.vowels),
            'A': () => getRandomChar(removeChars(charSets.uppercase + charSets.lowercase, similarChars)),
            'a': () => getRandomChar(removeChars(charSets.lowercase, similarChars)),
            '#': () => getRandomChar(removeChars(charSets.numbers, similarChars)),
            '!': () => getRandomChar(removeChars(charSets.symbols, ambiguousChars)),
            'x': () => getRandomChar(removeChars(charSets.uppercase + charSets.lowercase + charSets.numbers, similarChars)),
            '*': () => getRandomChar(removeChars(charSets.uppercase + charSets.lowercase + charSets.numbers + charSets.symbols, similarChars + ambiguousChars))
        };
        
        let password = '';
        
        for (const char of pattern) {
            if (patternMap[char]) {
                password += patternMap[char]();
            } else {
                password += char;
            }
        }
        
        return password;
    }

    function getRandomChar(charset) {
        const randomArray = new Uint32Array(1);
        window.crypto.getRandomValues(randomArray);
        return charset[randomArray[0] % charset.length];
    }

    function generateNewPassphrase() {
        const wordCount = parseInt(passphraseWords.value);
        const separator = passphraseSeparator.value || '-';
        
        const passphrase = generateRandomPassphrase(wordCount, separator);
        generatedPassword.value = passphrase;
        updatePasswordStrength(passphrase);
        addToHistory(passphrase);
    }

    function generateRandomPassphrase(wordCount, separator) {
        // Common words for passphrase (you can expand this list)
        const wordList = [
            'apple', 'brave', 'cloud', 'dance', 'earth', 'flame', 'globe', 'heart',
            'image', 'jolly', 'king', 'light', 'music', 'night', 'ocean', 'peace',
            'quiet', 'river', 'star', 'tree', 'unity', 'voice', 'water', 'xray',
            'young', 'zebra', 'alpha', 'beta', 'gamma', 'delta', 'echo', 'foxtrot',
            'hotel', 'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar',
            'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey'
        ];
        
        const words = [];
        const array = new Uint32Array(wordCount);
        window.crypto.getRandomValues(array);
        
        for (let i = 0; i < wordCount; i++) {
            words.push(wordList[array[i] % wordList.length]);
        }
        
        return words.join(separator);
    }

    function updatePasswordStrength(password) {
        let score = 0;
        
        if (!password) {
            score = 0;
        } else {
            // Length score
            if (password.length >= 8) score += 1;
            if (password.length >= 12) score += 1;
            if (password.length >= 16) score += 1;
            if (password.length >= 20) score += 1;
            
            // Character variety score
            if (/[a-z]/.test(password)) score += 1;
            if (/[A-Z]/.test(password)) score += 1;
            if (/[0-9]/.test(password)) score += 1;
            if (/[^a-zA-Z0-9]/.test(password)) score += 1;
            
            // Bonus for no repeating patterns
            if (!/(.)\1{2,}/.test(password)) score += 1;
        }
        
        // Cap score at 8
        score = Math.min(score, 8);
        
        // Update strength meter
        const percentage = (score / 8) * 100;
        strengthBar.style.width = percentage + '%';
        
        // Update strength text and color
        let strength, color;
        if (score <= 2) {
            strength = 'Very Weak';
            color = '#e74c3c';
        } else if (score <= 4) {
            strength = 'Weak';
            color = '#e67e22';
        } else if (score <= 6) {
            strength = 'Good';
            color = '#f1c40f';
        } else {
            strength = 'Strong';
            color = '#2ecc71';
        }
        
        strengthText.textContent = `Strength: ${strength}`;
        strengthBar.style.background = color;
    }

    async function copyGeneratedPassword() {
        const password = generatedPassword.value;
        if (!password) {
            UIUtils.showNotification('No password to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(password);
            UIUtils.showNotification('Password copied to clipboard!', 'success');
        } catch (err) {
            generatedPassword.select();
            document.execCommand('copy');
            UIUtils.showNotification('Password copied to clipboard!', 'success');
        }
    }

    function addToHistory(password) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            password: password,
            strength: strengthText.textContent.replace('Strength: ', '')
        };
        
        passwordHistoryList.unshift(historyItem);
        passwordHistoryList = passwordHistoryList.slice(0, 10); // Keep last 10
        StorageUtils.set('passwordHistory', passwordHistoryList);
        loadPasswordHistory();
    }

    function loadPasswordHistory() {
        passwordHistory.innerHTML = '';
        
        if (passwordHistoryList.length === 0) {
            passwordHistory.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">No password history</p>';
            return;
        }
        
        passwordHistoryList.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-password">
                    <span class="password-text">${item.password}</span>
                    <span class="password-strength-badge ${getStrengthClass(item.strength)}">${item.strength}</span>
                </div>
                <div class="history-actions">
                    <button class="history-use" data-password="${item.password}">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="history-copy" data-password="${item.password}">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;
            
            passwordHistory.appendChild(historyItem);
        });
        
        // Add event listeners
        document.querySelectorAll('.history-use').forEach(btn => {
            btn.addEventListener('click', function() {
                const password = this.getAttribute('data-password');
                generatedPassword.value = password;
                updatePasswordStrength(password);
                UIUtils.showNotification('Password loaded from history!', 'info');
            });
        });
        
        document.querySelectorAll('.history-copy').forEach(btn => {
            btn.addEventListener('click', async function() {
                const password = this.getAttribute('data-password');
                try {
                    await navigator.clipboard.writeText(password);
                    UIUtils.showNotification('Password copied to clipboard!', 'success');
                } catch (err) {
                    UIUtils.showNotification('Failed to copy password', 'error');
                }
            });
        });
    }

    function getStrengthClass(strength) {
        const strengthMap = {
            'Very Weak': 'strength-very-weak',
            'Weak': 'strength-weak',
            'Good': 'strength-good',
            'Strong': 'strength-strong'
        };
        return strengthMap[strength] || 'strength-very-weak';
    }

    function clearPasswordHistory() {
        passwordHistoryList = [];
        StorageUtils.set('passwordHistory', passwordHistoryList);
        loadPasswordHistory();
        UIUtils.showNotification('Password history cleared!', 'info');
    }
});

// Add CSS for password generator
const passwordGeneratorStyles = `
.password-display {
    margin-bottom: 2rem;
}

.password-result {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.password-result input {
    flex: 1;
    font-family: 'Courier New', monospace;
    font-size: 1.2rem;
    text-align: center;
    letter-spacing: 1px;
}

.password-strength {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.strength-meter {
    flex: 1;
    height: 8px;
    background: #e1e5e9;
    border-radius: 4px;
    overflow: hidden;
}

.strength-bar {
    height: 100%;
    width: 0%;
    transition: all 0.3s ease;
    border-radius: 4px;
}

.generator-options {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.option-checkboxes {
    display: grid;
    gap: 0.75rem;
    margin-top: 1rem;
}

.option-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background 0.3s ease;
}

.option-checkbox:hover {
    background: rgba(67, 97, 238, 0.1);
}

.option-checkbox input[type="checkbox"] {
    display: none;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #e1e5e9;
    border-radius: 4px;
    position: relative;
    transition: all 0.3s ease;
}

.option-checkbox input[type="checkbox"]:checked + .checkmark {
    background: #4361ee;
    border-color: #4361ee;
}

.option-checkbox input[type="checkbox"]:checked + .checkmark::after {
    content: '✓';
    position: absolute;
    color: white;
    font-size: 14px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.advanced-options {
    margin: 2rem 0;
    padding: 1.5rem;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
}

.advanced-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
}

.password-history {
    margin: 2rem 0;
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

.history-password {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.password-text {
    font-family: 'Courier New', monospace;
    font-weight: 500;
}

.password-strength-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
}

.strength-very-weak { background: #e74c3c; color: white; }
.strength-weak { background: #e67e22; color: white; }
.strength-good { background: #f1c40f; color: black; }
.strength-strong { background: #2ecc71; color: white; }

.history-actions {
    display: flex;
    gap: 0.25rem;
}

.password-tips {
    margin: 2rem 0;
}

.tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.tip-card {
    text-align: center;
    padding: 1.5rem;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.tip-card:hover {
    border-color: #4361ee;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.tip-card i {
    font-size: 2rem;
    color: #4361ee;
    margin-bottom: 1rem;
}

.tip-card h5 {
    margin-bottom: 0.5rem;
    color: #4361ee;
}

.tip-card p {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .password-result {
        flex-direction: column;
    }
    
    .advanced-grid {
        grid-template-columns: 1fr;
    }
    
    .history-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .history-password {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .tips-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = passwordGeneratorStyles;
document.head.appendChild(styleSheet);