// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing accordions...');
    
    // Category headers (for main sections like "4Ps of Creativity")
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.category-icon');
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.textContent = '▼';
            } else {
                content.style.display = 'none';
                icon.textContent = '▶';
            }
        });
        
        // Initially hide category content
        const content = header.nextElementSibling;
        if (content) {
            content.style.display = 'none';
        }
    });
    
    // Class headers with data-target (for individual classes like Person, Process, etc.)
    document.querySelectorAll('[data-target]').forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const element = document.getElementById(targetId);
            const toggle = this.querySelector('.class-toggle');
            
            if (element && toggle) {
                element.classList.toggle('active');
                toggle.textContent = element.classList.contains('active') ? '−' : '+';
            }
        });
    });
    
    console.log('✅ Accordions initialized successfully!');
});
