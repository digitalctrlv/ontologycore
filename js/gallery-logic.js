/* js/gallery-logic.js */
/* Logic for the gallery: loading media, modal controls, and infinite scroll */

document.addEventListener('DOMContentLoaded', () => {
    
    // Check if we are on the page that contains the grid
    const grid = document.getElementById('pinterest-grid');
    if (grid) {
        initGallery();
    }
});

function initGallery() {
    const grid = document.getElementById('pinterest-grid');
    const mediaData = [
        { type: 'image', src: 'img/y2ktechmoodboard.jpeg' },
        { type: 'image', src: 'https://picsum.photos/id/1016/600/400' },
        { type: 'image', src: 'https://picsum.photos/id/1018/600/600' },
        { type: 'video', src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnail: 'https://picsum.photos/id/10/600/400' },
        { type: 'image', src: 'https://picsum.photos/id/102/600/900' },
        { type: 'image', src: 'https://picsum.photos/id/1022/600/500' },
        { type: 'iframe', src: 'https://www.youtube.com/embed/RPihB-Xaccw' },
    ];

    // Clear the grid
    grid.innerHTML = '';

    // Loop through mediaData and create elements
    mediaData.forEach((media) => {
        const item = document.createElement('div');
        item.classList.add('grid-item');

        if (media.type === 'image') {
            item.innerHTML = `<img src="${media.src}" alt="Media">`;
        } else if (media.type === 'video') {
            item.innerHTML = `
                <video controls>
                    <source src="${media.src}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        } else if (media.type === 'iframe') {
            item.innerHTML = `<iframe src="${media.src}" frameborder="0" allowfullscreen></iframe>`;
        }

        grid.appendChild(item);
    });
}