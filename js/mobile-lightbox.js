/**
 * Mobile Lightbox - Simple, touch-friendly image gallery
 * Replaces prettyPhoto on mobile devices (< 768px)
 */
(function() {
  'use strict';

  var lightbox = null;
  var images = [];
  var currentIndex = 0;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function createLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'mobile-lightbox';
    lightbox.innerHTML =
      '<button class="lightbox-close" aria-label="Schliessen">&times;</button>' +
      '<img src="" alt="Galerie Bild">' +
      '<div class="lightbox-nav">' +
        '<button class="lightbox-btn lightbox-prev" aria-label="Vorheriges Bild">&#10094;</button>' +
        '<span class="lightbox-counter">1 / 1</span>' +
        '<button class="lightbox-btn lightbox-next" aria-label="Naechstes Bild">&#10095;</button>' +
      '</div>';
    document.body.appendChild(lightbox);

    // Event listeners
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', showPrev);
    lightbox.querySelector('.lightbox-next').addEventListener('click', showNext);

    // Close on background click
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!lightbox || !lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    // Swipe support
    var touchStartX = 0;
    lightbox.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function(e) {
      var touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) showNext();
        else showPrev();
      }
    }, { passive: true });
  }

  function openLightbox(gallery, index) {
    images = gallery;
    currentIndex = index || 0;
    if (!lightbox) createLightbox();
    updateImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }

  function updateImage() {
    var img = lightbox.querySelector('img');
    img.src = images[currentIndex];
    lightbox.querySelector('.lightbox-counter').textContent =
      (currentIndex + 1) + ' / ' + images.length;

    // Hide nav buttons if only one image
    var nav = lightbox.querySelector('.lightbox-nav');
    nav.style.display = images.length > 1 ? 'flex' : 'none';
  }

  function initGalleries() {
    // Find all prettyPhoto galleries
    var galleries = {};
    var links = document.querySelectorAll('a[rel^="prettyPhoto"]');

    if (links.length === 0) return;

    links.forEach(function(link) {
      var rel = link.getAttribute('rel');
      var match = rel.match(/\[([^\]]+)\]/);
      var galleryName = match ? match[1] : 'default';

      if (!galleries[galleryName]) {
        galleries[galleryName] = [];
      }
      galleries[galleryName].push(link.href);

      link.addEventListener('click', function(e) {
        // Check mobile at click time, not at init time
        if (!isMobile()) return; // Let prettyPhoto handle it on desktop

        e.preventDefault();
        e.stopPropagation();
        var index = galleries[galleryName].indexOf(this.href);
        openLightbox(galleries[galleryName], index);
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleries);
  } else {
    initGalleries();
  }
})();
