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
        { type: 'image', src: './website/img/y2ktechmoodboard.jpeg' },
        { type: 'image', src: './website/img/cottagecore.jpg' },
        { type: 'image', src: './website/img/new1.jpeg' },
        { type: 'image', src: './website/img/oldmoney2.jpg' },
        { type: 'image', src: './website/img/3.png' },
        { type: 'image', src: './website/img/y2k2.png' },
        { type: 'image', src: './website/img/new2.jpeg' },
        { type: 'image', src: './website/img/cleangirl3.jpeg' },
        { type: 'image', src: './website/img/darkacademia2.jpg' },
        { type: 'image', src: './website/img/grunge.png' },
        { type: 'image', src: './website/img/lightacademia2.jpeg' },
        { type: 'image', src: './website/img/new3.jpeg' },
        { type: 'image', src: './website/img/darkacademia4.png' },
        { type: 'image', src: './website/img/new5.jpeg' },
        { type: 'image', src: './website/img/weirdcore.jpeg' },
        { type: 'image', src: './website/img/4.png' },
        { type: 'image', src: './website/img/darkacademia.jpg' },
        { type: 'image', src: './website/img/new4.jpeg' },
        { type: 'image', src: './website/img/1.png' },
        { type: 'image', src: './website/img/new13.jpeg' },
        { type: 'image', src: './website/img/cleangirl2.png' },
        { type: 'image', src: './website/img/new7.jpeg' },
        { type: 'image', src: './website/img/vaporwave.jpeg' },
        { type: 'image', src: './website/img/new6.jpeg' },
        { type: 'image', src: './website/img/grune2.png' },
        { type: 'image', src: './website/img/8.jpeg' },
        { type: 'image', src: './website/img/cleangirl.jpg' },
        { type: 'image', src: './website/img/new12.jpeg' },
        { type: 'image', src: './website/img/new8.jpeg' },
        { type: 'image', src: './website/img/lightacademia.jpeg' },
        { type: 'image', src: './website/img/2.png' },
        { type: 'image', src: './website/img/oldmoney.jpg' },
        { type: 'image', src: './website/img/new9.jpeg' },
        { type: 'image', src: './website/img/9.jpeg' },
        { type: 'image', src: './website/img/new10.jpeg' },
        { type: 'image', src: './website/img/y2k3.jpg' },
        { type: 'image', src: './website/img/cottagecore2.png' },
        { type: 'image', src: './website/img/7.jpeg' },
        { type: 'image', src: './website/img/steampunk.jpeg' },
        { type: 'image', src: './website/img/grunge2.jpeg' },
        { type: 'image', src: './website/img/new11.jpeg' },
        { type: 'image', src: './website/img/darkacademia3.jpg' },
        { type: 'image', src: './website/img/5.png' },
        { type: 'image', src: './website/img/new14.jpeg' },
        { type: 'image', src: './website/img/y2k4.png' },
        { type: 'image', src: './website/img/oldmoney3.jpg' },
        { type: 'image', src: './website/img/new12.jpeg' },
        { type: 'image', src: './website/img/6.png' },


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