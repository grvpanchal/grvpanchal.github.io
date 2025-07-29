/**
 * Blog Feed Reader - Simplified and Reliable
 * Fetches latest blogs from RSS feed using reliable proxy services
 */

class BlogFeedReader {
    constructor() {
        this.RSS_URL = 'https://blog.grvpanchal.me/feeds/posts/default';
        this.MAX_POSTS = 6;
        
        // Simplified proxy list with proven reliable services
        this.PROXIES = [
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url='
        ];
    }

    /**
     * Try fetching RSS feed using different proxy services
     */
    async fetchFeed() {
        // First, try each proxy service
        for (const proxy of this.PROXIES) {
            try {
                console.log(`Trying proxy: ${proxy}`);
                
                const proxyUrl = proxy.includes('quest=') 
                    ? proxy + encodeURIComponent(this.RSS_URL)
                    : proxy + encodeURIComponent(this.RSS_URL);
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
                    }
                });

                if (response.ok) {
                    const xmlText = await response.text();
                    if (xmlText && xmlText.trim().startsWith('<')) {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                        
                        if (!xmlDoc.querySelector('parsererror')) {
                            console.log('Successfully fetched RSS feed via proxy');
                            return xmlDoc;
                        }
                    }
                }
            } catch (error) {
                console.warn(`Proxy failed: ${proxy}`, error.message);
            }
        }

        // If all proxies fail, try direct fetch as last resort
        try {
            console.log('Trying direct fetch...');
            const response = await fetch(this.RSS_URL);
            if (response.ok) {
                const xmlText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                console.log('Successfully fetched RSS feed directly');
                return xmlDoc;
            }
        } catch (error) {
            console.warn('Direct fetch failed:', error.message);
        }

        console.error('All RSS fetch methods failed');
        return null;
    }

    /**
     * Parse blog entry from XML entry element
     */
    parseBlogEntry(entry) {
        const getTextContent = (selector) => {
            const element = entry.querySelector(selector);
            return element ? element.textContent.trim() : '';
        };

        const title = getTextContent('title');
        const link = entry.querySelector('link[rel="alternate"]')?.getAttribute('href') || '';
        const published = getTextContent('published');
        const content = getTextContent('content');
        const categories = Array.from(entry.querySelectorAll('category')).map(cat => cat.getAttribute('term')).filter(Boolean);

        // Extract the first image from content
        const featuredImage = this.extractFeaturedImage(content);

        return {
            title,
            link,
            published,
            content,
            categories,
            featuredImage
        };
    }

    /**
     * Extract the first image URL from HTML content
     */
    extractFeaturedImage(content) {
        if (!content) return null;

        // Create a temporary div to parse HTML safely
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // Look for the first img tag
        const firstImg = tempDiv.querySelector('img');
        if (firstImg) {
            const src = firstImg.getAttribute('src');
            const alt = firstImg.getAttribute('alt') || '';
            
            // Validate that it's a proper image URL
            if (src && (src.startsWith('http') || src.startsWith('//'))) {
                return { src, alt };
            }
        }

        // Also check for images in media:content or media:thumbnail (common in RSS feeds)
        const mediaContent = tempDiv.querySelector('media\\:content, content[medium="image"]');
        if (mediaContent) {
            const url = mediaContent.getAttribute('url');
            if (url) {
                return { src: url, alt: 'Blog featured image' };
            }
        }

        return null;
    }

    /**
     * Create excerpt from content
     */
    createExcerpt(content, maxLength = 120) {
        if (!content) return '';
        
        // Remove HTML tags and decode entities
        const textContent = content.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
        
        if (textContent.length <= maxLength) return textContent;
        
        const excerpt = textContent.substr(0, maxLength);
        const lastSpace = excerpt.lastIndexOf(' ');
        
        return lastSpace > 0 ? excerpt.substr(0, lastSpace) + '...' : excerpt + '...';
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Create HTML for a single blog card using Chota CSS classes
     */
    createBlogCard(blog) {
        const publishedDate = new Date(blog.published).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Create tags using Chota's tag component
        const tagsHTML = blog.categories.length > 0 
            ? blog.categories.slice(0, 3).map(tag => 
                `<span class="tag is-small">${this.escapeHtml(tag)}</span>`
              ).join(' ')
            : '';

        // Create featured image HTML if available
        const featuredImageHTML = blog.featuredImage 
            ? `<div class="blog-image" style="margin-bottom: 1rem;">
                 <img src="${blog.featuredImage.src}" 
                      alt="${this.escapeHtml(blog.featuredImage.alt)}"
                      loading="lazy"
                      onerror="this.style.display='none'">
               </div>`
            : '';

        return `
            <div class="col-12 col-4-md col-4-lg">
                <div class="card" style="height: 100%; display: flex; flex-direction: column;">
                    ${featuredImageHTML}
                    <header>
                        <h4 style="margin-bottom: 0.5rem; line-height: 1.3;">
                            <a href="${blog.link}" target="_blank" rel="noopener" 
                               style="text-decoration: none; color: inherit;">
                                ${this.escapeHtml(blog.title)}
                            </a>
                        </h4>
                        <div style="margin-bottom: 1rem;">
                            <small class="text-grey">${publishedDate}</small>
                        </div>
                    </header>
                    
                    <div style="flex: 1; margin-bottom: 1rem;">
                        ${tagsHTML ? `<div style="margin-bottom: 1rem;">${tagsHTML}</div>` : ''}
                    </div>
                    
                    <footer class="is-right">
                        <a href="${blog.link}" target="_blank" rel="noopener" 
                           class="button primary">
                            Read More
                        </a>
                    </footer>
                </div>
            </div>
        `;
    }

    /**
     * Load fallback blogs from JSON file
     */
    async loadFallbackBlogs() {
        try {
            const response = await fetch('./assets/js/fallback-blogs.json');
            if (response.ok) {
                const blogs = await response.json();
                console.log('Loaded fallback blogs from JSON');
                return blogs;
            }
        } catch (error) {
            console.error('Failed to load fallback blogs:', error);
        }
        return [];
    }

    /**
     * Main method to load and display featured blogs
     */
    async loadFeaturedBlogs() {
        const loadingHTML = `
            <div class="col-12 text-center">
                <p class="text-grey">Loading latest blogs...</p>
            </div>
        `;

        const errorHTML = `
            <div class="col-12 text-center">
                <div class="card">
                    <p class="text-error">Unable to load latest blogs. Showing cached content.</p>
                </div>
            </div>
        `;

        const blogContainer = document.querySelector('#featured-blogs-container');
        if (!blogContainer) {
            console.error('Blog container not found');
            return;
        }

        // Show loading state
        blogContainer.innerHTML = loadingHTML;

        let blogs = [];

        try {
            // Try to fetch from RSS feed first
            const xmlDoc = await this.fetchFeed();
            if (xmlDoc) {
                const entries = xmlDoc.querySelectorAll('entry');
                if (entries.length > 0) {
                    blogs = Array.from(entries)
                        .slice(0, this.MAX_POSTS)
                        .map(entry => this.parseBlogEntry(entry))
                        .filter(blog => blog.title && blog.link && blog.link !== '#');
                    
                    console.log(`Successfully loaded ${blogs.length} blog posts from RSS feed`);
                }
            }
        } catch (error) {
            console.error('RSS fetch failed:', error);
        }

        // If RSS failed or returned no blogs, use fallback
        if (blogs.length === 0) {
            console.log('RSS feed failed, using fallback blogs');
            blogs = await this.loadFallbackBlogs();
        }

        // Display blogs or error message
        if (blogs.length > 0) {
            const blogsHTML = blogs.slice(0, this.MAX_POSTS).map(blog => this.createBlogCard(blog)).join('');
            blogContainer.innerHTML = blogsHTML;
        } else {
            blogContainer.innerHTML = errorHTML;
        }
    }

    /**
     * Initialize the blog feed reader
     */
    init() {
        // Load blogs when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadFeaturedBlogs());
        } else {
            this.loadFeaturedBlogs();
        }
    }
}

// Auto-initialize when script loads
const blogFeedReader = new BlogFeedReader();
blogFeedReader.init();
