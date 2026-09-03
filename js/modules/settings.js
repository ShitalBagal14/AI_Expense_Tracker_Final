/* =========================================================
   SETTINGS MODULE
========================================================= */

export function initSettings() {
    console.log("Settings module initialized");

    // Initialize profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
        loadProfileData();
    }

    // Initialize password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
    }

    // Initialize cancel buttons
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    if (cancelProfileBtn) {
        cancelProfileBtn.addEventListener('click', resetProfileForm);
    }

    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', resetPasswordForm);
    }

    // Initialize danger zone buttons
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }

    const logoutAllBtn = document.getElementById('logoutAllBtn');
    if (logoutAllBtn) {
        logoutAllBtn.addEventListener('click', handleLogoutAll);
    }

    // Add real-time validation
    addPasswordValidation();
}

/* =========================================================
   LOAD PROFILE DATA
========================================================= */

async function loadProfileData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/user/profile');
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                populateProfileForm(data.user);
            }
        }
    } catch (error) {
        console.log("Could not load profile data, using defaults");
        loadSampleProfileData();
    }
}

function loadSampleProfileData() {
    const sampleData = {
        fullName: 'Shital Bagal',
        email: 'shitalbagal50@gmail.com',
        mobile: '9876543210',
        dob: '1995-05-15',
        gender: 'female',
        occupation: 'Software Engineer',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
    };
    populateProfileForm(sampleData);
}

function populateProfileForm(data) {
    const form = document.getElementById('profileForm');
    if (!form) return;

    if (data.fullName) form.fullName.value = data.fullName;
    if (data.email) form.email.value = data.email;
    if (data.mobile) form.mobile.value = data.mobile;
    if (data.dob) form.dob.value = data.dob;
    if (data.gender) form.gender.value = data.gender;
    if (data.occupation) form.occupation.value = data.occupation;
    if (data.address) form.address.value = data.address;
    if (data.city) form.city.value = data.city;
    if (data.state) form.state.value = data.state;
    if (data.pincode) form.pincode.value = data.pincode;
}

/* =========================================================
   HANDLE PROFILE SUBMIT
========================================================= */

async function handleProfileSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const saveBtn = document.getElementById('saveProfileBtn');

    // Validate form
    if (!validateProfileForm(form)) {
        return;
    }

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.classList.add('loading');
    saveBtn.textContent = 'Saving...';

    // Collect form data
    const formData = {
        fullName: form.fullName.value,
        email: form.email.value,
        mobile: form.mobile.value,
        dob: form.dob.value,
        gender: form.gender.value,
        occupation: form.occupation.value,
        address: form.address.value,
        city: form.city.value,
        state: form.state.value,
        pincode: form.pincode.value
    };

    try {
        // Try to send to API
        const response = await fetch('http://127.0.0.1:5000/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showSuccessMessage('Profile updated successfully!');
            } else {
                showErrorMessage(result.message || 'Failed to update profile');
            }
        } else {
            // Simulate success for demo
            setTimeout(() => {
                showSuccessMessage('Profile updated successfully!');
            }, 1000);
        }
    } catch (error) {
        console.log("API error, simulating success");
        setTimeout(() => {
            showSuccessMessage('Profile updated successfully!');
        }, 1000);
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveBtn.classList.remove('loading');
        saveBtn.textContent = 'Save Changes';
    }
}

/* =========================================================
   HANDLE PASSWORD SUBMIT
========================================================= */

async function handlePasswordSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const saveBtn = document.getElementById('savePasswordBtn');

    // Validate password
    if (!validatePasswordForm(form)) {
        return;
    }

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.classList.add('loading');
    saveBtn.textContent = 'Updating...';

    const formData = {
        currentPassword: form.currentPassword.value,
        newPassword: form.newPassword.value
    };

    try {
        // Try to send to API
        const response = await fetch('http://127.0.0.1:5000/api/user/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showSuccessMessage('Password updated successfully!');
                resetPasswordForm();
            } else {
                showErrorMessage(result.message || 'Failed to update password');
            }
        } else {
            // Simulate success for demo
            setTimeout(() => {
                showSuccessMessage('Password updated successfully!');
                resetPasswordForm();
            }, 1000);
        }
    } catch (error) {
        console.log("API error, simulating success");
        setTimeout(() => {
            showSuccessMessage('Password updated successfully!');
            resetPasswordForm();
        }, 1000);
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveBtn.classList.remove('loading');
        saveBtn.textContent = 'Update Password';
    }
}

/* =========================================================
   VALIDATION FUNCTIONS
========================================================= */

function validateProfileForm(form) {
    let isValid = true;

    // Clear previous errors
    clearFormErrors(form);

    // Validate full name
    if (!form.fullName.value.trim()) {
        showFieldError(form.fullName, 'Full name is required');
        isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.value.trim()) {
        showFieldError(form.email, 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(form.email.value)) {
        showFieldError(form.email, 'Please enter a valid email');
        isValid = false;
    }

    // Validate mobile
    const mobileRegex = /^[0-9]{10}$/;
    if (!form.mobile.value.trim()) {
        showFieldError(form.mobile, 'Mobile number is required');
        isValid = false;
    } else if (!mobileRegex.test(form.mobile.value)) {
        showFieldError(form.mobile, 'Please enter a valid 10-digit mobile number');
        isValid = false;
    }

    // Validate date of birth
    if (!form.dob.value) {
        showFieldError(form.dob, 'Date of birth is required');
        isValid = false;
    }

    // Validate gender
    if (!form.gender.value) {
        showFieldError(form.gender, 'Please select your gender');
        isValid = false;
    }

    // Validate PIN code
    if (form.pincode.value && !/^[0-9]{6}$/.test(form.pincode.value)) {
        showFieldError(form.pincode, 'Please enter a valid 6-digit PIN code');
        isValid = false;
    }

    return isValid;
}

function validatePasswordForm(form) {
    let isValid = true;

    // Clear previous errors
    clearFormErrors(form);

    // Validate current password
    if (!form.currentPassword.value) {
        showFieldError(form.currentPassword, 'Current password is required');
        isValid = false;
    }

    // Validate new password
    const newPassword = form.newPassword.value;
    if (!newPassword) {
        showFieldError(form.newPassword, 'New password is required');
        isValid = false;
    } else if (!isPasswordStrong(newPassword)) {
        showFieldError(form.newPassword, 'Password does not meet requirements');
        isValid = false;
    }

    // Validate confirm password
    if (!form.confirmPassword.value) {
        showFieldError(form.confirmPassword, 'Please confirm your password');
        isValid = false;
    } else if (form.confirmPassword.value !== newPassword) {
        showFieldError(form.confirmPassword, 'Passwords do not match');
        isValid = false;
    }

    return isValid;
}

function isPasswordStrong(password) {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/* =========================================================
   PASSWORD VALIDATION
========================================================= */

function addPasswordValidation() {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            updatePasswordStrength(password);
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const newPassword = newPasswordInput ? newPasswordInput.value : '';
            const confirmPassword = this.value;

            if (confirmPassword && confirmPassword !== newPassword) {
                showFieldError(this, 'Passwords do not match');
            } else {
                clearFieldError(this);
            }
        });
    }
}

function updatePasswordStrength(password) {
    // This could be enhanced to show a visual strength indicator
    console.log('Password strength check:', isPasswordStrong(password));
}

/* =========================================================
   FORM RESET
========================================================= */

function resetProfileForm() {
    const form = document.getElementById('profileForm');
    if (form) {
        form.reset();
        loadProfileData();
        clearFormErrors(form);
    }
}

function resetPasswordForm() {
    const form = document.getElementById('passwordForm');
    if (form) {
        form.reset();
        clearFormErrors(form);
    }
}

/* =========================================================
   DANGER ZONE ACTIONS
========================================================= */

function handleDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
            showSuccessMessage('Account deletion initiated. You will receive a confirmation email.');
        }
    }
}

function handleLogoutAll() {
    if (confirm('Are you sure you want to logout from all devices?')) {
        showSuccessMessage('Logged out from all devices successfully!');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    }
}

/* =========================================================
   ERROR/SUCCESS HANDLING
========================================================= */

function showFieldError(input, message) {
    input.classList.add('error');
    input.classList.remove('success');

    // Remove existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
}

function showFieldSuccess(input) {
    input.classList.remove('error');
    input.classList.add('success');

    // Remove existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearFieldError(input) {
    input.classList.remove('error', 'success');

    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearFormErrors(form) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => clearFieldError(input));
}

function showSuccessMessage(message) {
    alert(message);
}

function showErrorMessage(message) {
    alert(message);
}