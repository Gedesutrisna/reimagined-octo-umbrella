// SWIPER INITIALIZATION (with safety check)
if (typeof Swiper !== 'undefined') {
  const swiperConfigs = [
    { selector: ".testimonials-wrapper", slides1028: 3 },
    { selector: ".pricing-container", slides1028: 4 },
  ];

  swiperConfigs.forEach(({ selector, slides1028 }) => {
    const swiperElement = document.querySelector(selector);
    if (swiperElement) {
      new Swiper(selector, {
        speed: 1000,
        pagination: {
          el: `${selector} .swiper-pagination`,
          clickable: true,
        },
        navigation: {
          nextEl: `${selector} .swiper-button-next`,
          prevEl: `${selector} .swiper-button-prev`,
        },
        effect: "slide",
        breakpoints: {
          220: { slidesPerView: 1.1, spaceBetween: 16 },
          768: { slidesPerView: 2, spaceBetween: 16 },
          1028: {
            slidesPerView: slides1028,
            allowTouchMove: false,
            spaceBetween: 24,
          },
        },
      });
    }
  });
}

// Helper function to check if mobile swiper
function isMobileSwiper() {
  return window.innerWidth < 1028;
}

// SMART WORKFLOW ARROWS
class WorkflowArrows {
  constructor() {
    this.container = document.querySelector(".automation-visual");

    this.paths = {
      triggerDelay: document.getElementById("arrow-trigger-delay"),
      triggerAction: document.getElementById("arrow-trigger-action"),
    };

    if (
      !this.container ||
      !this.paths.triggerDelay ||
      !this.paths.triggerAction
    ) {
      return;
    }

    this.init();
  }

  init() {
    this.update();

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.update(), 100);
    });

    setTimeout(() => this.update(), 300);
  }

  // Utils

  rect(el) {
    const c = this.container.getBoundingClientRect();
    const r = el.getBoundingClientRect();

    return {
      top: r.top - c.top,
      bottom: r.bottom - c.top,
      left: r.left - c.left,
      right: r.right - c.left,
      w: r.width,
      h: r.height,
      cx: r.left - c.left + r.width / 2,
      cy: r.top - c.top + r.height / 2,
    };
  }

  getAnchors(node) {
    return {
      top: { x: node.cx, y: node.top, dir: "top" },
      bottom: { x: node.cx, y: node.bottom, dir: "bottom" },
      left: { x: node.left, y: node.cy, dir: "left" },
      right: { x: node.right, y: node.cy, dir: "right" },
    };
  }

  distance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  intersectsNode(x1, y1, x2, y2, node, margin = 10) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    return !(
      maxX < node.left - margin ||
      minX > node.right + margin ||
      maxY < node.top - margin ||
      minY > node.bottom + margin
    );
  }

  // Auto routing (Trigger → Delay)

  findBestAnchors(startNode, endNode, obstacles = []) {
    const starts = this.getAnchors(startNode);
    const ends = this.getAnchors(endNode);

    let best = null;
    let bestScore = Infinity;

    for (let sKey in starts) {
      for (let eKey in ends) {
        const s = starts[sKey];
        const e = ends[eKey];

        let score = this.distance(s, e);

        for (let obs of obstacles) {
          if (this.intersectsNode(s.x, s.y, e.x, e.y, obs)) {
            score += 500;
          }
        }

        if (score < bestScore) {
          bestScore = score;
          best = { start: s, end: e };
        }
      }
    }

    return best;
  }

  createOrthogonalPath(start, end, r = 12) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (Math.abs(dx) < 30 || Math.abs(dy) < 30) {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    const cornerX = end.x;
    const cornerY = start.y;

    return `
      M ${start.x} ${start.y}
      L ${cornerX - (dx > 0 ? r : -r)} ${cornerY}
      Q ${cornerX} ${cornerY} ${cornerX} ${cornerY + (dy > 0 ? r : -r)}
      L ${end.x} ${end.y}
    `
      .trim()
      .replace(/\s+/g, " ");
  }

  // FORCED PATH (Trigger → Action)
  // right → down/up → right

  createRightDownRightPath(start, end, offset = 80, r = 12) {
    const midX = Math.max(start.x, end.x) + offset;

    return `
      M ${start.x} ${start.y}
      L ${midX - r} ${start.y}
      Q ${midX} ${start.y} ${midX} ${start.y + r}
      L ${midX} ${end.y - r}
      Q ${midX} ${end.y} ${midX - r} ${end.y}
      L ${end.x} ${end.y}
    `
      .trim()
      .replace(/\s+/g, " ");
  }

  // Update

  update() {
    const triggerEl = this.container.querySelector(".trigger-node");
    const delayEl = this.container.querySelector(".delay-node");
    const actionEl = this.container.querySelector(".action-node");

    if (!triggerEl || !delayEl || !actionEl) return;

    const trigger = this.rect(triggerEl);
    const delay = this.rect(delayEl);
    const action = this.rect(actionEl);

    // Trigger → Delay (auto)
    const td = this.findBestAnchors(trigger, delay, [action]);
    if (td) {
      const path1 = this.createOrthogonalPath(td.start, td.end);
      this.paths.triggerDelay.setAttribute("d", path1);
    }

    // Trigger → Action (forced S-shape)
    const start = {
      x: trigger.right,
      y: trigger.cy,
    };

    const end = {
      x: action.left,
      y: action.cy,
    };

    const path2 = this.createRightDownRightPath(start, end, 90);
    this.paths.triggerAction.setAttribute("d", path2);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new WorkflowArrows();
});

// Navbar scroll effect
const navbar = document.getElementById("navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// MOBILE MENU TOGGLE

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    document.body.style.overflow = navMenu.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close menu when clicking on a link
  document.querySelectorAll(".nav-menu a, .nav-menu .btn").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      navMenu.classList.contains("active") &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

// SMOOTH SCROLL

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  });
});

// FAQ ACCORDION

document.querySelectorAll(".faq-item").forEach((item) => {
  const question = item.querySelector(".faq-question");
  if (question) {
    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all items
      document.querySelectorAll(".faq-item").forEach((i) => {
        i.classList.remove("active");
      });

      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add("active");
      }
    });
  }
});

// PRICING TOGGLE (Monthly/Annually)

const pricingToggle = document.getElementById("pricingToggle");
const priceAmounts = document.querySelectorAll(".price-amount");
const monthlyLabel = document.getElementById("monthlyLabel");
const annuallyLabel = document.getElementById("annuallyLabel");

if (pricingToggle && monthlyLabel && annuallyLabel) {
  function updatePricing() {
    const isAnnual = pricingToggle.checked;

    priceAmounts.forEach((amount) => {
      const monthly = amount.dataset.monthly;
      const annual = amount.dataset.annual;

      if (monthly && annual) {
        amount.textContent = isAnnual ? `$${annual}` : `$${monthly}`;
      }
    });

    // Toggle active state on labels
    monthlyLabel.classList.toggle("active", !isAnnual);
    annuallyLabel.classList.toggle("active", isAnnual);
  }

  updatePricing();

  // Tetap jalan saat toggle di klik
  pricingToggle.addEventListener("change", updatePricing);
}

// CHATBOT FUNCTIONALITY

const chatbotButton = document.getElementById("chatbotButton");
const chatbotWidget = document.getElementById("chatbotWidget");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotSend = document.getElementById("chatbotSend");
const chatbotBody = document.getElementById("chatbotBody");

if (chatbotButton && chatbotWidget) {
  // Toggle chatbot
  chatbotButton.addEventListener("click", () => {
    chatbotWidget.classList.toggle("active");
    chatbotButton.classList.toggle("active");
    if (chatbotWidget.classList.contains("active") && chatbotInput) {
      chatbotInput.focus();
    }
  });

  // Close chatbot
  if (chatbotClose) {
    chatbotClose.addEventListener("click", () => {
      chatbotWidget.classList.remove("active");
      chatbotButton.classList.remove("active");
    });
  }

  // Send message function
  function sendMessage() {
    if (!chatbotInput || !chatbotBody) return;
    
    const message = chatbotInput.value.trim();
    if (message) {
      // Create user message
      const userMessage = document.createElement("div");
      userMessage.className = "chatbot-message user-message";
      userMessage.innerHTML = `
        <div class="message-content">
          <p>${message}</p>
          <span class="message-time">Just now</span>
        </div>
        <div class="message-avatar">You</div>
      `;

      const suggestions = chatbotBody.querySelector(".chatbot-suggestions");
      chatbotBody.insertBefore(userMessage, suggestions);
      chatbotInput.value = "";

      // Scroll to bottom
      chatbotBody.scrollTop = chatbotBody.scrollHeight;

      // Simulate bot response
      setTimeout(() => {
        const botMessage = document.createElement("div");
        botMessage.className = "chatbot-message bot-message";
        botMessage.innerHTML = `
          <div class="message-avatar">AI</div>
          <div class="message-content">
            <p>Thank you for your message! Our team will get back to you shortly. In the meantime, feel free to explore our features or check out our pricing plans.</p>
            <span class="message-time">Just now</span>
          </div>
        `;
        chatbotBody.insertBefore(botMessage, suggestions);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
      }, 1000);
    }
  }

  // Send message on button click
  if (chatbotSend) {
    chatbotSend.addEventListener("click", sendMessage);
  }

  // Send message on Enter key
  if (chatbotInput) {
    chatbotInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }

  // Suggestion buttons
  document.querySelectorAll(".suggestion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (chatbotInput) {
        chatbotInput.value = btn.textContent;
        sendMessage();
      }
    });
  });
}

// ANIMATED COUNTER FOR STATS

function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent =
        target + (target === 98 ? "%" : target === 10 ? "x" : "+");
      clearInterval(timer);
    } else {
      element.textContent =
        Math.floor(current) + (target === 98 ? "%" : target === 10 ? "x" : "+");
    }
  }, 16);
}

// INTERSECTION OBSERVER

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -80px 0px",
};

// Scroll animations observer
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }, delay);
    }
  });
}, observerOptions);

// Observe elements for scroll animation
const skipOnMobile = ["testimonial-card", "pricing-card"];

document
  .querySelectorAll(
    ".feature-card, .step, .pricing-card, .faq-item, .testimonial-card"
  )
  .forEach((el) => {
    // ❗ Skip animasi card tertentu saat mobile
    if (
      isMobileSwiper() &&
      skipOnMobile.some((cls) => el.classList.contains(cls))
    ) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    scrollObserver.observe(el);
  });

// Stats counter observer
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const statNumber = entry.target.querySelector(".stat-number");
      const target = parseInt(statNumber?.dataset.target);

      if (target && statNumber && !statNumber.classList.contains("animated")) {
        statNumber.classList.add("animated");
        animateCounter(statNumber, target);
      }

      // Add animation to stat item
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }, delay);
    }
  });
}, observerOptions);

// Observe stat items
document.querySelectorAll(".stat-item").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(30px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  statsObserver.observe(el);
});

// WORKFLOW NODE ANIMATIONS

// Add pulsing animation to running node status
const runningStatus = document.querySelector(".running-status");
if (runningStatus) {
  setInterval(() => {
    runningStatus.style.transform = "scale(1.05)";
    setTimeout(() => {
      runningStatus.style.transform = "scale(1)";
    }, 500);
  }, 1500);
}

// PERFORMANCE OPTIMIZATIONS

// Debounce function for scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for resize events
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Optimized scroll handler
const optimizedScroll = debounce(() => {
  // Additional scroll-based animations can go here
}, 100);

window.addEventListener("scroll", optimizedScroll);

// LAZY LOAD IMAGES (if needed)

if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const heroContent = document.querySelector(".hero-content");
    if (heroContent) {
      heroContent.classList.add("loaded");
    }
  }, 100);
});

// Mobile Dropdown Accordion
document.querySelectorAll(".nav-dropdown > .nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    if (window.innerWidth <= 968) {
      e.preventDefault();
      const dropdown = link.closest(".nav-dropdown");

      // Close other dropdowns
      document.querySelectorAll(".nav-dropdown").forEach((d) => {
        if (d !== dropdown) d.classList.remove("active");
      });

      // Toggle current dropdown
      dropdown.classList.toggle("active");
    }
  });
});

// Platform Tour Tabs
document.querySelectorAll(".tour-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.dataset.tab;

    // Remove active from all tabs & panels
    document.querySelectorAll(".tour-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tour-content-panel").forEach((p) =>
      p.classList.remove("active")
    );

    // Add active to clicked tab & corresponding panel
    tab.classList.add("active");
    const panel = document.querySelector(`[data-panel="${tabName}"]`);
    if (panel) {
      panel.classList.add("active");
    }
  });
});