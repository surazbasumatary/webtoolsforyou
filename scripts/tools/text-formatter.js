document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const formatButtons = document.querySelectorAll('.format-options button');

    // Add event listeners to format buttons
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            formatText(action);
        });
    });

    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearAll);

    function formatText(action) {
        let text = inputText.value;
        
        if (!text.trim()) {
            UIUtils.showNotification('Please enter some text first', 'warning');
            return;
        }

        let result = text;

        switch (action) {
            case 'uppercase':
                result = text.toUpperCase();
                break;
            case 'lowercase':
                result = text.toLowerCase();
                break;
            case 'capitalize':
                result = text.replace(/\b\w/g, char => char.toUpperCase());
                break;
            case 'titlecase':
                result = text.replace(/\w\S*/g, txt => 
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
                break;
            case 'trim':
                result = text.trim();
                break;
            case 'removeExtraSpaces':
                result = text.replace(/\s+/g, ' ').trim();
                break;
            case 'removeEmptyLines':
                result = text.split('\n')
                    .filter(line => line.trim() !== '')
                    .join('\n');
                break;
            case 'removeDuplicates':
                const lines = text.split('\n');
                result = [...new Set(lines)].join('\n');
                break;
            case 'reverse':
                result = text.split('').reverse().join('');
                break;
            case 'wordCount':
                const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                const characters = text.length;
                const linesCount = text.split('\n').length;
                result = `Word Count: ${words}\nCharacter Count: ${characters}\nLine Count: ${linesCount}\n\nOriginal Text:\n${text}`;
                break;
            case 'sortLines':
                result = text.split('\n').sort().join('\n');
                break;
            case 'urlEncode':
                result = encodeURIComponent(text);
                break;
        }

        outputText.value = result;
        UIUtils.showNotification(`Text ${action.replace(/([A-Z])/g, ' $1').toLowerCase()} applied!`, 'success');
    }

    async function copyToClipboard() {
        if (!outputText.value.trim()) {
            UIUtils.showNotification('No text to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(outputText.value);
            UIUtils.showNotification('Text copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            outputText.select();
            document.execCommand('copy');
            UIUtils.showNotification('Text copied to clipboard!', 'success');
        }
    }

    function clearAll() {
        inputText.value = '';
        outputText.value = '';
        UIUtils.showNotification('All fields cleared!', 'info');
    }

    // Auto-format on input change
    inputText.addEventListener('input', function() {
        if (inputText.value && outputText.value) {
            // If there's input and output, reapply the last action
            const lastAction = document.querySelector('.format-options button:focus')?.getAttribute('data-action');
            if (lastAction) {
                formatText(lastAction);
            }
        }
    });
});