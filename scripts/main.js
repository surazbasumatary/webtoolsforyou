// Main application JavaScript
const tools = [
    {
        id: 'pdf-compressor',
        name: 'PDF Compressor',
        description: 'Reduce PDF file size without losing quality',
        icon: 'fas fa-file-pdf',
        category: 'file',
        featured: true,
        path: './tools/pdf-compressor.html'
    },
    {
        id: 'qr-generator',
        name: 'QR Generator',
        description: 'Create custom QR codes for URLs and text',
        icon: 'fas fa-qrcode',
        category: 'web',
        featured: true,
        path: './tools/qr-generator.html'
    },
    {
        id: 'email-extractor',
        name: 'Email Extractor',
        description: 'Extract email addresses from text',
        icon: 'fas fa-envelope',
        category: 'text',
        featured: true,
        path: './tools/email-extractor.html'
    },
    {
        id: 'text-formatter',
        name: 'Text Formatter',
        description: 'Format and clean up text with various options',
        icon: 'fas fa-text-height',
        category: 'text',
        featured: false,
        path: './tools/text-formatter.html'
    },
    {
        id: 'color-picker',
        name: 'Color Picker',
        description: 'Pick colors and get their codes',
        icon: 'fas fa-eye-dropper',
        category: 'design',
        featured: true,
        path: './tools/color-picker.html'
    },
    {
        id: 'url-shortener',
        name: 'URL Shortener',
        description: 'Shorten long URLs for easy sharing',
        icon: 'fas fa-link',
        category: 'web',
        featured: true,
        path: './tools/url-shortener.html'
    },
    {
        id: 'stopwatch',
        name: 'Stopwatch & Timer',
        description: 'Precise stopwatch and countdown timer',
        icon: 'fas fa-stopwatch',
        category: 'time',
        featured: false,
        path: './tools/stopwatch.html'
    },
    {
        id: 'unit-converter',
        name: 'Unit Converter',
        description: 'Convert between different units',
        icon: 'fas fa-balance-scale',
        category: 'calculator',
        featured: true,
        path: './tools/unit-converter.html'
    },
    {
        id: 'image-to-text',
        name: 'Image to Text',
        description: 'Extract text from images (OCR)',
        icon: 'fas fa-image',
        category: 'file',
        featured: false,
        path: './tools/image-to-text.html'
    },
    {
        id: 'file-converter',
        name: 'File Converter',
        description: 'Convert between different file formats',
        icon: 'fas fa-exchange-alt',
        category: 'file',
        featured: false,
        path: './tools/file-converter.html'
    },
    {
        id: 'word-counter',
        name: 'Word Counter',
        description: 'Count words, characters, and paragraphs',
        icon: 'fas fa-calculator',
        category: 'text',
        featured: false,
        path: './tools/word-counter.html'
    },
    {
        id: 'language-translator',
        name: 'Language Translator',
        description: 'Translate text between languages',
        icon: 'fas fa-language',
        category: 'text',
        featured: false,
        path: './tools/language-translator.html'
    },
    {
        id: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure random passwords',
        icon: 'fas fa-key',
        category: 'security',
        featured: false,
        path: './tools/password-generator.html'
    },
    {
        id: 'base64-converter',
        name: 'Base64 Converter',
        description: 'Encode and decode Base64 strings',
        icon: 'fas fa-code',
        category: 'developer',
        featured: false,
        path: './tools/base64-converter.html'
    },
    {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format and validate JSON data',
        icon: 'fas fa-brackets-curly',
        category: 'developer',
        featured: false,
        path: './tools/json-formatter.html'
    },
    {
        id: 'image-compressor',
        name: 'Image Compressor',
        description: 'Compress images to reduce file size while maintaining quality',
        icon: 'fas fa-compress-alt',
        category: 'file',
        featured: true,
        path: './tools/image-compressor.html'
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing application...');
    initializeSearch();
    populateTools();
    setupEventListeners();
    setupNavigation();
    setupToolCardClickHandlers();
    
    // Debug: Check if all elements are properly loaded
    setTimeout(() => {
        debugInitialization();
    }, 500);
});

// Debug initialization
function debugInitialization() {
    console.log('=== DEBUG INITIALIZATION ===');
    console.log('Search input:', document.getElementById('searchInput'));
    console.log('Search button:', document.getElementById('searchButton'));
    console.log('Search results:', document.getElementById('searchResults'));
    console.log('Featured tools grid:', document.getElementById('featuredTools'));
    console.log('All tools grid:', document.getElementById('allTools'));
    console.log('Tools data:', tools.length, 'tools loaded');
    console.log('Tool cards on page:', document.querySelectorAll('.tool-card').length);
    console.log('================================');
}

// Setup click handlers for tool cards
function setupToolCardClickHandlers() {
    console.log('Setting up tool card click handlers...');
    
    // Add click handlers to all tool cards
    document.addEventListener('click', function(e) {
        const toolCard = e.target.closest('.tool-card');
        const toolLink = e.target.closest('.tool-link');
        
        if (toolCard || toolLink) {
            e.preventDefault();
            e.stopPropagation();
            
            let toolName;
            if (toolCard) {
                toolName = toolCard.querySelector('h3').textContent;
            } else if (toolLink) {
                toolName = toolLink.closest('.tool-card').querySelector('h3').textContent;
            }
            
            console.log('Tool clicked:', toolName);
            
            // Find the tool in our data
            const tool = tools.find(t => t.name === toolName);
            if (tool) {
                navigateToTool(tool);
            } else {
                console.warn('Tool not found in data:', toolName);
                alert(`Opening ${toolName} tool...`);
            }
        }
    });
}

// Navigate to tool page
function navigateToTool(tool) {
    console.log('📍 Navigating to tool:', tool.name, 'Path:', tool.path);
    
    if (tool.path && tool.path !== '#') {
        // Check if the path exists (you might want to remove this check in production)
        console.log('Redirecting to:', tool.path);
        window.location.href = tool.path;
    } else {
        // Fallback: show alert for demo
        console.warn('No valid path found for tool:', tool.name);
        alert(`🚧 ${tool.name} Tool\n\nThis tool is under development and will be available soon!\n\nPlanned path: ${tool.path || `/tools/${tool.id}.html`}`);
        
        // Uncomment the line below when you have actual tool pages
        // window.location.href = `./tools/${tool.id}.html`;
    }
}

// Initialize search functionality
function initializeSearch() {
    console.log('🔍 Initializing search...');
    
    const toolSearch = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    
    if (!toolSearch) {
        console.error('❌ Search input not found!');
        return;
    }

    console.log('✅ Search input found');

    // Search functionality
    toolSearch.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        console.log('Search input:', searchTerm);
        filterTools(searchTerm);
        updateSearchResults(searchTerm);
    });

    toolSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.toLowerCase().trim();
            console.log('Search enter:', searchTerm);
            filterTools(searchTerm);
            updateSearchResults(searchTerm);
        }
    });

    // Search button
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchTerm = toolSearch.value.toLowerCase().trim();
            console.log('Search button clicked:', searchTerm);
            filterTools(searchTerm);
            updateSearchResults(searchTerm);
        });
    }

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (searchResults && !e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });

    // Prevent search input from closing results when clicking inside
    if (searchResults) {
        searchResults.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Update search results dropdown
function updateSearchResults(searchTerm) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) {
        console.error('❌ Search results container not found!');
        return;
    }

    if (!searchTerm) {
        searchResults.style.display = 'none';
        return;
    }

    const filteredTools = tools.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.description.toLowerCase().includes(searchTerm) ||
        tool.category.toLowerCase().includes(searchTerm)
    );

    console.log('Search results:', filteredTools.length, 'tools found');
    
    searchResults.innerHTML = '';
    
    if (filteredTools.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No tools found matching your search</div>';
    } else {
        filteredTools.forEach(tool => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="search-result-icon">
                    <i class="${tool.icon}"></i>
                </div>
                <div class="search-result-text">
                    <h4>${tool.name}</h4>
                    <p>${tool.description}</p>
                </div>
            `;
            
            resultItem.addEventListener('click', function() {
                console.log('Search result clicked:', tool.name);
                navigateToTool(tool);
                searchResults.style.display = 'none';
                if (document.getElementById('searchInput')) {
                    document.getElementById('searchInput').value = '';
                }
            });
            
            searchResults.appendChild(resultItem);
        });
    }
    
    searchResults.style.display = 'block';
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav a');
    console.log('Setting up navigation for', navLinks.length, 'links');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Update active state
                navLinks.forEach(nav => nav.classList.remove('nav-active'));
                this.classList.add('nav-active');
                
                // Smooth scroll to section
                console.log('Scrolling to:', targetId);
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                console.warn('Target section not found:', targetId);
            }
        });
    });
}

// Filter tools based on search term
function filterTools(searchTerm) {
    console.log('Filtering tools for:', searchTerm);
    
    const allToolsGrid = document.getElementById('allTools');
    if (!allToolsGrid) {
        console.error('❌ Tools grid (#allTools) not found!');
        return;
    }

    // If search term is empty, show all tools
    if (!searchTerm) {
        populateAllTools();
        updateSectionTitle('All Available Tools');
        return;
    }

    const filteredTools = tools.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.description.toLowerCase().includes(searchTerm) ||
        tool.category.toLowerCase().includes(searchTerm)
    );

    console.log('Filtered tools:', filteredTools.length);
    
    allToolsGrid.innerHTML = '';
    
    if (filteredTools.length === 0) {
        allToolsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-search fa-3x" style="margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 0.5rem;">No tools found for "${searchTerm}"</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
    } else {
        filteredTools.forEach(tool => {
            allToolsGrid.appendChild(createToolCard(tool));
        });
    }
    
    updateSectionTitle(`Search Results for "${searchTerm}" (${filteredTools.length} found)`);
    
    // Scroll to results
    const toolsSection = document.getElementById('tools');
    if (toolsSection && searchTerm) {
        toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Update section title
function updateSectionTitle(title) {
    const sectionHeader = document.querySelector('#tools .section-header h2');
    if (sectionHeader) {
        sectionHeader.textContent = title;
    }
}

// Populate all tools (without filtering)
function populateAllTools() {
    const allToolsGrid = document.getElementById('allTools');
    if (!allToolsGrid) {
        console.error('❌ All tools grid not found!');
        return;
    }

    allToolsGrid.innerHTML = '';
    tools.forEach(tool => {
        allToolsGrid.appendChild(createToolCard(tool));
    });
    console.log('✅ Populated all tools:', tools.length);
}

// Populate regular tools
function populateTools() {
    console.log('🛠️ Populating tools...');
    
    const featuredToolsGrid = document.getElementById('featuredTools');
    const allToolsGrid = document.getElementById('allTools');

    if (!featuredToolsGrid) {
        console.error('❌ Featured tools grid not found!');
    }
    if (!allToolsGrid) {
        console.error('❌ All tools grid not found!');
        return;
    }

    // Clear existing content
    featuredToolsGrid.innerHTML = '';
    allToolsGrid.innerHTML = '';
    
    // Featured tools
    const featuredTools = tools.filter(tool => tool.featured);
    console.log('Featured tools:', featuredTools.length);
    
    featuredTools.forEach(tool => {
        featuredToolsGrid.appendChild(createToolCard(tool));
    });
    
    // All tools
    console.log('All tools:', tools.length);
    tools.forEach(tool => {
        allToolsGrid.appendChild(createToolCard(tool));
    });
    
    console.log('✅ Tools populated successfully');
}

// Create tool card with consistent HTML structure
function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.setAttribute('data-tool-name', tool.name);
    card.setAttribute('data-tool-category', tool.category);
    
    card.innerHTML = `
        <div class="tool-icon">
            <i class="${tool.icon}"></i>
        </div>
        <h3>${tool.name}</h3>
        <p>${tool.description}</p>
        <a href="${tool.path || '#'}" class="tool-link" data-tool-id="${tool.id}">Use Tool</a>
    `;
    
    return card;
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Category cards click handlers
    const categoryCards = document.querySelectorAll('.category-card');
    console.log('Category cards found:', categoryCards.length);
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            console.log('Category clicked:', category);
            
            const categoryTools = tools.filter(tool => tool.category === category);
            console.log('Category tools:', categoryTools.length);
            
            // Filter tools by category
            if (categoryTools.length > 0) {
                const allToolsGrid = document.getElementById('allTools');
                if (allToolsGrid) {
                    allToolsGrid.innerHTML = '';
                    categoryTools.forEach(tool => {
                        allToolsGrid.appendChild(createToolCard(tool));
                    });
                    updateSectionTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Tools (${categoryTools.length} found)`);
                    
                    // Scroll to tools section
                    const toolsSection = document.getElementById('tools');
                    if (toolsSection) {
                        toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        });
    });

    // Hero section buttons
    const heroButtons = document.querySelectorAll('.hero-cta button, .cta-buttons a, .btn-primary, .btn-secondary');
    console.log('Hero buttons found:', heroButtons.length);
    
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            let targetId = this.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || 
                          this.getAttribute('href')?.replace('#', '');
            
            // If no target found, try to find by text content
            if (!targetId) {
                if (this.textContent.includes('All Tools')) targetId = 'tools';
                else if (this.textContent.includes('Popular')) targetId = 'featured-tools';
            }
            
            if (targetId) {
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    console.log('Scrolling to section:', targetId);
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    console.warn('Target section not found:', targetId);
                }
            }
        });
    });
}

// Add debug function to global scope
window.debugTools = function() {
    console.log('=== 🐛 DEBUG TOOLS ===');
    console.log('Total tools in data:', tools.length);
    console.log('Featured tools:', tools.filter(t => t.featured).length);
    console.log('Tool paths sample:');
    tools.slice(0, 3).forEach(tool => {
        console.log(`- ${tool.name}: ${tool.path}`);
    });
    console.log('All tool cards on page:', document.querySelectorAll('.tool-card').length);
    console.log('Search functionality:', {
        input: document.getElementById('searchInput'),
        button: document.getElementById('searchButton'),
        results: document.getElementById('searchResults')
    });
    console.log('========================');
};

// Initialize AdSense
function initializeAdSense() {
    if (window.adsbygoogle) {
        (adsbygoogle = window.adsbygoogle || []).push({});
        console.log('✅ AdSense initialized');
    } else {
        console.log('ℹ️ AdSense not available');
    }
}

// Call debug to check initialization
setTimeout(() => {
    window.debugTools();
    initializeAdSense();
}, 1000);
