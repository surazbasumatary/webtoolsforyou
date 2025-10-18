// Main application JavaScript
const tools = [
    {
        id: 'pdf-compressor',
        name: 'PDF Compressor',
        description: 'Compress PDF files to reduce their size',
        icon: 'fas fa-file-pdf',
        category: 'file',
        featured: true
    },
    {
        id: 'qr-generator',
        name: 'QR Code Generator',
        description: 'Create QR codes for URLs, text, and more',
        icon: 'fas fa-qrcode',
        category: 'generator',
        featured: true
    },
    {
        id: 'email-extractor',
        name: 'Email Extractor',
        description: 'Extract email addresses from text',
        icon: 'fas fa-envelope',
        category: 'text',
        featured: true
    },
    {
        id: 'text-formatter',
        name: 'Text Formatter',
        description: 'Clean and format your text',
        icon: 'fas fa-text-height',
        category: 'text',
        featured: false
    },
    {
        id: 'color-picker',
        name: 'Color Picker',
        description: 'Pick colors and get their codes',
        icon: 'fas fa-eye-dropper',
        category: 'design',
        featured: true
    },
    {
        id: 'url-shortener',
        name: 'URL Shortener',
        description: 'Shorten long URLs for easy sharing',
        icon: 'fas fa-link',
        category: 'web',
        featured: true
    },
    {
        id: 'stopwatch',
        name: 'Stopwatch & Timer',
        description: 'Precise stopwatch and countdown timer',
        icon: 'fas fa-stopwatch',
        category: 'time',
        featured: false
    },
    {
        id: 'unit-converter',
        name: 'Unit Converter',
        description: 'Convert between different units',
        icon: 'fas fa-balance-scale',
        category: 'calculator',
        featured: true
    },
    {
        id: 'image-to-text',
        name: 'Image to Text',
        description: 'Extract text from images (OCR)',
        icon: 'fas fa-image',
        category: 'file',
        featured: false
    },
    {
        id: 'file-converter',
        name: 'File Converter',
        description: 'Convert between different file formats',
        icon: 'fas fa-exchange-alt',
        category: 'file',
        featured: false
    },
    {
        id: 'word-counter',
        name: 'Word Counter',
        description: 'Count words, characters, and paragraphs',
        icon: 'fas fa-calculator',
        category: 'text',
        featured: false
    },
    {
        id: 'language-translator',
        name: 'Language Translator',
        description: 'Translate text between languages',
        icon: 'fas fa-language',
        category: 'text',
        featured: false
    },
    {
        id: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure random passwords',
        icon: 'fas fa-key',
        category: 'security',
        featured: false
    },
    {
        id: 'base64-converter',
        name: 'Base64 Converter',
        description: 'Encode and decode Base64 strings',
        icon: 'fas fa-code',
        category: 'developer',
        featured: false
    },
    {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format and validate JSON data',
        icon: 'fas fa-brackets-curly',
        category: 'developer',
        featured: false
    },
    {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress images to reduce file size while maintaining quality',
    icon: 'fas fa-compress-alt',
    category: 'file',
    featured: true
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...');
    initializeSearch();
    populateTools();
    setupEventListeners();
    setupNavigation();
});

// Initialize search functionality
function initializeSearch() {
    console.log('Initializing search...');
    
    const toolSearch = document.getElementById('toolSearch');
    const heroSearch = document.getElementById('heroSearch');
    
    if (!toolSearch && !heroSearch) {
        console.error('Search inputs not found!');
        return;
    }

    // Header search functionality
    if (toolSearch) {
        console.log('Found header search input');
        
        toolSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            console.log('Header search input:', searchTerm);
            filterTools(searchTerm);
        });

        toolSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value.toLowerCase().trim();
                console.log('Header search enter:', searchTerm);
                filterTools(searchTerm);
            }
        });

        // Header search button
        const headerSearchContainer = toolSearch.closest('.search-bar');
        if (headerSearchContainer) {
            const headerSearchBtn = headerSearchContainer.querySelector('button');
            if (headerSearchBtn) {
                headerSearchBtn.addEventListener('click', function() {
                    const searchTerm = toolSearch.value.toLowerCase().trim();
                    console.log('Header search button clicked:', searchTerm);
                    filterTools(searchTerm);
                });
            }
        }
    }

    // Hero search functionality
    if (heroSearch) {
        console.log('Found hero search input');
        
        heroSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            console.log('Hero search input:', searchTerm);
            filterTools(searchTerm);
        });

        heroSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value.toLowerCase().trim();
                console.log('Hero search enter:', searchTerm);
                filterTools(searchTerm);
            }
        });

        // Hero search button
        const heroSearchContainer = heroSearch.closest('.search-bar');
        if (heroSearchContainer) {
            const heroSearchBtn = heroSearchContainer.querySelector('button');
            if (heroSearchBtn) {
                heroSearchBtn.addEventListener('click', function() {
                    const searchTerm = heroSearch.value.toLowerCase().trim();
                    console.log('Hero search button clicked:', searchTerm);
                    filterTools(searchTerm);
                });
            }
        }
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Update active state
                navLinks.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Smooth scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Filter tools based on search term
function filterTools(searchTerm) {
    console.log('Filtering tools for:', searchTerm);
    
    const allToolsGrid = document.getElementById('allTools');
    if (!allToolsGrid) {
        console.error('Tools grid (#allTools) not found!');
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
                <h4 style="margin-bottom: 0.5rem;">No tools found for "${searchTerm}"</h4>
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
    const sectionTitle = document.querySelector('#tools h3');
    if (sectionTitle) {
        sectionTitle.textContent = title;
    }
}

// Populate all tools (without filtering)
function populateAllTools() {
    const allToolsGrid = document.getElementById('allTools');
    if (!allToolsGrid) return;

    allToolsGrid.innerHTML = '';
    tools.forEach(tool => {
        allToolsGrid.appendChild(createToolCard(tool));
    });
}

// Populate regular tools
function populateTools() {
    console.log('Populating tools...');
    
    const featuredToolsGrid = document.getElementById('featuredTools');
    const allToolsGrid = document.getElementById('allTools');

    if (!featuredToolsGrid || !allToolsGrid) {
        console.error('Tools grid elements not found!');
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
}

// Create regular tool card
function createToolCard(tool) {
    const card = document.createElement('a');
    card.href = `./tools/${tool.id}.html`;
    card.className = 'tool-card';
    card.innerHTML = `
        <div class="tool-icon">
            <i class="${tool.icon}"></i>
        </div>
        <h4>${tool.name}</h4>
        <p>${tool.description}</p>
        <span class="tool-category">${tool.category}</span>
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
}

// Add debug function
window.debugSearch = function() {
    console.log('=== DEBUG SEARCH ===');
    console.log('Search inputs found:');
    console.log('- toolSearch:', document.getElementById('toolSearch'));
    console.log('- heroSearch:', document.getElementById('heroSearch'));
    console.log('Tools grid found:', document.getElementById('allTools'));
    console.log('Featured tools grid found:', document.getElementById('featuredTools'));
    console.log('Tools data:', tools.length, 'tools loaded');
    console.log('====================');
};

// Call debug to check initialization
setTimeout(() => {
    window.debugSearch();
}, 1000);