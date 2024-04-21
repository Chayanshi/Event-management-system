const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};


if (!TOKEN){
    
  const notification = document.createElement('div');
  notification.textContent = 'Session Expired';
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.right = '10px';
  notification.style.backgroundColor = 'red';
  notification.style.color = 'white';
  notification.style.padding = '10px';
  notification.style.zIndex = '1000';
  document.body.appendChild(notification);

  // Redirect to the home page after 2 seconds
  setTimeout(() => {
      // Replace '/' with the URL you want to redirect to
      window.location.href = '/';
  }, 2000);
}


const instructionParagraph = document.getElementById('email');

// Function to update the paragraph text
function updateInstructionText(newText) {
  instructionParagraph.textContent = newText;
}

// Your existing validation function
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function validateEmail() {
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('emailError');
  const email = emailInput.value.trim();

  if (email === '') {
    emailError.innerText = '*Email is required';
    return false;
  } else if (!isValidEmail(email)) {
    emailError.innerText = '*Please enter a valid email address';
    return false;
  } else {
    emailError.innerText = '';
    return true;
  }
}

const form = document.getElementById('emailForm');

form.addEventListener('submit', function (event) {
  if (!validateEmail()) {
    event.preventDefault(); // Prevent form submission if email is invalid
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('emailForm');
  const overlay = document.getElementById('overlay');
  const dialogBox = document.getElementById('dialogBox');

  // Add a flag to check if the email is valid
  let isValidEmailValue = false;

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting normally
    isValidEmailValue = validateEmail(); // Validate the email

    if (isValidEmailValue) {
      // Show the overlay and dialog box only if the email is valid
      overlay.style.display = 'flex'; // Use 'flex' to center content vertically
      dialogBox.style.display = 'block';
      updateInstructionText("Please enter your registered email address to receive the OTP.");
    }
  });

  // Validate the email field
  function validateFields() {
    isValidEmailValue = validateEmail();
    if (isValidEmailValue) {
      updateInstructionText("Please enter your registered email address to receive the OTP.");
    } else {
      updateInstructionText("Enter the email address associated with your account and we will give you the opportunity to reset the password.");
    }
  }

  // Validate the email field when it changes
  document.getElementById('email').addEventListener('input', validateFields);
});
