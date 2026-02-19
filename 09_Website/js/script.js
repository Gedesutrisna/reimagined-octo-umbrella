// UTILITIES & HELPERS

const Utils = {
  // Email validation
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
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
  },

  // Check if mobile viewport
  isMobile() {
    return window.innerWidth < 1028;
  },
};

// 2. NAVBAR FUNCTIONALITY

const Navbar = {
  init() {
    this.setupScrollEffect();
    this.setupMobileMenu();
    this.setupDropdowns();
  },

  // Navbar scroll effect
  setupScrollEffect() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  },

  // Mobile hamburger menu
  setupMobileMenu() {
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");

    if (!hamburger || !navMenu) return;

    // Toggle menu
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
      document.body.style.overflow = navMenu.classList.contains("active")
        ? "hidden"
        : "";
    });

    // Close menu when clicking links
    document.querySelectorAll(".nav-menu a, .nav-menu .btn").forEach((link) => {
      link.addEventListener("click", (e) => {
        if (window.innerWidth <= 968) {
          if (
            link.closest(".nav-dropdown") &&
            link.classList.contains("nav-link")
          ) {
            return;
          }
          hamburger.classList.remove("active");
          navMenu.classList.remove("active");
          document.body.style.overflow = "";
        }
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
  },

  // Dropdown menus
  setupDropdowns() {
    // Desktop hover (automatic)

    // Mobile accordion
    document.querySelectorAll(".nav-dropdown > .nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        if (window.innerWidth <= 968) {
          e.preventDefault();
          e.stopPropagation();

          const dropdown = link.closest(".nav-dropdown");
          const isActive = dropdown.classList.contains("active");

          document.querySelectorAll(".nav-dropdown").forEach((d) => {
            d.classList.remove("active");
          });

          if (!isActive) {
            dropdown.classList.add("active");
          }
        }
      });
    });

    // Close dropdown when clicking item (mobile)
    document.querySelectorAll(".dropdown-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();

        if (window.innerWidth <= 968) {
          const dropdown = item.closest(".nav-dropdown");
          if (dropdown) dropdown.classList.remove("active");

          const hamburger = document.getElementById("hamburger");
          const navMenu = document.getElementById("navMenu");
          if (hamburger && navMenu) {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
            document.body.style.overflow = "";
          }
        }
      });
    });
  },
};

// AUTHENTICATION SYSTEM

const Auth = {
  init() {
    this.checkAuthStatus();
    this.setupLoginForm();
    this.setupRegisterForm();
    this.setupSocialButtons();
  },

  // Check if user is logged in and update navbar
  checkAuthStatus() {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      this.updateNavbarForLoggedInUser(user);
    }
  },

  // Update navbar with user dropdown
  updateNavbarForLoggedInUser(user) {
    const navCtaGroup = document.querySelector(".nav-cta-group");
    if (!navCtaGroup) return;

    navCtaGroup.innerHTML = `
      <div class="nav-user-dropdown">
        <button class="nav-user-btn" id="navUserBtn">
          <div class="nav-user-avatar">${
            user.name ? user.name[0].toUpperCase() : "U"
          }</div>
          <span class="nav-user-name">${user.name || "User"}</span>
          <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="nav-user-menu" id="navUserMenu">
          <div class="nav-user-info">
            <strong>${user.name || "User"}</strong>
            <span>${user.email}</span>
          </div>
          <div class="nav-user-divider"></div>
          <a href="dashboard.html" class="nav-user-menu-item">
          <div class="dropdown-icon">
          
          <img
                    src="09_Bahan/assets/icon-4.webp"
                    class="assets-icon"
                    alt=""
                  />
          </div>                    
            Dashboard
          </a>
          <div class="nav-user-divider"></div>
          <a href="#" class="nav-user-menu-item" id="logoutBtn">
          <div class="dropdown-icon">
          
          <img
                    src="../09_Bahan/assets/icon-7.webp"
                    class="assets-icon"
                    alt=""
                  />
          </div>                    
            Logout
          </a>
        </div>
      </div>
    `;

    // Setup dropdown toggle
    const navUserBtn = document.getElementById("navUserBtn");
    const navUserMenu = document.getElementById("navUserMenu");
    const logoutBtn = document.getElementById("logoutBtn");

    if (navUserBtn && navUserMenu) {
      navUserBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navUserMenu.classList.toggle("active");
      });

      document.addEventListener("click", (e) => {
        if (!navUserBtn.contains(e.target) && !navUserMenu.contains(e.target)) {
          navUserMenu.classList.remove("active");
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  },

  // Login form handler
  setupLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!email || !password) {
        this.showToast("error", "Please fill in all fields");
        return;
      }

      if (!Utils.validateEmail(email)) {
        this.showToast("error", "Please enter a valid email");
        return;
      }

      this.showToast("success", "Login successful! Redirecting...");

      const userData = {
        email: email,
        name: email.split("@")[0],
        loggedIn: true,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("userData", JSON.stringify(userData));

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    });
  },

  // Register form handler
  setupRegisterForm() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fullname = document.getElementById("fullname").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!fullname || !email || !password) {
        this.showToast("error", "Please fill in all fields");
        return;
      }

      if (!Utils.validateEmail(email)) {
        this.showToast("error", "Please enter a valid email");
        return;
      }

      if (password.length < 8) {
        this.showToast("error", "Password must be at least 8 characters");
        return;
      }

      this.showToast("success", "Account created! Redirecting to login...");

      const newUser = {
        fullname: fullname,
        email: email,
        registered: true,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("newUser", JSON.stringify(newUser));

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    });
  },

  // Social login buttons
  setupSocialButtons() {
    const googleLogin = document.getElementById("googleLogin");
    const googleRegister = document.getElementById("googleRegister");

    if (googleLogin) {
      googleLogin.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showToast(
          "error",
          "Google authentication is not available in this demo"
        );
      });
    }

    if (googleRegister) {
      googleRegister.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showToast(
          "error",
          "Google authentication is not available in this demo"
        );
      });
    }
  },

  // Logout handler
  handleLogout() {
    localStorage.removeItem("userData");
    this.showToast("success", "Logged out successfully");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  },

  // Toast notification
  showToast(type, message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    const toastMessage = toast.querySelector(".toast-message");
    const toastIcon = toast.querySelector(".toast-icon");

    toast.classList.remove("success", "error", "show");
    toastMessage.textContent = message;

    if (type === "success") {
      toast.classList.add("success");
      toastIcon.textContent = "✓";
    } else {
      toast.classList.add("error");
      toastIcon.textContent = "✕";
    }

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => toast.classList.remove("show"), 4000);
  },
};

// SMOOTH SCROLL

const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        if (href === "#" || href === "#!") return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      });
    });
  },
};

// FAQ ACCORDION

const FAQ = {
  init() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const question = item.querySelector(".faq-question");
      if (!question) return;

      question.addEventListener("click", () => {
        const isActive = item.classList.contains("active");

        document.querySelectorAll(".faq-item").forEach((i) => {
          i.classList.remove("active");
        });

        if (!isActive) {
          item.classList.add("active");
        }
      });
    });
  },
};

// PRICING TOGGLE

const PricingToggle = {
  init() {
    const pricingToggle = document.getElementById("pricingToggle");
    const priceAmounts = document.querySelectorAll(".price-amount");
    const monthlyLabel = document.getElementById("monthlyLabel");
    const annuallyLabel = document.getElementById("annuallyLabel");

    if (!pricingToggle || !monthlyLabel || !annuallyLabel) return;

    const updatePricing = () => {
      const isAnnual = pricingToggle.checked;

      priceAmounts.forEach((amount) => {
        const monthly = amount.dataset.monthly;
        const annual = amount.dataset.annual;

        if (monthly && annual) {
          amount.textContent = isAnnual ? `$${annual}` : `$${monthly}`;
        }
      });

      monthlyLabel.classList.toggle("active", !isAnnual);
      annuallyLabel.classList.toggle("active", isAnnual);
    };

    updatePricing();
    pricingToggle.addEventListener("change", updatePricing);
  },
};

// CHATBOT WIDGET

const Chatbot = {
  init() {
    const chatbotButton = document.getElementById("chatbotButton");
    const chatbotWidget = document.getElementById("chatbotWidget");
    const chatbotClose = document.getElementById("chatbotClose");
    const chatbotInput = document.getElementById("chatbotInput");
    const chatbotSend = document.getElementById("chatbotSend");
    const chatbotBody = document.getElementById("chatbotBody");

    if (!chatbotButton || !chatbotWidget) return;

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
    const sendMessage = () => {
      if (!chatbotInput || !chatbotBody) return;

      const message = chatbotInput.value.trim();
      if (!message) return;

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
      chatbotBody.scrollTop = chatbotBody.scrollHeight;

      // Bot response
      setTimeout(() => {
        const botMessage = document.createElement("div");
        botMessage.className = "chatbot-message bot-message";
        botMessage.innerHTML = `
          <div class="message-avatar">AI</div>
          <div class="message-content">
            <p>Thank you for your message! Our team will get back to you shortly.</p>
            <span class="message-time">Just now</span>
          </div>
        `;
        chatbotBody.insertBefore(botMessage, suggestions);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
      }, 1000);
    };

    if (chatbotSend) {
      chatbotSend.addEventListener("click", sendMessage);
    }

    if (chatbotInput) {
      chatbotInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
      });
    }

    document.querySelectorAll(".suggestion-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (chatbotInput) {
          chatbotInput.value = btn.textContent;
          sendMessage();
        }
      });
    });
  },
};

// ANIMATIONS & OBSERVERS

const Animations = {
  init() {
    this.setupScrollObserver();
    this.setupStatsObserver();
    this.setupWorkflowAnimations();
    this.setupHeroAnimation();
  },

  setupScrollObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -80px 0px",
    };

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

    const skipOnMobile = ["testimonial-card", "pricing-card"];

    document
      .querySelectorAll(
        ".feature-card, .step, .pricing-card, .faq-item, .testimonial-card"
      )
      .forEach((el) => {
        if (
          Utils.isMobile() &&
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
  },

  setupStatsObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -80px 0px",
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const statNumber = entry.target.querySelector(".stat-number");
          const target = parseInt(statNumber?.dataset.target);

          if (
            target &&
            statNumber &&
            !statNumber.classList.contains("animated")
          ) {
            statNumber.classList.add("animated");
            this.animateCounter(statNumber, target);
          }

          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }, delay);
        }
      });
    }, observerOptions);

    document.querySelectorAll(".stat-item").forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      statsObserver.observe(el);
    });
  },

  animateCounter(element, target, duration = 2000) {
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
          Math.floor(current) +
          (target === 98 ? "%" : target === 10 ? "x" : "+");
      }
    }, 16);
  },

  setupWorkflowAnimations() {
    const runningStatus = document.querySelector(".running-status");
    if (runningStatus) {
      setInterval(() => {
        runningStatus.style.transform = "scale(1.05)";
        setTimeout(() => {
          runningStatus.style.transform = "scale(1)";
        }, 500);
      }, 1500);
    }
  },

  setupHeroAnimation() {
    setTimeout(() => {
      const heroContent = document.querySelector(".hero-content");
      if (heroContent) {
        heroContent.classList.add("loaded");
      }
    }, 100);
  },
};

// SWIPER INITIALIZATION

const SwiperInit = {
  init() {
    if (typeof Swiper === "undefined") return;

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
  },
};

// WORKFLOW ARROWS (Homepage)

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

  update() {
    const triggerEl = this.container.querySelector(".trigger-node");
    const delayEl = this.container.querySelector(".delay-node");
    const actionEl = this.container.querySelector(".action-node");

    if (!triggerEl || !delayEl || !actionEl) return;

    const trigger = this.rect(triggerEl);
    const delay = this.rect(delayEl);
    const action = this.rect(actionEl);

    const td = this.findBestAnchors(trigger, delay, [action]);
    if (td) {
      const path1 = this.createOrthogonalPath(td.start, td.end);
      this.paths.triggerDelay.setAttribute("d", path1);
    }

    const start = { x: trigger.right, y: trigger.cy };
    const end = { x: action.left, y: action.cy };

    const path2 = this.createRightDownRightPath(start, end, 90);
    this.paths.triggerAction.setAttribute("d", path2);
  }
}

// MAIN INITIALIZATION

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all modules
  Navbar.init();
  Auth.init();
  SmoothScroll.init();
  FAQ.init();
  PricingToggle.init();
  Chatbot.init();
  Animations.init();
  SwiperInit.init();

  // Initialize workflow arrows
  new WorkflowArrows();
});
