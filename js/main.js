/* ============================================================
   MATIAS MUÑOZ - Psicología Clínica & Deportiva
   Website JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Preloader ──
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('loaded');
    }, 800);
  });

  // Fallback: hide preloader after 3 seconds
  setTimeout(() => {
    preloader.classList.add('loaded');
  }, 3000);

  // ── Navbar Scroll Effect ──
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleNavScroll() {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Active nav link on scroll
  function updateActiveLink() {
    const scrollPos = window.scrollY + 150;
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', () => {
    handleNavScroll();
    updateActiveLink();
    handleBackToTop();
  });

  handleNavScroll();

  // ── Mobile Navigation ──
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ── Scroll Reveal Animations ──
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animations for siblings
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // ── Stats Counter Animation ──
  const statNumbers = document.querySelectorAll('.stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => {
    counterObserver.observe(stat);
  });

  function animateCounter(element) {
    const target = parseInt(element.dataset.count) || 0;
    const suffix = element.dataset.suffix || '';
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeOut);

      element.innerHTML = `${current}<span class="suffix">${suffix}</span>`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ── Testimonials Carousel ──
  const track = document.getElementById('testimonialsTrack');
  const dots = document.querySelectorAll('.testimonial-dot');
  let currentSlide = 0;
  const totalSlides = dots.length;

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  // Auto-advance testimonials
  let carouselInterval = setInterval(() => {
    goToSlide((currentSlide + 1) % totalSlides);
  }, 5000);

  // Pause on hover
  const carousel = document.querySelector('.testimonials-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    carousel.addEventListener('mouseleave', () => {
      carouselInterval = setInterval(() => {
        goToSlide((currentSlide + 1) % totalSlides);
      }, 5000);
    });
  }

  // ── Contact Form ──
  const contactForm = document.getElementById('contactForm');
  const formWrapper = document.getElementById('formWrapper');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simulate form submission
      const submitBtn = contactForm.querySelector('.form-submit');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      submitBtn.disabled = true;

      setTimeout(() => {
        formWrapper.style.display = 'none';
        formSuccess.classList.add('show');

        // Reset after 5 seconds
        setTimeout(() => {
          formWrapper.style.display = 'block';
          formSuccess.classList.remove('show');
          contactForm.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 5000);
      }, 1500);
    });
  }

  // ── Back to Top ──
  const backToTop = document.getElementById('backToTop');

  function handleBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Smooth scroll for all anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ── Parallax for hero particles ──
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const particles = document.querySelectorAll('.particle');
    particles.forEach((p, i) => {
      const speed = 0.02 * (i + 1);
      p.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });

  // ── Dynamic year in footer ──
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
