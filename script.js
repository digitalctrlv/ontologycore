function toggleClass(elementId) {
    const element = document.getElementById(elementId);
    const toggle = element.previousElementSibling.querySelector('.class-toggle');
    
    element.classList.toggle('active');
    toggle.textContent = element.classList.contains('active') ? '−' : '+';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize category headers
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.category-icon');
            
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            icon.textContent = content.style.display === 'none' ? '▶' : '▼';
        });
    });
});
