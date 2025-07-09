document.addEventListener('DOMContentLoaded', function() {
    // Get current URL
    const blockedUrl = window.location.href;
    document.getElementById('blocked-url').textContent = 'Requested URL: ' + blockedUrl;
    
    // Update time every second
    function updateTime() {
        const now = new Date();
        const formattedTime = now.toISOString().replace('T', ' ').substring(0, 19);
        document.getElementById('current-time').textContent = formattedTime;
    }
    
    updateTime();
    setInterval(updateTime, 1000);
    
    // Back button functionality
    document.getElementById('back-button').addEventListener('click', function() {
        window.history.back();
    });
    
    // Report form functionality
    const reportButton = document.getElementById('report-button');
    const reportForm = document.getElementById('report-form');
    const cancelButton = document.getElementById('cancel-report');
    const form = document.getElementById('issue-form');
    
    reportButton.addEventListener('click', function() {
        reportForm.classList.remove('hidden');
        document.querySelector('.content').style.filter = 'blur(3px)';
    });
    
    cancelButton.addEventListener('click', function() {
        reportForm.classList.add('hidden');
        document.querySelector('.content').style.filter = 'none';
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulate form submission
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        setTimeout(function() {
            reportForm.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: #4CAF50; margin-bottom: 1rem;"></i>
                    <h2>Thank You!</h2>
                    <p>Your request has been submitted and will be reviewed by an administrator.</p>
                    <p>Reference ID: REF-${Math.floor(Math.random() * 10000)}</p>
                    <button id="close-form" class="btn primary" style="margin-top: 1.5rem;">Close</button>
                </div>
            `;
            
            document.getElementById('close-form').addEventListener('click', function() {
                reportForm.classList.add('hidden');
                document.querySelector('.content').style.filter = 'none';
            });
        }, 1500);
    });
    
    // Add visual feedback on buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(2px)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Easter egg - Konami code
    let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', function(e) {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            
            if (konamiIndex === konamiCode.length) {
                document.body.style.backgroundImage = 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)';
                document.body.style.transition = 'background-image 1s ease';
                
                const content = document.querySelector('.content');
                content.innerHTML = `
                    <h1 style="color: #333;">You found me! 🎮</h1>
                    <p>But this site is still blocked. Nice try though!</p>
                    <img src="https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif" alt="Nice try" style="max-width: 100%; margin-top: 20px; border-radius: 8px;">
                    <button class="btn primary" style="margin-top: 20px;" onclick="location.reload()">Reset</button>
                `;
                
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    // Add 3D tilt effect to main content
    const content = document.querySelector('.content');
    
    content.addEventListener('mousemove', function(e) {
        const { left, top, width, height } = this.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        
        const tiltX = (y - 0.5) * 5;
        const tiltY = (0.5 - x) * 5;
        
        this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    
    content.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
});
