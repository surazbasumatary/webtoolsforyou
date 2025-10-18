document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const uploadFile = document.getElementById('uploadFile');
    const fileInput = document.getElementById('fileInput');
    
    // Stat elements
    const wordCountEl = document.getElementById('wordCount');
    const charCountEl = document.getElementById('charCount');
    const charNoSpaceCountEl = document.getElementById('charNoSpaceCount');
    const sentenceCountEl = document.getElementById('sentenceCount');
    const paragraphCountEl = document.getElementById('paragraphCount');
    const readingTimeEl = document.getElementById('readingTime');
    
    // Analysis elements
    const wordFrequency = document.getElementById('wordFrequency');
    const textStats = document.getElementById('textStats');
    const readingLevel = document.getElementById('readingLevel');
    
    // Tool buttons
    const clearText = document.getElementById('clearText');
    const copyText = document.getElementById('copyText');
    const downloadText = document.getElementById('downloadText');
    const formatText = document.getElementById('formatText');
    
    // History
    const historyList = document.getElementById('historyList');
    
    let textHistory = StorageUtils.get('textHistory', []);

    // Initialize
    loadTextHistory();
    updateStats(); // Initial update with empty text

    // Event listeners
    inputText.addEventListener('input', updateStats);
    uploadFile.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    
    clearText.addEventListener('click', clearAllText);
    copyText.addEventListener('click', copyCurrentText);
    downloadText.addEventListener('click', downloadAnalysis);
    formatText.addEventListener('click', formatCurrentText);

    // Drag and drop for file upload
    inputText.addEventListener('dragover', handleDragOver);
    inputText.addEventListener('drop', handleFileDrop);

    function updateStats() {
        const text = inputText.value;
        
        // Basic counts
        const words = countWords(text);
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const sentences = countSentences(text);
        const paragraphs = countParagraphs(text);
        const readingTime = calculateReadingTime(words);
        
        // Update basic stats
        wordCountEl.textContent = words.toLocaleString();
        charCountEl.textContent = characters.toLocaleString();
        charNoSpaceCountEl.textContent = charactersNoSpaces.toLocaleString();
        sentenceCountEl.textContent = sentences.toLocaleString();
        paragraphCountEl.textContent = paragraphs.toLocaleString();
        readingTimeEl.textContent = readingTime;
        
        // Update detailed analysis
        updateWordFrequency(text);
        updateTextStatistics(text, words, sentences, paragraphs);
        updateReadingLevel(text, words, sentences);
        
        // Save to history if text is substantial
        if (words > 10) {
            saveToHistory(text);
        }
    }

    function countWords(text) {
        if (!text.trim()) return 0;
        return text.trim().split(/\s+/).length;
    }

    function countSentences(text) {
        if (!text.trim()) return 0;
        // Split by sentence endings: . ! ? followed by space or end of string
        const sentences = text.split(/[.!?]+(\s|$)/).filter(s => s.trim().length > 0);
        return sentences.length;
    }

    function countParagraphs(text) {
        if (!text.trim()) return 0;
        return text.split(/\n+/).filter(p => p.trim().length > 0).length;
    }

    function calculateReadingTime(wordCount) {
        const wordsPerMinute = 200; // Average reading speed
        const minutes = wordCount / wordsPerMinute;
        
        if (minutes < 1) {
            return '< 1 min';
        } else if (minutes < 60) {
            return Math.ceil(minutes) + ' min';
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = Math.ceil(minutes % 60);
            return `${hours}h ${mins}m`;
        }
    }

    function updateWordFrequency(text) {
        if (!text.trim()) {
            wordFrequency.innerHTML = '<p style="color: #666; text-align: center;">No text to analyze</p>';
            return;
        }
        
        // Clean and split text into words
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2); // Filter out short words
        
        // Count frequency
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        
        // Convert to array and sort by frequency
        const sortedWords = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10 words
        
        if (sortedWords.length === 0) {
            wordFrequency.innerHTML = '<p style="color: #666; text-align: center;">Not enough words for frequency analysis</p>';
            return;
        }
        
        wordFrequency.innerHTML = sortedWords.map(([word, count]) => `
            <div class="frequency-item">
                <span class="word">${word}</span>
                <span class="count">${count}</span>
            </div>
        `).join('');
    }

    function updateTextStatistics(text, wordCount, sentenceCount, paragraphCount) {
        if (!text.trim()) {
            textStats.innerHTML = '<p style="color: #666; text-align: center;">No text to analyze</p>';
            return;
        }
        
        const avgSentenceLength = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(1) : 0;
        const avgParagraphLength = paragraphCount > 0 ? (wordCount / paragraphCount).toFixed(1) : 0;
        const avgWordLength = wordCount > 0 ? (text.replace(/\s/g, '').length / wordCount).toFixed(1) : 0;
        
        textStats.innerHTML = `
            <div class="stat-item">
                <strong>Average sentence length:</strong> ${avgSentenceLength} words
            </div>
            <div class="stat-item">
                <strong>Average paragraph length:</strong> ${avgParagraphLength} words
            </div>
            <div class="stat-item">
                <strong>Average word length:</strong> ${avgWordLength} characters
            </div>
            <div class="stat-item">
                <strong>Word density:</strong> ${((wordCount / text.length) * 100).toFixed(1)}%
            </div>
        `;
    }

    function updateReadingLevel(text, wordCount, sentenceCount) {
        if (!text.trim() || wordCount === 0 || sentenceCount === 0) {
            readingLevel.innerHTML = '<p style="color: #666; text-align: center;">No text to analyze</p>';
            return;
        }
        
        // Simple Flesch Reading Ease score calculation
        const avgSentenceLength = wordCount / sentenceCount;
        const syllables = countSyllables(text);
        const avgSyllablesPerWord = syllables / wordCount;
        
        const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        
        let readingLevelText, levelClass;
        
        if (fleschScore >= 90) {
            readingLevelText = 'Very Easy (5th grade)';
            levelClass = 'level-easy';
        } else if (fleschScore >= 80) {
            readingLevelText = 'Easy (6th grade)';
            levelClass = 'level-easy';
        } else if (fleschScore >= 70) {
            readingLevelText = 'Fairly Easy (7th grade)';
            levelClass = 'level-medium';
        } else if (fleschScore >= 60) {
            readingLevelText = 'Standard (8th-9th grade)';
            levelClass = 'level-medium';
        } else if (fleschScore >= 50) {
            readingLevelText = 'Fairly Difficult (10th-12th grade)';
            levelClass = 'level-difficult';
        } else if (fleschScore >= 30) {
            readingLevelText = 'Difficult (College)';
            levelClass = 'level-difficult';
        } else {
            readingLevelText = 'Very Difficult (Graduate)';
            levelClass = 'level-very-difficult';
        }
        
        readingLevel.innerHTML = `
            <div class="level-score ${levelClass}">
                <div class="score">${fleschScore.toFixed(1)}</div>
                <div class="level">${readingLevelText}</div>
            </div>
        `;
    }

    function countSyllables(text) {
        // Simple syllable counting (approximate)
        const words = text.toLowerCase().split(/\s+/);
        let syllableCount = 0;
        
        words.forEach(word => {
            if (word.length <= 3) {
                syllableCount += 1;
                return;
            }
            
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            word = word.replace(/^y/, '');
            
            const matches = word.match(/[aeiouy]{1,2}/g);
            syllableCount += matches ? matches.length : 1;
        });
        
        return syllableCount;
    }

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await FileUtils.readFileAsText(file);
            inputText.value = text;
            updateStats();
            UIUtils.showNotification('File loaded successfully!', 'success');
        } catch (error) {
            UIUtils.showNotification('Error reading file', 'error');
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        inputText.style.borderColor = '#4361ee';
        inputText.style.backgroundColor = '#f0f4ff';
    }

    function handleFileDrop(e) {
        e.preventDefault();
        inputText.style.borderColor = '#e1e5e9';
        inputText.style.backgroundColor = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload({ target: { files: files } });
        }
    }

    function clearAllText() {
        inputText.value = '';
        updateStats();
        UIUtils.showNotification('Text cleared!', 'info');
    }

    async function copyCurrentText() {
        if (!inputText.value.trim()) {
            UIUtils.showNotification('No text to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(inputText.value);
            UIUtils.showNotification('Text copied to clipboard!', 'success');
        } catch (err) {
            inputText.select();
            document.execCommand('copy');
            UIUtils.showNotification('Text copied to clipboard!', 'success');
        }
    }

    function downloadAnalysis() {
        const text = inputText.value;
        if (!text.trim()) {
            UIUtils.showNotification('No text to analyze', 'warning');
            return;
        }

        const analysis = generateAnalysisReport(text);
        const blob = new Blob([analysis], { type: 'text/plain' });
        FileUtils.downloadFile(blob, 'text-analysis.txt', 'text/plain');
        UIUtils.showNotification('Analysis downloaded!', 'success');
    }

    function generateAnalysisReport(text) {
        const words = countWords(text);
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const sentences = countSentences(text);
        const paragraphs = countParagraphs(text);
        const readingTime = calculateReadingTime(words);
        
        return `TEXT ANALYSIS REPORT
Generated by WebToolsForYou
Date: ${new Date().toLocaleString()}

BASIC STATISTICS:
- Words: ${words}
- Characters: ${characters}
- Characters (no spaces): ${charactersNoSpaces}
- Sentences: ${sentences}
- Paragraphs: ${paragraphs}
- Reading Time: ${readingTime}

TEXT CONTENT:
${text}
`;
    }

    function formatCurrentText() {
        let text = inputText.value;
        
        // Basic formatting
        text = text
            .replace(/\s+/g, ' ') // Remove extra spaces
            .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n') // Add paragraph breaks
            .trim();
        
        inputText.value = text;
        updateStats();
        UIUtils.showNotification('Text formatted!', 'success');
    }

    function saveToHistory(text) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            preview: StringUtils.truncate(text, 100),
            wordCount: countWords(text)
        };
        
        // Remove if already exists (based on preview)
        textHistory = textHistory.filter(item => item.preview !== historyItem.preview);
        
        // Add to beginning
        textHistory.unshift(historyItem);
        
        // Keep only last 10 items
        textHistory = textHistory.slice(0, 10);
        
        StorageUtils.set('textHistory', textHistory);
        loadTextHistory();
    }

    function loadTextHistory() {
        historyList.innerHTML = '';
        
        if (textHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666; padding: 1rem;">No recent texts</p>';
            return;
        }
        
        textHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-preview">${item.preview}</div>
                <div class="history-meta">
                    <span class="word-count">${item.wordCount} words</span>
                    <span class="timestamp">${new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <button class="history-use" data-preview="${item.preview}">
                    <i class="fas fa-redo"></i>
                </button>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Add event listeners to use buttons
        document.querySelectorAll('.history-use').forEach(btn => {
            btn.addEventListener('click', function() {
                const preview = this.getAttribute('data-preview');
                // In a real app, you'd store the full text and retrieve it
                inputText.value = preview + '...';
                updateStats();
                UIUtils.showNotification('Text loaded from history!', 'info');
            });
        });
    }
});

// Add CSS for word counter
const wordCounterStyles = `
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
}

.stat-card {
    background: white;
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-card:hover {
    border-color: #4361ee;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-icon {
    width: 50px;
    height: 50px;
    background: #4361ee;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
}

.stat-info {
    flex: 1;
    text-align: left;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4361ee;
    margin-bottom: 0.25rem;
}

.stat-label {
    color: #666;
    font-size: 0.9rem;
}

.analysis-section {
    margin: 2rem 0;
}

.analysis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.analysis-card {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    padding: 1.5rem;
}

.analysis-card h5 {
    margin-bottom: 1rem;
    color: #4361ee;
    border-bottom: 2px solid #f0f4ff;
    padding-bottom: 0.5rem;
}

.frequency-list {
    max-height: 200px;
    overflow-y: auto;
}

.frequency-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f0f4ff;
}

.frequency-item:last-child {
    border-bottom: none;
}

.frequency-item .word {
    font-weight: 500;
}

.frequency-item .count {
    background: #4361ee;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    min-width: 30px;
    text-align: center;
}

.stats-list .stat-item {
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 4px;
}

.level-score {
    text-align: center;
    padding: 1rem;
}

.level-score .score {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.level-score .level {
    font-size: 1rem;
    color: #666;
}

.level-easy .score { color: #2ecc71; }
.level-medium .score { color: #f39c12; }
.level-difficult .score { color: #e74c3c; }
.level-very-difficult .score { color: #c0392b; }

.text-tools {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.tool-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.file-upload-option {
    margin: 1rem 0;
    display: flex;
    align-items: center;
}

.history-list {
    max-height: 300px;
    overflow-y: auto;
    margin-top: 1rem;
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

.history-preview {
    flex: 1;
    color: #666;
    font-style: italic;
}

.history-meta {
    display: flex;
    gap: 1rem;
    margin: 0 1rem;
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

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .stat-card {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }
    
    .analysis-grid {
        grid-template-columns: 1fr;
    }
    
    .tool-buttons {
        flex-direction: column;
    }
    
    .history-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .history-meta {
        margin: 0;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = wordCounterStyles;
document.head.appendChild(styleSheet);