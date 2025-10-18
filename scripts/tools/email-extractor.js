document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const inputTypeRadios = document.querySelectorAll('input[name="inputType"]');
    const fileInput = document.getElementById('fileInput');
    const fileUploadBtn = document.getElementById('fileUploadBtn');
    const extractBtn = document.getElementById('extractBtn');
    const resultArea = document.getElementById('resultArea');
    const outputText = document.getElementById('outputText');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const statsArea = document.getElementById('statsArea');
    const emailCount = document.getElementById('emailCount');
    const statsContent = document.getElementById('statsContent');

    // Options
    const removeDuplicates = document.getElementById('removeDuplicates');
    const sortEmails = document.getElementById('sortEmails');
    const validateEmails = document.getElementById('validateEmails');

    fileUploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    extractBtn.addEventListener('click', extractEmails);
    copyBtn.addEventListener('click', copyEmails);
    downloadBtn.addEventListener('click', downloadEmails);
    clearBtn.addEventListener('click', clearResults);

    // Handle input type changes
    inputTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'text') {
                inputText.placeholder = 'Paste text containing email addresses here...';
            } else if (this.value === 'url') {
                inputText.placeholder = 'Enter website URL to extract emails from...';
            }
        });
    });

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await FileUtils.readFileAsText(file);
            inputText.value = text;
            // Switch to text input type
            document.querySelector('input[name="inputType"][value="text"]').checked = true;
            UIUtils.showNotification('File loaded successfully!', 'success');
        } catch (error) {
            UIUtils.showNotification('Error reading file', 'error');
        }
    }

    async function extractEmails() {
        const inputType = document.querySelector('input[name="inputType"]:checked').value;
        let text = inputText.value.trim();

        if (!text) {
            UIUtils.showNotification('Please enter some text or a URL', 'warning');
            return;
        }

        UIUtils.showLoading(extractBtn);

        try {
            // If URL input type, fetch the webpage content
            if (inputType === 'url') {
                if (!ValidationUtils.isValidURL(text)) {
                    if (!text.startsWith('http')) {
                        text = 'https://' + text;
                    }
                    if (!ValidationUtils.isValidURL(text)) {
                        throw new Error('Please enter a valid URL');
                    }
                }
                text = await fetchWebsiteContent(text);
            }

            // Extract emails
            const emails = extractEmailsFromText(text);
            
            // Process emails based on options
            let processedEmails = processEmails(emails);
            
            // Display results
            displayResults(processedEmails);
            displayStatistics(emails, processedEmails);
            
            UIUtils.showNotification(`Found ${processedEmails.length} email addresses`, 'success');
            
        } catch (error) {
            console.error('Extraction error:', error);
            UIUtils.showNotification(error.message || 'Error extracting emails', 'error');
        } finally {
            extractBtn.innerHTML = '<i class="fas fa-search"></i> Extract Email Addresses';
        }
    }

    async function fetchWebsiteContent(url) {
        // Note: This would typically require a backend due to CORS restrictions
        // For frontend-only, we can only extract from the text input
        UIUtils.showNotification('Fetching website content... (Note: CORS may limit this functionality)', 'info');
        
        // Fallback: return the URL as text since we can't fetch due to CORS
        return `Website: ${url}\n\nDue to browser security restrictions (CORS), \nplease copy-paste the website content directly into the text area.`;
    }

    function extractEmailsFromText(text) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = text.match(emailRegex) || [];
        return matches;
    }

    function processEmails(emails) {
        let processed = [...emails];

        // Remove duplicates
        if (removeDuplicates.checked) {
            processed = [...new Set(processed)];
        }

        // Validate emails
        if (validateEmails.checked) {
            processed = processed.filter(email => ValidationUtils.isValidEmail(email));
        }

        // Sort emails
        if (sortEmails.checked) {
            processed.sort((a, b) => a.localeCompare(b));
        }

        return processed;
    }

    function displayResults(emails) {
        if (emails.length === 0) {
            outputText.value = 'No email addresses found in the provided text.';
        } else {
            outputText.value = emails.join('\n');
        }
        
        emailCount.textContent = `${emails.length} email${emails.length !== 1 ? 's' : ''}`;
        resultArea.classList.remove('hidden');
    }

    function displayStatistics(originalEmails, processedEmails) {
        const stats = {
            totalFound: originalEmails.length,
            duplicatesRemoved: removeDuplicates.checked ? originalEmails.length - [...new Set(originalEmails)].length : 0,
            invalidRemoved: validateEmails.checked ? originalEmails.length - processedEmails.length - (removeDuplicates.checked ? (originalEmails.length - [...new Set(originalEmails)].length) : 0) : 0,
            finalCount: processedEmails.length
        };

        statsContent.innerHTML = `
            <p>📊 Total emails found: <strong>${stats.totalFound}</strong></p>
            ${stats.duplicatesRemoved > 0 ? `<p>🔄 Duplicates removed: <strong>${stats.duplicatesRemoved}</strong></p>` : ''}
            ${stats.invalidRemoved > 0 ? `<p>❌ Invalid emails removed: <strong>${stats.invalidRemoved}</strong></p>` : ''}
            <p>✅ Final valid emails: <strong>${stats.finalCount}</strong></p>
        `;

        statsArea.classList.remove('hidden');
    }

    async function copyEmails() {
        if (!outputText.value.trim()) {
            UIUtils.showNotification('No emails to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(outputText.value);
            UIUtils.showNotification('Emails copied to clipboard!', 'success');
        } catch (err) {
            outputText.select();
            document.execCommand('copy');
            UIUtils.showNotification('Emails copied to clipboard!', 'success');
        }
    }

    function downloadEmails() {
        if (!outputText.value.trim()) {
            UIUtils.showNotification('No emails to download', 'warning');
            return;
        }

        const emails = outputText.value.split('\n');
        const csvContent = 'Email Address\n' + emails.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        
        FileUtils.downloadFile(blob, 'extracted-emails.csv', 'text/csv');
        UIUtils.showNotification('Emails downloaded as CSV!', 'success');
    }

    function clearResults() {
        inputText.value = '';
        outputText.value = '';
        resultArea.classList.add('hidden');
        statsArea.classList.add('hidden');
        fileInput.value = '';
        UIUtils.showNotification('All fields cleared!', 'info');
    }
});