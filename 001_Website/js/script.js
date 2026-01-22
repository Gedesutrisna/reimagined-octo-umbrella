// SAMARTHA - ENHANCED JAVASCRIPT

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

pricingToggle.addEventListener("change", () => {
  const isAnnual = pricingToggle.checked;

  priceAmounts.forEach((amount) => {
    const monthly = amount.dataset.monthly;
    const annual = amount.dataset.annual;

    if (monthly && annual) {
      amount.textContent = isAnnual ? `$${annual}` : `$${monthly}`;
    }
  });

  // Toggle active state on labels
  if (isAnnual) {
    monthlyLabel.classList.remove("active");
    annuallyLabel.classList.add("active");
  } else {
    monthlyLabel.classList.add("active");
    annuallyLabel.classList.remove("active");
  }
});

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
