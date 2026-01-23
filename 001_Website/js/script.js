// SAMARTHA - ENHANCED JAVASCRIPT
const swiperConfigs = [
  { selector: '.testimonials-wrapper', slides1028: 3 },
  { selector: '.pricing-container', slides1028: 4 },
];

swiperConfigs.forEach(({ selector, slides1028 }) => {
  new Swiper(selector, {
      // loop: true,
      // autoplay: { delay: 3500, disableOnInteraction: false },
      speed: 1000,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      effect: 'slide',
      breakpoints: {
          220: { slidesPerView: 1.1, spaceBetween: 16 },
          768: { slidesPerView: 2, spaceBetween: 16 },
          1028: { slidesPerView: slides1028, allowTouchMove: false, spaceBetween: 24 }
      }
  });
});

// SMART WORKFLOW ARROWS - Intelligent Orthogonal Routing 🎯

class WorkflowArrows {
  constructor() {
    this.container = document.querySelector(".automation-visual");
    
    this.paths = {
      triggerDelay: document.getElementById("arrow-trigger-delay"),
      triggerAction: document.getElementById("arrow-trigger-action"),
    };

    if (!this.container || !this.paths.triggerDelay || !this.paths.triggerAction) {
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

  // Get element rect relative to container
  rect(el) {
    const c = this.container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    
    return {
      x: r.left - c.left,
      y: r.top - c.top,
      w: r.width,
      h: r.height,
      top: r.top - c.top,
      bottom: r.bottom - c.top,
      left: r.left - c.left,
      right: r.right - c.left,
      cx: r.left - c.left + r.width / 2,
      cy: r.top - c.top + r.height / 2,
    };
  }

  // Get all possible anchor points
  getAnchors(node) {
    return {
      top: { x: node.cx, y: node.top, dir: 'top' },
      bottom: { x: node.cx, y: node.bottom, dir: 'bottom' },
      left: { x: node.left, y: node.cy, dir: 'left' },
      right: { x: node.right, y: node.cy, dir: 'right' },
    };
  }

  // Calculate distance between two points
  distance(p1, p2) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  }

  // Check if path intersects with a node (with margin)
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

  // Find best anchor pair that doesn't collide
  findBestAnchors(startNode, endNode, obstacles = []) {
    const startAnchors = this.getAnchors(startNode);
    const endAnchors = this.getAnchors(endNode);
    
    let bestPair = null;
    let bestScore = Infinity;

    // Try all combinations
    for (let startKey in startAnchors) {
      for (let endKey in endAnchors) {
        const start = startAnchors[startKey];
        const end = endAnchors[endKey];

        // Skip if anchors face each other directly (would cause overlap)
        if (
          (start.dir === 'right' && end.dir === 'left' && start.x > end.x) ||
          (start.dir === 'left' && end.dir === 'right' && start.x < end.x) ||
          (start.dir === 'bottom' && end.dir === 'top' && start.y > end.y) ||
          (start.dir === 'top' && end.dir === 'bottom' && start.y < end.y)
        ) {
          continue;
        }

        // Calculate score (prefer shorter paths)
        let score = this.distance(start, end);

        // Add penalty for collision with obstacles
        let hasCollision = false;
        for (let obs of obstacles) {
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          
          if (this.intersectsNode(start.x, start.y, midX, midY, obs)) {
            hasCollision = true;
            score += 500;
          }
          if (this.intersectsNode(midX, midY, end.x, end.y, obs)) {
            hasCollision = true;
            score += 500;
          }
        }

        // Prefer paths that exit and enter naturally
        if (start.dir === 'bottom' && end.dir === 'top') score -= 100;
        if (start.dir === 'right' && end.dir === 'left') score -= 100;

        if (score < bestScore) {
          bestScore = score;
          bestPair = { start, end, hasCollision };
        }
      }
    }

    return bestPair;
  }

  // Create orthogonal path with smart routing
  createOrthogonalPath(start, end, obstacles = []) {
    const r = 12; // Corner radius
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Simple case: vertical alignment
    if (Math.abs(dx) < 30) {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    // Simple case: horizontal alignment
    if (Math.abs(dy) < 30) {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    // Complex case: need L-shape or Z-shape routing
    // Determine routing strategy based on relative positions
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    // Check for obstacles and decide routing
    let useZShape = false;
    for (let obs of obstacles) {
      if (this.intersectsNode(start.x, start.y, midX, midY, obs, 20)) {
        useZShape = true;
        break;
      }
    }

    if (useZShape) {
      // Z-shaped path (3 segments)
      return this.createZPath(start, end, r);
    } else {
      // L-shaped path (2 segments)
      return this.createLPath(start, end, r);
    }
  }

  // Create L-shaped path
  createLPath(start, end, r) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Decide if we go horizontal first or vertical first
    const horizontalFirst = Math.abs(dx) > Math.abs(dy);

    if (horizontalFirst) {
      // Go horizontal then vertical
      const cornerX = end.x;
      const cornerY = start.y;
      
      if (dy > 0) {
        // Down
        return `
          M ${start.x} ${start.y}
          L ${cornerX - (dx > 0 ? r : -r)} ${cornerY}
          Q ${cornerX} ${cornerY} ${cornerX} ${cornerY + r}
          L ${end.x} ${end.y}
        `.trim().replace(/\s+/g, ' ');
      } else {
        // Up
        return `
          M ${start.x} ${start.y}
          L ${cornerX - (dx > 0 ? r : -r)} ${cornerY}
          Q ${cornerX} ${cornerY} ${cornerX} ${cornerY - r}
          L ${end.x} ${end.y}
        `.trim().replace(/\s+/g, ' ');
      }
    } else {
      // Go vertical then horizontal
      const cornerX = start.x;
      const cornerY = end.y;
      
      if (dx > 0) {
        // Right
        return `
          M ${start.x} ${start.y}
          L ${cornerX} ${cornerY - (dy > 0 ? r : -r)}
          Q ${cornerX} ${cornerY} ${cornerX + r} ${cornerY}
          L ${end.x} ${end.y}
        `.trim().replace(/\s+/g, ' ');
      } else {
        // Left
        return `
          M ${start.x} ${start.y}
          L ${cornerX} ${cornerY - (dy > 0 ? r : -r)}
          Q ${cornerX} ${cornerY} ${cornerX - r} ${cornerY}
          L ${end.x} ${end.y}
        `.trim().replace(/\s+/g, ' ');
      }
    }
  }

  // Create Z-shaped path (for obstacle avoidance)
  createZPath(start, end, r) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const midY = (start.y + end.y) / 2;

    // First segment: horizontal from start
    // Second segment: vertical 
    // Third segment: horizontal to end
    
    if (dx > 0) {
      // Going right
      return `
        M ${start.x} ${start.y}
        L ${start.x} ${midY - (dy > 0 ? r : -r)}
        Q ${start.x} ${midY} ${start.x + r} ${midY}
        L ${end.x - r} ${midY}
        Q ${end.x} ${midY} ${end.x} ${midY + (dy > 0 ? r : -r)}
        L ${end.x} ${end.y}
      `.trim().replace(/\s+/g, ' ');
    } else {
      // Going left
      return `
        M ${start.x} ${start.y}
        L ${start.x} ${midY - (dy > 0 ? r : -r)}
        Q ${start.x} ${midY} ${start.x - r} ${midY}
        L ${end.x + r} ${midY}
        Q ${end.x} ${midY} ${end.x} ${midY + (dy > 0 ? r : -r)}
        L ${end.x} ${end.y}
      `.trim().replace(/\s+/g, ' ');
    }
  }

  update() {
    const triggerEl = this.container.querySelector(".trigger-node");
    const delayEl = this.container.querySelector(".delay-node");
    const actionEl = this.container.querySelector(".action-node");

    if (!triggerEl || !delayEl || !actionEl) return;

    const trigger = this.rect(triggerEl);
    const delay = this.rect(delayEl);
    const action = this.rect(actionEl);

    // Connection 1: Trigger → Delay (avoid action node)
    const td = this.findBestAnchors(trigger, delay, [action]);
    if (td) {
      const path1 = this.createOrthogonalPath(td.start, td.end, [action]);
      this.paths.triggerDelay.setAttribute("d", path1);
    }

    // Connection 2: Trigger → Action (avoid delay node)
    const ta = this.findBestAnchors(trigger, action, [delay]);
    if (ta) {
      const path2 = this.createOrthogonalPath(ta.start, ta.end, [delay]);
      this.paths.triggerAction.setAttribute("d", path2);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new WorkflowArrows();
});

// Navbar scroll effect
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// MOBILE MENU TOGGLE

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

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
});

// PRICING TOGGLE (Monthly/Annually)

const pricingToggle = document.getElementById("pricingToggle");
const priceAmounts = document.querySelectorAll(".price-amount");
const monthlyLabel = document.getElementById("monthlyLabel");
const annuallyLabel = document.getElementById("annuallyLabel");

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

// 🔥 Jalankan saat page pertama kali load
updatePricing();

// Tetap jalan saat toggle di klik
pricingToggle.addEventListener("change", updatePricing);


// CHATBOT FUNCTIONALITY

const chatbotButton = document.getElementById("chatbotButton");
const chatbotWidget = document.getElementById("chatbotWidget");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotSend = document.getElementById("chatbotSend");
const chatbotBody = document.getElementById("chatbotBody");

// Toggle chatbot
chatbotButton.addEventListener("click", () => {
  chatbotWidget.classList.toggle("active");
  chatbotButton.classList.toggle("active");
  if (chatbotWidget.classList.contains("active")) {
    chatbotInput.focus();
  }
});

// Close chatbot
chatbotClose.addEventListener("click", () => {
  chatbotWidget.classList.remove("active");
  chatbotButton.classList.remove("active");
});

// Send message function
function sendMessage() {
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
chatbotSend.addEventListener("click", sendMessage);

// Send message on Enter key
chatbotInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Suggestion buttons
document.querySelectorAll(".suggestion-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    chatbotInput.value = btn.textContent;
    sendMessage();
  });
});

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
document
  .querySelectorAll(
    ".feature-card, .step, .pricing-card, .testimonial-card, .faq-item"
  )
  .forEach((el) => {
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
      const target = parseInt(statNumber.dataset.target);

      if (target && !statNumber.classList.contains("animated")) {
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

// CONSOLE MESSAGE

console.log(
  "%c🚀 Samartha - Business Automation Platform",
  "font-size: 16px; font-weight: bold; color: #4342ff;"
);
console.log(
  "%cBuilt with ❤️ by Samartha Team",
  "font-size: 12px; color: #666;"
);

// READY STATE

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Samartha website loaded successfully!");

  // Add any additional initialization here

  // Smooth entrance animation for hero
  setTimeout(() => {
    document.querySelector(".hero-content")?.classList.add("loaded");
  }, 100);
});
