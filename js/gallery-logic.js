/* js/gallery-logic.js */
/* Logic for the gallery: loading media, modal controls, and infinite scroll */
function initGallery() {
    const grid = document.getElementById('pinterest-grid');
    const modal = document.getElementById('media-modal');
    const modalContent = document.getElementById('modal-content-container');
    const closeBtn = document.getElementById('modal-close');

    if (!grid || !modal || !modalContent || !closeBtn) {
        console.error('Required elements not found');
        return;
    }

    let currentIndex = 0;


    const mediaData = [
        { type: 'image', src: 'img/y2ktechmoodboard.jpeg' },
        { type: 'image', src: 'img/cottagecore.jpg' },
        { type: 'image', src: 'img/oldmoney2.jpg' },
        { type: 'image', src: 'img/y2k2.png' },
        { type: 'image', src: 'img/darkacademia2.jpg' },
        { type: 'image', src: 'img/grunge.png' },
        { type: 'image', src: 'img/darkacademia.jpg' },
        { type: 'image', src: 'img/cleangirl2.png' },
        { type: 'image', src: 'img/grunge2.png' },
        { type: 'image', src: 'img/cleangirl.jpg' },
        { 
            type: 'iframe', 
            src: 'https://www.youtube.com/embed/L_Guz7h8r20' 
        },
        { type: 'image', src: 'img/oldmoney.jpg' },
        { type: 'image', src: 'img/y2k3.jpg' },
        { type: 'image', src: 'img/cottagecore2.png' },
        { type: 'image', src: 'img/darkacademia3.jpg' },
        { type: 'image', src: 'img/y2k4.png' },
        { type: 'image', src: 'img/oldmoney3.jpg' },


    ];

    // Clear the grid
    grid.innerHTML = '';


    // Loop through mediaData and create elements
    mediaData.forEach((media, index) => {
        const item = document.createElement('div');
        item.classList.add('grid-item');

        // Add staggered animation
        item.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.15}s`;

        if (media.type === 'image') {
            const img = new Image();
            img.src = media.src;
            img.loading = 'lazy'; // Enable lazy loading
            img.alt = 'Gallery item';
            item.appendChild(img);
        } else if (media.type === 'video') {
            item.innerHTML = `
                <video controls poster="${media.thumbnail}">
                    <source src="${media.src}" type="video/mp4">
                </video>`;
        } else if (media.type === 'iframe') {
            item.innerHTML = `<iframe src="${media.src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        }

        // Add click event to open modal
        item.addEventListener('click', () => openModal(index));
        grid.appendChild(item);
    });
    
    // Modal functions
    function openModal(index) {
        const media = mediaData[index];
        let content = '';

        if (media.type === 'image') {
            content = `<img src="${media.src}" alt="Media">`;
        } else if (media.type === 'video') {
            content = `
                <video controls autoplay>
                    <source src="${media.src}" type="video/mp4">
                </video>`;
        } else if (media.type === 'iframe') {
            // ✅ SOLUTION: Use the full iframe code with all permissions
            content = `<iframe src="${media.src} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        }
        modalContent.innerHTML = `
            ${content}
            <div class="modal-nav">
                <button onclick="navigateModal(${index - 1})" ${index === 0 ? 'disabled' : ''}>Previous</button>
                <button onclick="navigateModal(${index + 1})" ${index === mediaData.length - 1 ? 'disabled' : ''}>Next</button>
            </div>`;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    // Expose navigation function globally
    window.navigateModal = (index) => {
        if (index >= 0 && index < mediaData.length) {
            openModal(index);
        }
    };

    // Close modal event
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
            const currentIndex = parseInt(modalContent.querySelector('.modal-nav button:last-child').getAttribute('onclick').match(/\d+/)[0]) - 1;
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                navigateModal(currentIndex - 1);
            } else if (e.key === 'ArrowRight' && currentIndex < mediaData.length - 1) {
                navigateModal(currentIndex + 1);
            } else if (e.key === 'Escape') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
}