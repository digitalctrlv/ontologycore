document.addEventListener('DOMContentLoaded', () => {
            
    const contentArea = document.getElementById('content-area');
    const sidebar = document.getElementById('sidebarNav');
    
    // --- Mobile Toggle Button Listeners ---
    const openBtn = document.getElementById('sidebar-open-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');

    openBtn.addEventListener('click', () => {
        document.body.classList.remove('sidebar-closed');
    });
    closeBtn.addEventListener('click', () => {
        document.body.classList.add('sidebar-closed');
    });

    // --- Function to load content ---
function loadContent(url) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content-area').innerHTML = html;
            // Initialize gallery if we're on the homepage
            if (url === 'homepage.html') {
                const script = document.createElement('script');
                script.src = './js/gallery-logic.js';
                script.onload = () => {
                    // After script loads, initialize the gallery
                    if (typeof initGallery === 'function') {
                        initGallery();
                    }
                };
                document.body.appendChild(script);
            }
        })
        .catch(error => console.error('Error loading content:', error));
}
    // async function loadContent(url) {
    //     try {
    //         const response = await fetch(url);
    //         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
    //         const html = await response.text();
    //         contentArea.innerHTML = html;
            
    //         // Re-attach listeners for any buttons *inside* the new content
    //         attachDynamicButtonListeners();

    //     } catch (error) {
    //         console.error('Error loading page: ', error);
    //         contentArea.innerHTML = `<p>Could not load content. Check the filename and make sure you are running a local server.</p>`;
    //     }
    // }
    
    // --- Function to manage the "active" class ---
    function setActiveLink(clickedLink) {
        sidebar.querySelectorAll('a.nav-link').forEach(link => link.classList.remove('active'));
        if (clickedLink) {
            clickedLink.classList.add('active');
        }
    }

    // --- Function to open/close accordion ---
    function toggleAccordion(parentLi, forceOpen = false) {
        // Close all *other* open menus
        sidebar.querySelectorAll('li.open').forEach(openLi => {
            if (openLi !== parentLi) {
                openLi.classList.remove('open');
            }
        });

        if (forceOpen) {
            parentLi.classList.add('open');
        } else {
            parentLi.classList.toggle('open');
        }
    }

    // --- Event Listeners for Main navigation links (the text) ---
    sidebar.querySelectorAll('a.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); 
            const url = link.getAttribute('href');
            
            loadContent(url);
            setActiveLink(link);
            
            // Close all accordions when a main link is clicked
            sidebar.querySelectorAll('li.open').forEach(li => li.classList.remove('open'));
            
            if (window.innerWidth <= 900) {
                document.body.classList.add('sidebar-closed');
            }
        });
    });

    // --- Event Listeners for Toggle Buttons (the arrows) ---
    sidebar.querySelectorAll('.toggle-btn').forEach(btn => {
        const parentLi = btn.parentElement;
        const subMenu = parentLi.querySelector('ul');
        
        if (subMenu) {
            btn.addEventListener('click', (event) => {
                event.stopPropagation(); // Stop it from triggering the link click
                toggleAccordion(parentLi);
            });
        } else {
            btn.classList.add('no-submenu'); // Add class to hide it
        }
    });
    
    // --- Event Listeners for Sub-links (anchors) ---
    sidebar.querySelectorAll('a.sub-link').forEach(subLink => {
        subLink.addEventListener('click', async (event) => { // 'async' is key here
            event.preventDefault();
            
            const targetId = subLink.getAttribute('href').substring(1); // e.g., "dataset"
            
            // 1. Find the parent page this sub-link belongs to
            const parentLi = subLink.closest('ul').closest('li');
            const parentLink = parentLi.querySelector('a.nav-link');
            const parentUrl = parentLink.getAttribute('href'); // e.g., "knowledge-extraction.html"

            // 2. Find out which page is currently loaded
            const currentActiveLink = sidebar.querySelector('a.nav-link.active');
            
            // 3. Check if the correct page is already loaded
            if (currentActiveLink.getAttribute('href') !== parentUrl) {
                // 3a. NOT LOADED: Load the parent page, set it as active
                await loadContent(parentUrl); // 'await' waits for the page to load
                setActiveLink(parentLink);
            }
            
            // 3b. ENSURE ACCORDION IS OPEN
            // (It might be closed, especially if the page was just loaded)
            if (!parentLi.classList.contains('open')) {
                toggleAccordion(parentLi, true); // true = force open
            }

            // 4. NOW SCROLL (with a tiny delay for the DOM to be ready)
            // This is crucial, especially after an `await`
            setTimeout(() => {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    console.warn(`Anchor #${targetId} not found on page ${parentUrl}`);
                }
            }, 100); // 100ms delay to ensure DOM is painted

            // 5. On mobile, close the sidebar
            if (window.innerWidth <= 900) {
                document.body.classList.add('sidebar-closed');
            }
        });
    });
    
    // --- Function for dynamic buttons (like "Get Started") ---
    function attachDynamicButtonListeners() {
        const startLink = contentArea.querySelector('#start-exploring-link');
        if (startLink) {
            startLink.addEventListener('click', (e) => {
                e.preventDefault(); 
                const overviewLink = sidebar.querySelector('a[href="overview.html"]');
                if (overviewLink) {
                    overviewLink.click(); // Simulate a click on the "Overview" link
                }
            });
        }
    }

    // --- Load the default page (homepage) on opening ---
    loadContent('homepage.html');
    // Set the 'Home' link as active manually on first load
    setActiveLink(sidebar.querySelector('a[href="homepage.html"]'));
});