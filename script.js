/**
 * SHIVAM MISHRA - PORTFOLIO CORE SCRIPT (2026)
 * Built with plain JavaScript, Lenis, and GSAP ScrollTrigger.
 */

// ============================================================================
// 1. GLOBAL CONTACT DATA OBJECT
// ============================================================================
const CONTACT = {
  name: "Shivam Mishra",
  email: "8hivammishra8@gmail.com",
  whatsappDigits: "919899452192",
  phone: "+919899452192",
  phoneDisplay: "91+ 9899452192",
  instagram: "shivam.0nyx",
  whatsappUrl: "https://wa.me/919899452192?text=" + encodeURIComponent("Hi Shivam, I saw your portfolio and would like to discuss a project.")
};

// Mark motion script initialization flag for inline fail-safe check
window.__motionReady = true;

// ============================================================================
// 2. DOM INITIALIZATION
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);

  // Setup Dynamic Link Attributes
  populateContactLinks();

  // Initialize Core Systems
  initOpeningScreen(prefersReduced);
  initMobileNavigation();
  initNavbarScroll();
  
  if (!prefersReduced) {
    const lenisInstance = initSmoothScroll(isTouchDevice);
    initAnimations(lenisInstance);
  } else {
    initStaticFallbacks();
  }
});

// ============================================================================
// 3. POPULATE CONTACT LINKS
// ============================================================================
function populateContactLinks() {
  const waLinks = document.querySelectorAll("[data-contact='whatsapp']");
  waLinks.forEach(link => {
    link.setAttribute("href", CONTACT.whatsappUrl);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  const emailLinks = document.querySelectorAll("[data-contact='email']");
  emailLinks.forEach(link => {
    link.setAttribute("href", `mailto:${CONTACT.email}`);
  });

  const phoneLinks = document.querySelectorAll("[data-contact='phone']");
  phoneLinks.forEach(link => {
    link.setAttribute("href", `tel:${CONTACT.phone}`);
  });

  const igLinks = document.querySelectorAll("[data-contact='instagram']");
  igLinks.forEach(link => {
    link.setAttribute("href", `https://instagram.com/${CONTACT.instagram}`);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

// ============================================================================
// 4. OPENING PRELOADER LOGIC
// ============================================================================
function initOpeningScreen(prefersReduced) {
  const openingEl = document.getElementById("opening-screen");
  const counterEl = document.getElementById("opening-counter");
  const skipBtn = document.getElementById("opening-skip");

  if (!openingEl) return;

  let hasSeen = false;
  try {
    hasSeen = sessionStorage.getItem("sm_portfolio_seen_2026") === "true";
  } catch (err) {
    hasSeen = false;
  }

  // Dismiss if already seen or user prefers reduced motion
  if (hasSeen || prefersReduced) {
    openingEl.style.display = "none";
    openingEl.remove();
    document.body.classList.remove("is-locked");
    return;
  }

  document.body.classList.add("is-locked");

  let isDismissed = false;

  const dismissOpening = () => {
    if (isDismissed) return;
    isDismissed = true;
    try {
      sessionStorage.setItem("sm_portfolio_seen_2026", "true");
    } catch (err) {
      // Storage unavailable or quota exceeded
    }

    if (window.gsap && !prefersReduced) {
      gsap.to(openingEl, {
        yPercent: -100,
        duration: 0.9,
        ease: "expo.out",
        onComplete: () => {
          document.body.classList.remove("is-locked");
          openingEl.remove();
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }
      });
    } else {
      openingEl.style.display = "none";
      document.body.classList.remove("is-locked");
      openingEl.remove();
    }
  };

  // Skip Button & Escape key support
  if (skipBtn) {
    skipBtn.addEventListener("click", dismissOpening);
  }

  const handleKeydown = (e) => {
    if (e.key === "Escape") {
      dismissOpening();
      window.removeEventListener("keydown", handleKeydown);
    }
  };
  window.addEventListener("keydown", handleKeydown);

  // Hard safety timeout: Ensure opening never blocks the view past 3 seconds
  setTimeout(dismissOpening, 3000);

  // Counter Number Increment
  let currentVal = 0;
  const targetVal = 100;
  const duration = 1500;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    if (isDismissed) return;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    currentVal = Math.floor(progress * targetVal);

    if (counterEl) {
      counterEl.textContent = String(currentVal).padStart(3, "0");
    }

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      setTimeout(dismissOpening, 150);
    }
  }

  requestAnimationFrame(updateCounter);
}

// ============================================================================
// 5. UNIFIED SMOOTH SCROLL (LENIS + GSAP TICKER)
// ============================================================================
function initSmoothScroll(isTouchDevice) {
  if (typeof Lenis === "undefined" || typeof gsap === "undefined") {
    return null;
  }

  // Register ScrollTrigger plugin
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Native scroll feel on touch devices; smooth scroll on desktop
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: !isTouchDevice,
    touchMultiplier: 1.5,
    autoRaf: false
  });

  // Synchronize Lenis scroll positions directly with ScrollTrigger
  if (typeof ScrollTrigger !== "undefined") {
    lenis.on("scroll", ScrollTrigger.update);
  }

  // Single centralized animation loop via GSAP ticker
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// ============================================================================
// 6. SCROLL PROGRESS & NAVBAR CONTROLS
// ============================================================================
function initNavbarScroll() {
  const nav = document.getElementById("site-nav");
  const progressBar = document.getElementById("scroll-progress");
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Progress bar scaleX calculation
    if (progressBar && maxScroll > 0) {
      const progress = Math.min(Math.max(currentScrollY / maxScroll, 0), 1);
      progressBar.style.transform = `scaleX(${progress})`;
    }

    // Navbar hide-on-scroll-down, show-on-scroll-up
    if (!nav) return;
    if (currentScrollY > 120 && currentScrollY > lastScrollY) {
      nav.classList.add("is-hidden");
    } else {
      nav.classList.remove("is-hidden");
    }

    lastScrollY = Math.max(0, currentScrollY);
  }, { passive: true });
}

// ============================================================================
// 7. MOBILE MENU MODAL DIALOG (FOCUS TRAP & A11Y)
// ============================================================================
function initMobileNavigation() {
  const trigger = document.getElementById("mobile-menu-trigger");
  const dialog = document.getElementById("mobile-menu-dialog");
  const closeBtn = document.getElementById("mobile-menu-close");
  const menuLinks = dialog ? dialog.querySelectorAll("a") : [];

  if (!trigger || !dialog) return;

  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let previouslyFocusedElement = null;

  const openMenu = () => {
    previouslyFocusedElement = document.activeElement;
    dialog.classList.add("is-active");
    dialog.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-locked");

    const focusables = dialog.querySelectorAll(focusableSelector);
    if (focusables.length > 0) {
      focusables[0].focus();
    }
    document.addEventListener("keydown", trapFocus);
  };

  const closeMenu = () => {
    dialog.classList.remove("is-active");
    dialog.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
    document.removeEventListener("keydown", trapFocus);

    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === "function") {
      previouslyFocusedElement.focus();
    }
  };

  const trapFocus = (e) => {
    if (e.key === "Escape") {
      closeMenu();
      return;
    }

    if (e.key !== "Tab") return;

    const focusables = Array.from(dialog.querySelectorAll(focusableSelector));
    if (focusables.length === 0) return;

    const firstItem = focusables[0];
    const lastItem = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      }
    } else {
      if (document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }
  };

  trigger.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  menuLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}

// ============================================================================
// 8. TEXT SPLITTING & GSAP SCROLL ANIMATIONS
// ============================================================================
function initAnimations(lenisInstance) {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    initStaticFallbacks();
    return;
  }

  // Line-by-line masked text split with guaranteed real spaces
  splitHeroHeadline();

  // Hero Headline Mask Reveal
  const heroWords = document.querySelectorAll("#hero-headline .word-inner");
  if (heroWords.length > 0) {
    gsap.fromTo(heroWords, 
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.95,
        stagger: 0.05,
        ease: "expo.out",
        delay: 0.1
      }
    );
  }

  // Section Fades & Rise
  const revealElements = document.querySelectorAll(".reveal-element");
  revealElements.forEach(el => {
    gsap.fromTo(el,
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // Project Cards Reveal (wrapper animation only; inner image scale is pure CSS)
  const workItems = document.querySelectorAll(".work-item");
  workItems.forEach(card => {
    gsap.fromTo(card,
      { y: 44, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.0,
        ease: "expo.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  // Refresh ScrollTrigger calculations after all resources & custom web fonts load
  const triggerRefresh = () => {
    ScrollTrigger.refresh();
  };

  window.addEventListener("load", triggerRefresh);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(triggerRefresh);
  }
}

// ============================================================================
// 9. ACCESSIBLE HERO HEADLINE SPLITTER (REAL SPACES GUARANTEE)
// ============================================================================
function splitHeroHeadline() {
  const headline = document.getElementById("hero-headline");
  if (!headline) return;

  const rawHTML = headline.innerHTML.trim();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = rawHTML;

  const fragment = document.createDocumentFragment();

  Array.from(tempDiv.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/\s+/).filter(w => w.length > 0);
      words.forEach((word) => {
        const maskSpan = document.createElement("span");
        maskSpan.className = "word-mask";

        const innerSpan = document.createElement("span");
        innerSpan.className = "word-inner";
        innerSpan.textContent = word;

        maskSpan.appendChild(innerSpan);
        fragment.appendChild(maskSpan);

        // Append a real space between spans so screen readers and line breaks remain natural
        fragment.appendChild(document.createTextNode(" "));
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Element node such as <em> or <span>
      const maskSpan = document.createElement("span");
      maskSpan.className = "word-mask";

      const innerSpan = document.createElement("span");
      innerSpan.className = "word-inner";

      const clonedEl = node.cloneNode(true);
      innerSpan.appendChild(clonedEl);

      maskSpan.appendChild(innerSpan);
      fragment.appendChild(maskSpan);
      fragment.appendChild(document.createTextNode(" "));
    }
  });

  headline.innerHTML = "";
  headline.appendChild(fragment);
}

// Fallback for reduced motion or missing libraries
function initStaticFallbacks() {
  const elements = document.querySelectorAll(".reveal-element, .work-item, .word-inner");
  elements.forEach(el => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}
