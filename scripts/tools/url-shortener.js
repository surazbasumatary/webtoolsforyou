document.addEventListener('DOMContentLoaded', function() {
    const longUrl = document.getElementById('longUrl');
    const customAlias = document.getElementById('customAlias');
    const shortenBtn = document.getElementById('shortenBtn');
    const resultArea = document.getElementById('resultArea');
    const shortUrl = document.getElementById('shortUrl');
    const copyUrl = document.getElementById('copyUrl');
    const testUrl = document.getElementById('testUrl');
    const newUrl = document.getElementById('newUrl');
    const shareUrl = document.getElementById('shareUrl');
    const historyArea = document.getElementById('urlHistory');

    // Statistics elements
    const originalUrl = document.getElementById('originalUrl');
    const shortenedUrl = document.getElementById('shortenedUrl');
    const clickCount = document.getElementById('clickCount');
    const createdDate = document.getElementById('createdDate');

    let shortenedUrls = StorageUtils.get('shortenedUrls', []);

    // Initialize
    loadUrlHistory();

    // Event listeners
    shortenBtn.addEventListener('click', shortenURL);
    copyUrl.addEventListener('click', copyShortURL);
    testUrl.addEventListener('click', testShortURL);
    newUrl.addEventListener('click', createNewURL);
    shareUrl.addEventListener('click', shareShortURL);

    // Validate URL as user types
    longUrl.addEventListener('input', function() {
        const url = this.value.trim();
        if (url && !ValidationUtils.isValidURL(url) && !url.startsWith('http')) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#e1e5e9';
        }
    });

    // Validate custom alias
    customAlias.addEventListener('input', function() {
        const alias = this.value.trim();
        if (alias && !/^[a-zA-Z0-9-]+$/.test(alias)) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#e1e5e9';
        }
    });

    async function shortenURL() {
        const url = longUrl.value.trim();
        let alias = customAlias.value.trim();

        // Validate URL
        if (!url) {
            UIUtils.showNotification('Please enter a URL to shorten', 'warning');
            return;
        }

        let validUrl = url;
        if (!validUrl.startsWith('http')) {
            validUrl = 'https://' + validUrl;
        }

        if (!ValidationUtils.isValidURL(validUrl)) {
            UIUtils.showNotification('Please enter a valid URL', 'error');
            return;
        }

        // Validate custom alias
        if (alias && !/^[a-zA-Z0-9-]+$/.test(alias)) {
            UIUtils.showNotification('Custom alias can only contain letters, numbers, and hyphens', 'error');
            return;
        }

        // Check if alias already exists
        if (alias && shortenedUrls.some(item => item.alias === alias)) {
            UIUtils.showNotification('This alias is already taken. Please choose another one.', 'error');
            return;
        }

        UIUtils.showLoading(shortenBtn);

        try {
            // Generate short URL (frontend-only implementation)
            const shortURLData = await generateShortURL(validUrl, alias);
            
            // Store the shortened URL
            shortenedUrls.unshift(shortURLData);
            StorageUtils.set('shortenedUrls', shortenedUrls);
            
            // Display results
            displayShortURL(shortURLData);
            loadUrlHistory();
            
            UIUtils.showNotification('URL shortened successfully!', 'success');
            
        } catch (error) {
            console.error('URL shortening error:', error);
            UIUtils.showNotification('Error shortening URL', 'error');
        } finally {
            shortenBtn.innerHTML = '<i class="fas fa-compress"></i> Shorten URL';
        }
    }

    async function generateShortURL(originalUrl, customAlias = '') {
        // Generate a random alias if not provided
        let alias = customAlias;
        if (!alias) {
            alias = generateRandomAlias();
            
            // Ensure uniqueness
            while (shortenedUrls.some(item => item.alias === alias)) {
                alias = generateRandomAlias();
            }
        }

        const shortURLData = {
            id: Date.now().toString(),
            originalUrl: originalUrl,
            alias: alias,
            shortUrl: `${window.location.origin}/r/${alias}`,
            clicks: 0,
            createdAt: new Date().toISOString(),
            lastAccessed: null
        };

        return shortURLData;
    }

    function generateRandomAlias() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    function displayShortURL(urlData) {
        shortUrl.value = urlData.shortUrl;
        originalUrl.textContent = urlData.originalUrl;
        shortenedUrl.textContent = urlData.shortUrl;
        clickCount.textContent = urlData.clicks;
        createdDate.textContent = new Date(urlData.createdAt).toLocaleDateString();
        
        resultArea.classList.remove('hidden');
        
        // Scroll to result
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }

    async function copyShortURL() {
        try {
            await navigator.clipboard.writeText(shortUrl.value);
            UIUtils.showNotification('Short URL copied to clipboard!', 'success');
        } catch (err) {
            shortUrl.select();
            document.execCommand('copy');
            UIUtils.showNotification('Short URL copied to clipboard!', 'success');
        }
    }

    function testShortURL() {
        window.open(shortUrl.value, '_blank');
        
        // Update click count
        const currentUrl = shortenedUrls.find(url => url.shortUrl === shortUrl.value);
        if (currentUrl) {
            currentUrl.clicks++;
            currentUrl.lastAccessed = new Date().toISOString();
            StorageUtils.set('shortenedUrls', shortenedUrls);
            clickCount.textContent = currentUrl.clicks;
        }
    }

    function createNewURL() {
        longUrl.value = '';
        customAlias.value = '';
        resultArea.classList.add('hidden');
        longUrl.focus();
    }

    async function shareShortURL() {
        const shareData = {
            title: 'Check out this link',
            text: 'Here\'s a shortened URL from WebToolsForYou',
            url: shortUrl.value
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shortUrl.value);
                UIUtils.showNotification('URL copied to clipboard for sharing!', 'success');
            } else {
                copyShortURL();
            }
        } catch (error) {
            console.error('Error sharing:', error);
            copyShortURL();
        }
    }

    function loadUrlHistory() {
        historyArea.innerHTML = '';
        
        if (shortenedUrls.length === 0) {
            historyArea.innerHTML = '<p style="text-align: center; color: #666;">No shortened URLs yet. Create your first one above!</p>';
            return;
        }

        shortenedUrls.forEach(url => {
            const historyItem = document.createElement('div');
            historyItem.className = 'url-history-item';
            historyItem.innerHTML = `
                <div class="url-info">
                    <div class="url-original">${StringUtils.truncate(url.originalUrl, 50)}</div>
                    <div class="url-short">${url.shortUrl}</div>
                    <div class="url-stats">
                        <span class="stat">Clicks: ${url.clicks}</span>
                        <span class="stat">Created: ${new Date(url.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="url-actions">
                    <button class="btn btn-secondary btn-small" data-action="copy" data-url="${url.shortUrl}">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-secondary btn-small" data-action="test" data-url="${url.shortUrl}">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button class="btn btn-secondary btn-small" data-action="delete" data-id="${url.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            historyArea.appendChild(historyItem);
        });

        // Add event listeners to history items
        document.querySelectorAll('[data-action="copy"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                navigator.clipboard.writeText(url);
                UIUtils.showNotification('URL copied!', 'success');
            });
        });

        document.querySelectorAll('[data-action="test"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                window.open(url, '_blank');
                
                // Update click count
                const urlData = shortenedUrls.find(u => u.shortUrl === url);
                if (urlData) {
                    urlData.clicks++;
                    urlData.lastAccessed = new Date().toISOString();
                    StorageUtils.set('shortenedUrls', shortenedUrls);
                    loadUrlHistory(); // Refresh display
                }
            });
        });

        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                shortenedUrls = shortenedUrls.filter(url => url.id !== id);
                StorageUtils.set('shortenedUrls', shortenedUrls);
                loadUrlHistory();
                UIUtils.showNotification('URL deleted!', 'info');
            });
        });
    }
});

// Add CSS for URL shortener
const urlShortenerStyles = `
.url-history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
}

.url-history-item:hover {
    border-color: #4361ee;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.url-info {
    flex: 1;
}

.url-original {
    font-weight: 500;
    margin-bottom: 0.25rem;
    word-break: break-all;
}

.url-short {
    color: #4361ee;
    font-family: 'Courier New', monospace;
    margin-bottom: 0.5rem;
}

.url-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #666;
}

.stat {
    background: #f8f9fa;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
}

.url-actions {
    display: flex;
    gap: 0.25rem;
}

.btn-small {
    padding: 0.5rem;
    font-size: 0.8rem;
}

.url-stats .stat-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 4px;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = urlShortenerStyles;
document.head.appendChild(styleSheet);