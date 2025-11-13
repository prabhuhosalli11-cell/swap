// ============================================
// SKILLXCHANGE LANDING PAGE ANIMATIONS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe stat items
    document.querySelectorAll('.stat-item').forEach(item => {
        observer.observe(item);
    });

    // Observe advantage cards
    document.querySelectorAll('.advantage-card').forEach(card => {
        observer.observe(card);
    });

    // Animate numbers in stats
    const animateValue = (element, start, end, duration) => {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            
            // Format number with K+ suffix
            const value = Math.floor(current);
            const text = element.textContent;
            
            if (text.includes('K+')) {
                element.textContent = (value / 1000).toFixed(value >= 1000 ? 1 : 0) + 'K+';
            } else if (text.includes('+')) {
                element.textContent = value.toLocaleString() + '+';
            } else {
                element.textContent = value.toLocaleString();
            }
        }, 16);
    };

    // Observer for stats animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const h2 = entry.target.querySelector('h2');
                const text = h2.textContent;
                
                // Extract number from text
                let targetNumber = 0;
                if (text.includes('110K')) {
                    targetNumber = 1100;
                    h2.textContent = '0K+';
                    animateValue(h2, 0, 1100, 2000);
                } else if (text.includes('2.500')) {
                    targetNumber = 2500;
                    h2.textContent = '0';
                    animateValue(h2, 0, 2500, 2000);
                } else if (text.includes('3 10')) {
                    targetNumber = 310;
                    h2.textContent = '0+';
                    animateValue(h2, 0, 310, 2000);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-item').forEach(item => {
        statsObserver.observe(item);
    });

    // Parallax effect for background orbs
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animateOrbs() {
        currentX += (mouseX - currentX) * 0.05;
        currentY += (mouseY - currentY) * 0.05;

        document.querySelectorAll('.orb').forEach((orb, index) => {
            const speed = (index + 1) * 10;
            orb.style.transform = `translate(${currentX * speed}px, ${currentY * speed}px)`;
        });

        requestAnimationFrame(animateOrbs);
    }

    animateOrbs();

    // Exchange visual animation
    const exchangeArrows = document.querySelector('.exchange-arrows');
    if (exchangeArrows) {
        let rotation = 0;
        setInterval(() => {
            rotation += 0.5;
            exchangeArrows.style.transform = `rotate(${rotation}deg)`;
        }, 50);
    }

    // Skill icons floating animation
    const skillIcons = document.querySelectorAll('.skill-icon');
    skillIcons.forEach((icon, index) => {
        let offset = 0;
        setInterval(() => {
            offset += 0.02;
            const y = Math.sin(offset + index * Math.PI) * 10;
            icon.style.transform = `translateY(${y}px)`;
        }, 50);
    });

    // Panel inputs animation
    const panelInputs = document.querySelectorAll('.panel-input');
    panelInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Button click effects
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-connect, .btn-cta').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(30, 41, 59, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(30, 41, 59, 0.5)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // Typing effect for hero title (optional)
    const gradientText = document.querySelector('.gradient-text');
    if (gradientText) {
        const text = gradientText.textContent;
        gradientText.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
            if (i < text.length) {
                gradientText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 500);
    }

    // Connect button interaction
    const connectBtn = document.querySelector('.btn-connect');
    if (connectBtn) {
        connectBtn.addEventListener('click', function() {
            // Check if inputs are filled
            const inputs = document.querySelectorAll('.panel-input');
            let allFilled = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    allFilled = false;
                    input.style.borderColor = '#ef4444';
                    setTimeout(() => {
                        input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }, 2000);
                }
            });
            
            if (allFilled) {
                // Redirect to home page or show success message
                window.location.href = 'home.html';
            }
        });
    }

    // Add sparkle effect to buttons
    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.position = 'fixed';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = 'white';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '9999';
        sparkle.style.animation = 'sparkle 1s ease-out forwards';
        
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }

    const sparkleStyle = document.createElement('style');
    sparkleStyle.textContent = `
        @keyframes sparkle {
            0% {
                transform: scale(0) translateY(0);
                opacity: 1;
            }
            100% {
                transform: scale(1) translateY(-30px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(sparkleStyle);

    // Add sparkles on button hover
    document.querySelectorAll('.btn-primary, .btn-cta').forEach(button => {
        button.addEventListener('mouseenter', function() {
            const rect = this.getBoundingClientRect();
            const interval = setInterval(() => {
                const x = rect.left + Math.random() * rect.width;
                const y = rect.top + Math.random() * rect.height;
                createSparkle(x, y);
            }, 100);
            
            button.addEventListener('mouseleave', () => {
                clearInterval(interval);
            }, { once: true });
        });
    });

    console.log('🚀 SkillXchange Landing Page Loaded Successfully!');
});
