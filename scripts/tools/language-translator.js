document.addEventListener('DOMContentLoaded', function() {
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const swapLanguages = document.getElementById('swapLanguages');
    const sourceText = document.getElementById('sourceText');
    const translatedText = document.getElementById('translatedText');
    const translateBtn = document.getElementById('translateBtn');
    const clearSource = document.getElementById('clearSource');
    const copyTranslation = document.getElementById('copyTranslation');
    const speakSource = document.getElementById('speakSource');
    const speakTranslation = document.getElementById('speakTranslation');
    const detectLang = document.getElementById('detectLang');
    const saveTranslation = document.getElementById('saveTranslation');
    const clearHistory = document.getElementById('clearHistory');
    const charCount = document.getElementById('charCount');
    const translationInfo = document.getElementById('translationInfo');
    const sourceLangName = document.getElementById('sourceLangName');
    const targetLangName = document.getElementById('targetLangName');
    const historyList = document.getElementById('historyList');
    const commonPhrases = document.getElementById('commonPhrases');

    // Language names for display
    const languageNames = {
        'auto': 'Auto-detect',
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ar': 'Arabic',
        'hi': 'Hindi'
    };

    let translationHistory = StorageUtils.get('translationHistory', []);
    let speechSynthesis = window.speechSynthesis;

    // Initialize
    updateLanguageNames();
    loadTranslationHistory();
    loadCommonPhrases();
    setupEventListeners();

    function setupEventListeners() {
        sourceLang.addEventListener('change', updateLanguageNames);
        targetLang.addEventListener('change', updateLanguageNames);
        swapLanguages.addEventListener('click', swapLanguageDirections);
        translateBtn.addEventListener('click', performTranslation);
        clearSource.addEventListener('click', clearSourceText);
        copyTranslation.addEventListener('click', copyTranslatedText);
        speakSource.addEventListener('click', speakSourceText);
        speakTranslation.addEventListener('click', speakTranslatedText);
        detectLang.addEventListener('click', detectLanguage);
        saveTranslation.addEventListener('click', saveCurrentTranslation);
        clearHistory.addEventListener('click', clearTranslationHistory);
        sourceText.addEventListener('input', updateCharCount);
    }

    function updateLanguageNames() {
        sourceLangName.textContent = languageNames[sourceLang.value];
        targetLangName.textContent = languageNames[targetLang.value];
    }

    function updateCharCount() {
        const count = sourceText.value.length;
        charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    }

    function swapLanguageDirections() {
        const currentSource = sourceLang.value;
        const currentTarget = targetLang.value;
        
        // Don't swap if source is auto-detect
        if (currentSource !== 'auto') {
            sourceLang.value = currentTarget;
            targetLang.value = currentSource;
        } else {
            targetLang.value = currentTarget === 'en' ? 'es' : 'en';
        }
        
        updateLanguageNames();
        
        // Also swap text if both fields have content
        if (sourceText.value && translatedText.value) {
            const temp = sourceText.value;
            sourceText.value = translatedText.value;
            translatedText.value = temp;
        }
    }

    async function performTranslation() {
        const text = sourceText.value.trim();
        if (!text) {
            UIUtils.showNotification('Please enter text to translate', 'warning');
            return;
        }

        if (text.length > 5000) {
            UIUtils.showNotification('Text too long. Please limit to 5000 characters.', 'error');
            return;
        }

        UIUtils.showLoading(translateBtn);
        translationInfo.textContent = 'Translating...';

        try {
            // For frontend-only implementation, we'll use a mock translation
            // In a real implementation, you'd use a translation API
            const translation = await mockTranslate(text, sourceLang.value, targetLang.value);
            
            translatedText.value = translation;
            translationInfo.textContent = 'Translation complete';
            
            // Add to history
            addToHistory(text, translation, sourceLang.value, targetLang.value);
            
            UIUtils.showNotification('Translation completed!', 'success');
            
        } catch (error) {
            console.error('Translation error:', error);
            translationInfo.textContent = 'Translation failed';
            UIUtils.showNotification('Error translating text', 'error');
        } finally {
            translateBtn.innerHTML = '<i class="fas fa-language"></i> Translate';
        }
    }

    async function mockTranslate(text, sourceLang, targetLang) {
        // Mock translation - in a real app, you'd use a translation API
        // This is a simple demonstration with a few common phrases
        
        const commonTranslations = {
            'hello': {
                'es': 'hola',
                'fr': 'bonjour',
                'de': 'hallo',
                'it': 'ciao',
                'pt': 'olá',
                'ru': 'привет',
                'zh': '你好',
                'ja': 'こんにちは',
                'ko': '안녕하세요',
                'ar': 'مرحبا',
                'hi': 'नमस्ते'
            },
            'thank you': {
                'es': 'gracias',
                'fr': 'merci',
                'de': 'danke',
                'it': 'grazie',
                'pt': 'obrigado',
                'ru': 'спасибо',
                'zh': '谢谢',
                'ja': 'ありがとう',
                'ko': '감사합니다',
                'ar': 'شكرا',
                'hi': 'धन्यवाद'
            },
            'goodbye': {
                'es': 'adiós',
                'fr': 'au revoir',
                'de': 'auf wiedersehen',
                'it': 'arrivederci',
                'pt': 'adeus',
                'ru': 'до свидания',
                'zh': '再见',
                'ja': 'さようなら',
                'ko': '안녕',
                'ar': 'مع السلامة',
                'hi': 'अलविदा'
            }
        };

        // Check if it's a common phrase
        const lowerText = text.toLowerCase().trim();
        if (commonTranslations[lowerText] && commonTranslations[lowerText][targetLang]) {
            return commonTranslations[lowerText][targetLang];
        }

        // Simple word-by-word mock translation for demonstration
        const words = text.split(' ');
        const translatedWords = words.map(word => {
            // Add a mock translation marker to show it's simulated
            return `[${word}]`;
        });

        return translatedWords.join(' ') + ` (Mock translation from ${languageNames[sourceLang]} to ${languageNames[targetLang]})`;
    }

    function clearSourceText() {
        sourceText.value = '';
        translatedText.value = '';
        charCount.textContent = '0 characters';
        translationInfo.textContent = '';
        UIUtils.showNotification('Text cleared!', 'info');
    }

    async function copyTranslatedText() {
        if (!translatedText.value.trim()) {
            UIUtils.showNotification('No translation to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(translatedText.value);
            UIUtils.showNotification('Translation copied to clipboard!', 'success');
        } catch (err) {
            translatedText.select();
            document.execCommand('copy');
            UIUtils.showNotification('Translation copied to clipboard!', 'success');
        }
    }

    function speakSourceText() {
        const text = sourceText.value.trim();
        if (!text) {
            UIUtils.showNotification('No text to speak', 'warning');
            return;
        }

        speakText(text, sourceLang.value);
    }

    function speakTranslatedText() {
        const text = translatedText.value.trim();
        if (!text) {
            UIUtils.showNotification('No translation to speak', 'warning');
            return;
        }

        speakText(text, targetLang.value);
    }

    function speakText(text, lang) {
        if (!speechSynthesis) {
            UIUtils.showNotification('Text-to-speech not supported in your browser', 'error');
            return;
        }

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getSpeechLangCode(lang);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
            UIUtils.showNotification('Speaking...', 'info');
        };

        utterance.onend = () => {
            // Speech completed
        };

        utterance.onerror = (event) => {
            console.error('Speech error:', event);
            UIUtils.showNotification('Error with text-to-speech', 'error');
        };

        speechSynthesis.speak(utterance);
    }

    function getSpeechLangCode(lang) {
        const langMap = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'ar': 'ar-SA',
            'hi': 'hi-IN'
        };
        return langMap[lang] || 'en-US';
    }

    function detectLanguage() {
        const text = sourceText.value.trim();
        if (!text) {
            UIUtils.showNotification('Please enter text to detect language', 'warning');
            return;
        }

        // Simple language detection based on common words
        const detectedLang = simpleLanguageDetection(text);
        sourceLang.value = detectedLang;
        updateLanguageNames();
        
        UIUtils.showNotification(`Detected language: ${languageNames[detectedLang]}`, 'success');
    }

    function simpleLanguageDetection(text) {
        const lowerText = text.toLowerCase();
        
        // Common words for different languages
        const languagePatterns = {
            'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'su'],
            'fr': ['le', 'la', 'de', 'et', 'à', 'en', 'un', 'est', 'que', 'pour', 'dans', 'il', 'elle', 'on'],
            'de': ['der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'mit', 'sich', 'des', 'ist', 'im', 'dem'],
            'it': ['il', 'la', 'di', 'e', 'in', 'un', 'che', 'per', 'sono', 'con', 'non', 'su', 'dal', 'alla'],
            'pt': ['o', 'a', 'de', 'e', 'em', 'um', 'para', 'com', 'não', 'uma', 'os', 'as', 'se', 'pelo'],
            'ru': ['и', 'в', 'не', 'на', 'я', 'он', 'что', 'то', 'с', 'как', 'а', 'по', 'это', 'но'],
            'zh': ['的', '一', '是', '在', '不', '了', '有', '和', '人', '这', '中', '大', '为', '上'],
            'ja': ['の', 'に', 'は', 'を', 'た', 'で', 'が', 'と', 'し', 'れ', 'さ', 'ある', 'い', 'も'],
            'ko': ['이', '가', '을', '를', '은', '는', '에', '에서', '으로', '와', '과', '하고', '이다', '있다'],
            'ar': ['في', 'من', 'على', 'أن', 'ما', 'هو', 'هي', 'إلى', 'كان', 'لا', 'إن', 'هذا', 'ذلك', 'كل'],
            'hi': ['की', 'के', 'में', 'है', 'और', 'से', 'को', 'यह', 'इस', 'वह', 'नहीं', 'तो', 'हैं', 'था']
        };

        let maxMatches = 0;
        let detectedLang = 'en'; // Default to English

        for (const [lang, words] of Object.entries(languagePatterns)) {
            let matches = 0;
            words.forEach(word => {
                if (lowerText.includes(word)) {
                    matches++;
                }
            });
            
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedLang = lang;
            }
        }

        return detectedLang;
    }

    function addToHistory(sourceText, translatedText, sourceLang, targetLang) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            sourceText: sourceText,
            translatedText: translatedText,
            sourceLang: sourceLang,
            targetLang: targetLang
        };
        
        translationHistory.unshift(historyItem);
        translationHistory = translationHistory.slice(0, 20); // Keep last 20 items
        StorageUtils.set('translationHistory', translationHistory);
        loadTranslationHistory();
    }

    function loadTranslationHistory() {
        historyList.innerHTML = '';
        
        if (translationHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">No translation history</p>';
            return;
        }
        
        translationHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-content">
                    <div class="history-source">${StringUtils.truncate(item.sourceText, 50)}</div>
                    <div class="history-translation">${StringUtils.truncate(item.translatedText, 50)}</div>
                    <div class="history-languages">
                        ${languageNames[item.sourceLang]} → ${languageNames[item.targetLang]}
                    </div>
                </div>
                <div class="history-actions">
                    <button class="history-use" data-item='${JSON.stringify(item)}'>
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
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
        sourceLang.value = item.sourceLang;
        targetLang.value = item.targetLang;
        sourceText.value = item.sourceText;
        translatedText.value = item.translatedText;
        updateLanguageNames();
        updateCharCount();
        UIUtils.showNotification('Translation loaded from history!', 'info');
    }

    function saveCurrentTranslation() {
        if (!sourceText.value.trim() || !translatedText.value.trim()) {
            UIUtils.showNotification('No translation to save', 'warning');
            return;
        }

        // Already saved in history when translated
        UIUtils.showNotification('Translation saved to history!', 'success');
    }

    function clearTranslationHistory() {
        translationHistory = [];
        StorageUtils.set('translationHistory', translationHistory);
        loadTranslationHistory();
        UIUtils.showNotification('Translation history cleared!', 'info');
    }

    function loadCommonPhrases() {
        const phrases = [
            { text: 'Hello, how are you?', lang: 'en' },
            { text: 'Thank you very much', lang: 'en' },
            { text: 'Where is the bathroom?', lang: 'en' },
            { text: 'I need help', lang: 'en' },
            { text: 'How much does this cost?', lang: 'en' },
            { text: 'Good morning', lang: 'en' },
            { text: 'I don\'t understand', lang: 'en' },
            { text: 'What time is it?', lang: 'en' }
        ];
        
        commonPhrases.innerHTML = '';
        
        phrases.forEach(phrase => {
            const phraseItem = document.createElement('div');
            phraseItem.className = 'phrase-item';
            phraseItem.innerHTML = `
                <div class="phrase-text">${phrase.text}</div>
                <div class="phrase-lang">${languageNames[phrase.lang]}</div>
            `;
            phraseItem.addEventListener('click', () => {
                sourceText.value = phrase.text;
                sourceLang.value = phrase.lang;
                updateLanguageNames();
                updateCharCount();
                UIUtils.showNotification('Phrase loaded! Click Translate to see translation.', 'info');
            });
            commonPhrases.appendChild(phraseItem);
        });
    }
});

// Add CSS for language translator
const translatorStyles = `
.translator-interface {
    max-width: 100%;
}

.language-selectors {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: end;
    margin-bottom: 2rem;
}

.translation-area {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: start;
}

.input-section, .output-section {
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
}

.input-header, .output-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
    font-weight: 600;
}

.input-actions, .output-actions {
    display: flex;
    gap: 0.25rem;
}

.btn-small {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
}

.input-section textarea, .output-section textarea {
    border: none;
    border-radius: 0;
    resize: vertical;
    min-height: 150px;
}

.input-footer, .output-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    border-top: 1px solid #e1e5e9;
    font-size: 0.8rem;
    color: #666;
}

.translation-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 3rem;
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

.history-source {
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.history-translation {
    color: #4361ee;
    margin-bottom: 0.25rem;
}

.history-languages {
    font-size: 0.8rem;
    color: #666;
}

.history-actions {
    margin-left: 1rem;
}

.phrases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
    margin-top: 1rem;
}

.phrase-item {
    padding: 0.75rem;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.phrase-item:hover {
    border-color: #4361ee;
    background: #f0f4ff;
}

.phrase-text {
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.phrase-lang {
    font-size: 0.8rem;
    color: #666;
}

@media (max-width: 768px) {
    .language-selectors {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
    
    .swap-btn {
        order: 3;
        margin: 0.5rem 0;
    }
    
    .translation-area {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .translation-actions {
        padding-top: 0;
        flex-direction: row;
        justify-content: center;
    }
    
    .history-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .history-actions {
        margin-left: 0;
        align-self: flex-end;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = translatorStyles;
document.head.appendChild(styleSheet);