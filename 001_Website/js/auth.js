// AUTH PAGES FUNCTIONALITY

document.addEventListener('DOMContentLoaded', () => {
  // Toggle Password Visibility
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const eyeIcon = button.querySelector('.eye-icon');
      const eyeOffIcon = button.querySelector('.eye-off-icon');
      
      if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
      } else {
        input.type = 'password';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
      }
    });
  });

  // Password Strength Indicator
  const passwordInput = document.getElementById('password');
  const strengthBars = document.querySelector('.strength-bars');
  const strengthText = document.querySelector('.strength-text');

  if (passwordInput && strengthBars) {
    passwordInput.addEventListener('input', (e) => {
      const password = e.target.value;
      const strength = calculatePasswordStrength(password);
      
      // Remove all strength classes
      strengthBars.classList.remove('weak', 'fair', 'good', 'strong');
      
      // Add appropriate class
      if (password.length === 0) {
        strengthText.textContent = 'Password strength';
      } else if (strength < 2) {
        strengthBars.classList.add('weak');
        strengthText.textContent = 'Weak';
      } else if (strength < 3) {
        strengthBars.classList.add('fair');
        strengthText.textContent = 'Fair';
      } else if (strength < 4) {
        strengthBars.classList.add('good');
        strengthText.textContent = 'Good';
      } else {
        strengthBars.classList.add('strong');
        strengthText.textContent = 'Strong';
      }
    });
  }

  function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return strength;
  }

  // Login Form Validation
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      let isValid = true;
      
      // Validate email
      if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
      } else {
        clearError('email');
      }
      
      // Validate password
      if (password.length < 6) {
        showError('password', 'Password must be at least 6 characters');
        isValid = false;
      } else {
        clearError('password');
      }
      
      if (isValid) {
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="60" stroke-linecap="round"/>
          </svg>
          Signing in...
        `;
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
          console.log('Login successful');
          // Redirect to dashboard
          window.location.href = 'index.html';
        }, 1500);
      }
    });
  }

  // Register Form - Multi-step
  const registerForm = document.getElementById('registerForm');
  let currentStep = 1;
  
  if (registerForm) {
    // Step navigation
    const nextStep1 = document.getElementById('nextStep1');
    const nextStep2 = document.getElementById('nextStep2');
    const prevStep2 = document.getElementById('prevStep2');
    const prevStep3 = document.getElementById('prevStep3');
    
    if (nextStep1) {
      nextStep1.addEventListener('click', () => {
        if (validateStep1()) {
          goToStep(2);
        }
      });
    }
    
    if (nextStep2) {
      nextStep2.addEventListener('click', () => {
        if (validateStep2()) {
          goToStep(3);
        }
      });
    }
    
    if (prevStep2) {
      prevStep2.addEventListener('click', () => {
        goToStep(1);
      });
    }
    
    if (prevStep3) {
      prevStep3.addEventListener('click', () => {
        goToStep(2);
      });
    }
    
    // Form submission
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (validateStep3()) {
        // Show loading state
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="60" stroke-linecap="round"/>
          </svg>
          Creating account...
        `;
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
          console.log('Registration successful');
          // Redirect to welcome page or dashboard
          window.location.href = 'index.html';
        }, 2000);
      }
    });
  }

  function goToStep(stepNumber) {
    // Hide current step
    const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (currentStepEl) {
      currentStepEl.classList.remove('active');
    }
    
    // Show new step
    const newStepEl = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (newStepEl) {
      newStepEl.classList.add('active');
    }
    
    // Update progress
    document.querySelectorAll('.step').forEach(step => {
      const stepNum = parseInt(step.dataset.step);
      step.classList.remove('active', 'completed');
      
      if (stepNum === stepNumber) {
        step.classList.add('active');
      } else if (stepNum < stepNumber) {
        step.classList.add('completed');
      }
    });
    
    // Update titles
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    const socialLogin = document.getElementById('socialLogin');
    const divider = document.getElementById('divider');
    
    if (stepNumber === 1) {
      if (formTitle) formTitle.textContent = 'Create your account';
      if (formSubtitle) formSubtitle.innerHTML = 'Already have an account? <a href="login.html" class="link">Sign in</a>';
      if (socialLogin) socialLogin.style.display = 'flex';
      if (divider) divider.style.display = 'flex';
    } else if (stepNumber === 2) {
      if (formTitle) formTitle.textContent = 'Tell us about yourself';
      if (formSubtitle) formSubtitle.textContent = 'We\'ll personalize your experience';
      if (socialLogin) socialLogin.style.display = 'none';
      if (divider) divider.style.display = 'none';
    } else if (stepNumber === 3) {
      if (formTitle) formTitle.textContent = 'Almost there!';
      if (formSubtitle) formSubtitle.textContent = 'Just a few more details';
      if (socialLogin) socialLogin.style.display = 'none';
      if (divider) divider.style.display = 'none';
    }
    
    currentStep = stepNumber;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep1() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    let isValid = true;
    
    // Validate email
    if (!validateEmail(email)) {
      showError('email', 'Please enter a valid work email address');
      isValid = false;
    } else {
      clearError('email');
    }
    
    // Validate password
    const strength = calculatePasswordStrength(password);
    if (password.length < 8) {
      showError('password', 'Password must be at least 8 characters');
      isValid = false;
    } else if (strength < 2) {
      showError('password', 'Password is too weak. Add numbers and special characters');
      isValid = false;
    } else {
      clearError('password');
    }
    
    return isValid;
  }

  function validateStep2() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const company = document.getElementById('company').value.trim();
    const role = document.getElementById('role').value;
    
    let isValid = true;
    
    if (firstName.length < 2) {
      showError('firstName', 'Please enter your first name');
      isValid = false;
    } else {
      clearError('firstName');
    }
    
    if (lastName.length < 2) {
      showError('lastName', 'Please enter your last name');
      isValid = false;
    } else {
      clearError('lastName');
    }
    
    if (company.length < 2) {
      showError('company', 'Please enter your company name');
      isValid = false;
    } else {
      clearError('company');
    }
    
    if (!role) {
      showError('role', 'Please select your role');
      isValid = false;
    } else {
      clearError('role');
    }
    
    return isValid;
  }

  function validateStep3() {
    const terms = document.getElementById('terms').checked;
    
    if (!terms) {
      showError('terms', 'You must agree to the terms and conditions');
      return false;
    } else {
      clearError('terms');
      return true;
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}Error`);
    const formGroup = field?.closest('.form-group');
    
    if (formGroup) {
      formGroup.classList.add('error');
    }
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }

  function clearError(fieldName) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}Error`);
    const formGroup = field?.closest('.form-group');
    
    if (formGroup) {
      formGroup.classList.remove('error');
    }
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
  }

  // Social login buttons
  const socialButtons = document.querySelectorAll('.social-btn');
  
  socialButtons.forEach(button => {
    button.addEventListener('click', () => {
      const provider = button.classList.contains('google-btn') ? 'Google' : 'Microsoft';
      console.log(`Authenticating with ${provider}...`);
      
      // Show loading state
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="60" stroke-linecap="round"/>
        </svg>
        Connecting...
      `;
      button.disabled = true;
      
      // Simulate OAuth flow
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
        // In real implementation, redirect to OAuth provider
      }, 1500);
    });
  });
});

// Add spin animation for loading states
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
document.head.appendChild(style);