/**
 * Traders Paradise - Background Particle Constellation Animation
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Particle configuration
  const particles = [];
  const particleCount = calculateParticleCount();
  const connectionDistance = 110;
  const mouseConnectionDistance = 160;

  // Track mouse coordinates
  const mouse = {
    x: null,
    y: null,
    radius: 150
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Handle window resizing
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Adjust particle count on resize
    adjustParticleCount();
  });

  // Helper to determine particle count based on screen size
  function calculateParticleCount() {
    const area = window.innerWidth * window.innerHeight;
    // Approximately 1 particle per 15000 square pixels, capped between 40 and 120
    return Math.min(Math.max(Math.floor(area / 15000), 40), 120);
  }

  // Particle Object definition
  class Particle {
    constructor() {
      this.reset();
      // Distribute randomly across the canvas initially
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 1.5 + 1.2; // Small delicate nodes
      this.vx = (Math.random() - 0.5) * 0.35; // Slow movement
      this.vy = (Math.random() - 0.5) * 0.35;
      
      // 80% gold, 20% white particles
      this.color = Math.random() > 0.2 ? '#ffbe1a' : '#ffffff';
      this.alpha = Math.random() * 0.5 + 0.3;
    }

    update() {
      // Movement
      this.x += this.vx;
      this.y += this.vy;

      // Soft borders: bounce off walls to keep them contained
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interactive push/pull effect
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < mouse.radius) {
          // Push particles away gently from the mouse cursor
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 0.6;
          this.y += Math.sin(angle) * force * 0.6;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 4;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow for line drawing
    }
  }

  // Initialize particle array
  function initParticles() {
    particles.length = 0;
    const count = calculateParticleCount();
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  // Adjust count dynamically on window resize without resetting all particles
  function adjustParticleCount() {
    const targetCount = calculateParticleCount();
    if (particles.length < targetCount) {
      const diff = targetCount - particles.length;
      for (let i = 0; i < diff; i++) {
        particles.push(new Particle());
      }
    } else if (particles.length > targetCount) {
      particles.splice(targetCount);
    }
  }

  // Connect particles with lines
  function drawConnections() {
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      
      // Connect to other particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectionDistance) {
          const alpha = (1 - (dist / connectionDistance)) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          // Highlight connection lines using a warm gold/orange tint
          ctx.strokeStyle = `rgba(255, 190, 26, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Connect to mouse if active
      if (mouse.x !== null && mouse.y !== null) {
        const dx = p1.x - mouse.x;
        const dy = p1.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouseConnectionDistance) {
          const alpha = (1 - (dist / mouseConnectionDistance)) * 0.2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw lines
    drawConnections();

    requestAnimationFrame(animate);
  }

  // Start Animation
  initParticles();
  animate();

  // Best Trading Platforms Slider Carousel
  const sliderContainer = document.querySelector('.slider-container');
  if (sliderContainer) {
    const track = sliderContainer.querySelector('.slider-track');
    const cards = sliderContainer.querySelectorAll('.platform-card');
    const prevBtn = sliderContainer.querySelector('.prev-arrow');
    const nextBtn = sliderContainer.querySelector('.next-arrow');
    const dots = sliderContainer.querySelectorAll('.slider-dot');
    
    let currentIndex = 0;
    const totalCards = cards.length;
    
    function getVisibleCards() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1100) return 2;
      return 3;
    }
    
    function updateSlider() {
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, totalCards - visibleCards);
      
      // Clamp current index
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;
      
      // Calculate card width dynamically (card width + gap)
      const gap = 32; // 2rem = 32px
      const containerWidth = sliderContainer.querySelector('.slider-track-wrapper').offsetWidth;
      
      // Calculate width of one card based on visibleCards
      let cardWidth;
      if (visibleCards === 1) {
        cardWidth = containerWidth;
      } else {
        cardWidth = (containerWidth - (gap * (visibleCards - 1))) / visibleCards;
      }
      
      // Set width of each card dynamically to prevent flex shrink/squeeze issues
      cards.forEach(card => {
        card.style.flex = `0 0 ${cardWidth}px`;
      });
      
      // Translate the track
      const translation = currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(-${translation}px)`;
      
      // Update Arrow Buttons disabled state
      if (currentIndex === 0) {
        prevBtn.classList.add('disabled');
      } else {
        prevBtn.classList.remove('disabled');
      }
      
      if (currentIndex >= maxIndex) {
        nextBtn.classList.add('disabled');
      } else {
        nextBtn.classList.remove('disabled');
      }
      
      // Update Dots active state
      dots.forEach((dot, index) => {
        // Map dot to slide index
        if (index === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
        
        // Hide/show dots dynamically: we only need dots up to (maxIndex + 1)
        if (index <= maxIndex) {
          dot.style.display = 'inline-block';
        } else {
          dot.style.display = 'none';
        }
      });
    }
    
    // Add Click listeners for arrows
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
      }
    });
    
    nextBtn.addEventListener('click', () => {
      const visibleCards = getVisibleCards();
      const maxIndex = totalCards - visibleCards;
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateSlider();
      }
    });
    
    // Add Click listeners for dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentIndex = index;
        updateSlider();
      });
    });
    
    // Update slider on resize
    window.addEventListener('resize', updateSlider);
    
    // Initial call after a brief timeout to let DOM render
    setTimeout(updateSlider, 100);
  }

  // Contact Form Validation and Submission
  const contactForm = document.getElementById('contact-form-el');
  const contactSuccessState = document.getElementById('contact-success-state');
  const resetFormBtn = document.getElementById('btn-reset-form');

  if (contactForm) {
    const inputs = contactForm.querySelectorAll('input[required], select[required], textarea[required]');

    // Helper: Check Gmail / Email Validity
    function isValidEmail(email) {
      // Basic pattern matching gmail or general email formats
      const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return pattern.test(email);
    }

    // Helper: Validate Single Field
    function validateField(input) {
      const formGroup = input.closest('.form-group');
      let isValid = true;

      if (input.required && !input.value.trim()) {
        isValid = false;
      } else if (input.type === 'email' && input.value.trim() && !isValidEmail(input.value)) {
        isValid = false;
      }

      if (isValid) {
        formGroup.classList.remove('is-invalid');
      } else {
        formGroup.classList.add('is-invalid');
      }

      return isValid;
    }

    // Input dynamic validation on blur / input events
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.closest('.form-group').classList.contains('is-invalid')) {
          validateField(input);
        }
      });
    });

    // Submit form
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isFormValid = true;
      inputs.forEach(input => {
        if (!validateField(input)) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        const submitBtn = contactForm.querySelector('#contact-submit-btn');
        const originalBtnContent = submitBtn.innerHTML;

        // Set Loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span>Sending...</span>
          <svg class="send-icon-svg animate-spin" viewBox="0 0 24 24" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25" stroke-dasharray="80" stroke-dashoffset="60"></circle></svg>
        `;

        const formData = {
          name: contactForm.querySelector('#contact-name').value.trim(),
          email: contactForm.querySelector('#contact-email').value.trim(),
          telegram: contactForm.querySelector('#contact-telegram').value.trim(),
          subject: contactForm.querySelector('#contact-subject').value,
          message: contactForm.querySelector('#contact-message').value.trim()
        };

        fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        .then(response => {
          if (response.ok) {
            // Hide Form and Show Success state
            contactForm.style.display = 'none';
            contactSuccessState.style.display = 'flex';
          } else {
            alert('Failed to send message. Please try again or contact us directly via Telegram.');
          }
        })
        .catch(error => {
          console.error('Error submitting form:', error);
          alert('An error occurred. Please check your connection and try again.');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnContent;
        });
      }
    });
  }

  if (resetFormBtn && contactForm && contactSuccessState) {
    resetFormBtn.addEventListener('click', () => {
      // Reset Form Fields
      contactForm.reset();
      
      // Remove error states if any
      contactForm.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('is-invalid');
      });

      // Toggle visibility
      contactSuccessState.style.display = 'none';
      contactForm.style.display = 'flex';
    });
  }

  // Mobile Navigation Drawer Toggle Controller
  const navMenu = document.getElementById('nav-menu-el');
  const openMenuBtn = document.getElementById('menu-toggle-open');
  const closeMenuBtn = document.getElementById('menu-toggle-close');
  const menuOverlay = document.getElementById('menu-overlay-el');

  if (openMenuBtn && closeMenuBtn && navMenu && menuOverlay) {
    const toggleMenu = (isOpen) => {
      if (isOpen) {
        navMenu.classList.add('is-active');
        menuOverlay.classList.add('is-active');
        document.body.classList.add('menu-open');
      } else {
        navMenu.classList.remove('is-active');
        menuOverlay.classList.remove('is-active');
        document.body.classList.remove('menu-open');
      }
    };

    openMenuBtn.addEventListener('click', () => toggleMenu(true));
    closeMenuBtn.addEventListener('click', () => toggleMenu(false));
    menuOverlay.addEventListener('click', () => toggleMenu(false));

    // Auto-close menu drawer when clicking a navigation link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }
});
