/**
 * Blog Feed Reader
 * Renders the latest blog posts from the featured-blogs JSON endpoint, falling back to
 * the bundled assets/js/fallback-blogs.json when the endpoint is unavailable.
 */

class BlogFeedReader {
    constructor() {
        // JSON endpoint (n8n "Site - Featured Blogs API" workflow) that returns the latest
        // posts already shaped for the cards below, with CORS enabled. Browsers can't read
        // the Blogger feed directly (no CORS headers), and the public CORS proxies this used
        // to rely on are dead (codetabs 522, cors-anywhere 403, allorigins timeout).
        this.API_URL = (typeof window !== 'undefined' && window.FEATURED_BLOGS_URL) || '';
        this.MAX_POSTS = 6;
        this.TIMEOUT_MS = 6000;
    }

    /**
     * Fetch posts from the featured-blogs endpoint. Returns [] on any failure.
     */
    async fetchPosts() {
        if (!this.API_URL) return [];
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), this.TIMEOUT_MS) : null;
        try {
            const response = await fetch(this.API_URL, {
                headers: { Accept: 'application/json' },
                signal: controller ? controller.signal : undefined,
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const posts = await response.json();
            return Array.isArray(posts)
                ? posts.filter(p => p && p.title && p.link && /^https?:\/\//.test(p.link))
                : [];
        } catch (error) {
            console.warn('Featured blogs fetch failed:', error.message);
            return [];
        } finally {
            if (timer) clearTimeout(timer);
        }
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
     * Escape a value for use inside a double-quoted HTML attribute
     */
    escapeAttr(text) {
        return String(text || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
        const categories = Array.isArray(blog.categories) ? blog.categories : [];
        const tagsHTML = categories.length > 0 
            ? categories.slice(0, 3).map(tag => 
                `<span class="tag is-small">${this.escapeHtml(tag)}</span>`
              ).join(' ')
            : '';

        // Create featured image HTML if available
        const featuredImageHTML = blog.featuredImage 
            ? `<div class="blog-image" style="margin-bottom: 1rem;">
                 <img src="${this.escapeAttr(blog.featuredImage.src)}" 
                      alt="${this.escapeAttr(blog.featuredImage.alt)}"
                      loading="lazy"
                      onerror="this.style.display='none'">
               </div>`
            : '';

        return `
            <div class="col-12 col-4-md col-4-lg">
                <div class="card" style="height: 100%; display: flex; flex-direction: column;">
                    ${featuredImageHTML}
                    <header>
                        <h2 class="blog-card-title" style="margin-bottom: 0.5rem; line-height: 1.3;">
                            <a href="${this.escapeAttr(blog.link)}" target="_blank" rel="noopener"
                               style="text-decoration: none; color: inherit;">
                                ${this.escapeHtml(blog.title)}
                            </a>
                        </h2>
                        <div style="margin-bottom: 1rem;">
                            <small class="text-grey">${publishedDate}</small>
                        </div>
                    </header>
                    
                    <div style="flex: 1; margin-bottom: 1rem;">
                        ${tagsHTML ? `<div style="margin-bottom: 1rem;">${tagsHTML}</div>` : ''}
                    </div>
                    
                    <footer class="is-right">
                        <a href="${this.escapeAttr(blog.link)}" target="_blank" rel="noopener"
                           class="button primary">
                            Read More<span class="sr-only"> about ${this.escapeHtml(blog.title)}</span>
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

        blogs = await this.fetchPosts();

        // Endpoint unreachable or empty: use the bundled fallback list
        if (blogs.length === 0) {
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
        // Defer the (network-heavy, below-the-fold) feed load until the page is
        // fully loaded and the main thread is idle, so it never competes with the
        // hero's first/largest contentful paint.
        const start = () => this.loadFeaturedBlogs();
        const schedule = () =>
            'requestIdleCallback' in window
                ? requestIdleCallback(start, { timeout: 2000 })
                : setTimeout(start, 200);

        if (document.readyState === 'complete') {
            schedule();
        } else {
            window.addEventListener('load', schedule);
        }
    }
}

// Auto-initialize when script loads
const blogFeedReader = new BlogFeedReader();
blogFeedReader.init();
