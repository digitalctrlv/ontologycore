// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Starting accordions...');
    
    // Category headers - НЕ скрываем изначально!
    document.querySelectorAll('.category-header').forEach(header => {
        header.style.cursor = 'pointer';
        
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.category-icon');
            
            if (content.style.display === 'none' || !content.style.display) {
                content.style.display = 'block';
                icon.textContent = '▼';
            } else {
                content.style.display = 'none';
                icon.textContent = '▶';
            }
        });
        
        // УБЕРИ эту строку - не скрываем категории изначально!
        // header.nextElementSibling.style.display = 'none';
    });
    
    // Class headers with data-target
    document.querySelectorAll('[data-target]').forEach(header => {
        header.style.cursor = 'pointer';
        
        header.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const target = document.getElementById(targetId);
            const toggle = this.querySelector('.class-toggle');
            
            if (target && toggle) {
                target.classList.toggle('active');
                toggle.textContent = target.classList.contains('active') ? '−' : '+';
            }
        });
    });
    
    console.log('🎉 Accordions ready! Try clicking now!');
});
