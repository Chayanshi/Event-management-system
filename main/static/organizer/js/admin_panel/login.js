// const EMAIL = sessionStorage.getItem("verifiedEmail");
// const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
// const BASE_URL = 'http://127.0.0.1:8000/app';
const headers = {

  "Content-Type": "application/json",
};


const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.src = "/static/images/open.png";
    } else {
        passwordInput.type = "password";
        togglePassword.src = "/static/images/closed.png";
    }
});

function validateEmail() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const email = emailInput.value.trim();

    // Basic email validation
    if (email === '') {
        emailError.textContent = '*Email is required';
    } else if (!isValidEmail(email)) {
        emailError.textContent = '*Please enter a valid email address';
    } else {
        emailError.textContent = ''; // Clear the error message
    }
}

function validatePassword() {
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');
    const password = passwordInput.value.trim();

    // Password length between 8 and 16 characters
    if (password.length < 8 || password.length > 16) {
        passwordError.textContent = '*Password must be between 8 and 16 characters';
    }
    // Check for at least one uppercase letter
    else if (!/[A-Z]/.test(password)) {
        passwordError.textContent = '*Password must contain at least one uppercase letter';
    }
    // Check for at least one lowercase letter
    else if (!/[a-z]/.test(password)) {
        passwordError.textContent = '*Password must contain at least one lowercase letter';
    }
    // Check for at least one number
    else if (!/\d/.test(password)) {
        passwordError.textContent = '*Password must contain at least one number';
    }
    // Check for at least one special character
    else if (!/[!@#$%^&*]/.test(password)) {
        passwordError.textContent = '*Password must contain at least one special character';
    } else {
        passwordError.textContent = ''; // Clear the error message
    }
}

function isValidEmail(email) {
    // Basic email format validation (you can customize this)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}



function encryptData(data) {
    // Replace this with a secure encryption algorithm
    return btoa(data); // Base64 encoding for simplicity (not secure)
}

// Decrypt function (you should use a proper decryption library in a real application)
function decryptData(encryptedData) {
    // Replace this with the appropriate decryption algorithm
    return atob(encryptedData); // Base64 decoding for simplicity (not secure)
}

// Store encrypted data in localStorage
function storeEncryptedData(key, data) {
    const encryptedData = encryptData(data);
    localStorage.setItem(key, encryptedData);
}

// Retrieve and decrypt data from localStorage
function getDecryptedData(key) {
    const encryptedData = localStorage.getItem(key);
    if (encryptedData) {
        return decryptData(encryptedData);
    }
    return null;
}

// Function to handle Remember Me checkbox state
function handleRememberMe() {
    const rememberCheckbox = document.getElementById('remember');
    if (rememberCheckbox.checked) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
        
        // Store encrypted email and password
        storeEncryptedData('rememberedEmail', email);
        storeEncryptedData('rememberedPassword', password);
    } else {
        // Remove stored data if "Remember Me" is unchecked
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
    }
}

// Attach an event listener to the checkbox
const rememberCheckbox = document.getElementById('remember');
rememberCheckbox.addEventListener('change', handleRememberMe);

// Initialize the checkbox state and retrieve email and password
const rememberedEmail = getDecryptedData('rememberedEmail');
const rememberedPassword = getDecryptedData('rememberedPassword');
if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
}
if (rememberedPassword) {
    document.getElementById('password').value = rememberedPassword;
}



document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById("loader").style.display = "block";

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const data ={
        "email" :String(email),
        "password" :String(password),
    }

    fetch(`${BASE_URL}/Login/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 200 && data.message === 'Login successful') {
            sessionStorage.setItem("verifiedEmail", email);
            sessionStorage.setItem("token", data.token.access);

            // Call handleRememberMe to store the email and password if "Remember Me" is checked
            handleRememberMe();

            document.getElementById("loader").style.display = "none";
            window.location.href = '/admin_dashboard';
        } else {
            document.getElementById("loader").style.display = "none";
            const passwordError = document.getElementById('passwordError');
            passwordError.textContent = 'Enter correct Email and Password';

            // alert('Login failed. Please check your credentials.');
        }
    })  
    .catch(error => {
        document.getElementById("loader").style.display = "none";
        console.error('Error:', error);
        const passwordError = document.getElementById('passwordError');
        passwordError.textContent = 'Error occurred while logging in. Check your Email and password or refresh the page and try again';

        // alert('An error occurred during login.');
    });
});


// // Function to handle Remember Me checkbox state
// function handleRememberMe() {
//     const rememberCheckbox = document.getElementById('remember');
//     if (rememberCheckbox.checked) {
//         const email = document.getElementById('email').value;
//         const password = document.getElementById('password').value;
//         localStorage.setItem('rememberedEmail', email);
//         localStorage.setItem('rememberedPassword', password);
//     } else {
//         localStorage.removeItem('rememberedEmail');
//         localStorage.removeItem('rememberedPassword');
//     }
// }
