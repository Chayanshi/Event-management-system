const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
// const BASE_URL = 'http://127.0.0.1:8000/app';
const headers = {
  Authorization: `Bearer ${TOKEN}`,
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



async function validateForm(event) {
  event.preventDefault();

  // Show the loader when the form is submitted
  document.getElementById("loader").style.display = "block";

  var emailInput = document.forms["myForm"]["email"].value;
  var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const changeUrl = `${BASE_URL}/ForgotPasswordView/`;
  // const formdata = new FormData();
  var data = {
    "email": emailInput,
  };
  if (emailInput === "") {
    document.getElementById("emailError").innerHTML = "*Email id is required.";
    document.getElementById("loader").style.display = "none";
    return false;
  } else if (!emailPattern.test(emailInput)) {
    document.getElementById("emailError").innerHTML = "*Email id is incorrect";
    document.getElementById("loader").style.display = "none";
    return false;
  } else {
    // formdata.append("email", emailInput);
    try {
      // const urlWithQueryParam = `${changeUrl}?email=${encodeURIComponent(emailInput)}`;
      const response = await fetch(changeUrl, {
        method: "POST",
        body: JSON.stringify(data),
        headers:{
          "Content-Type": "application/json",
        },
      });
      console.log(response)
      if (response.ok) {
        const responseData = await response.json();
        // console.log("Response Body:", responseData);
        if (response.status === 200) {
            sessionStorage.setItem("verifiedEmail", emailInput)
            goToOtpPage();
          return true;
        } else if (response.status === 404) {
          document.getElementById("emailError").innerHTML = error.message;
          // Hide the loader if there is an error
          document.getElementById("loader").style.display = "none";
          return false;
        } else {
          alert("Failed to send OTP. Please try again.");
          // Hide the loader if there is an error
          document.getElementById("loader").style.display = "none";
          return false;
        }
      } else {
        console.error("Failed to send OTP. Server returned an error.");
        // Hide the loader if there is an error
        document.getElementById("loader").style.display = "none";
        return false;
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      // Hide the loader if there is an error
      document.getElementById("loader").style.display = "none";
      return false;
    } finally {
      // Hide the loader if there is an error
      document.getElementById("loader").style.display = "none";
    }
  }
}





function goToOtpPage() {
  window.location.href = "/forget_otp";
}

async function checkOtp(event) {
  event.preventDefault();
  const email = sessionStorage.getItem("verifiedEmail");
  // const otpInput = document.getElementById('otp').value;
  const otpInput1 = document.getElementById("otpInput1").value;
  const otpInput2 = document.getElementById("otpInput2").value;
  const otpInput3 = document.getElementById("otpInput3").value;
  const otpInput4 = document.getElementById("otpInput4").value;
  const otpInput5 = document.getElementById("otpInput5").value;
  const otpInput6 = document.getElementById("otpInput6").value;
  const enteredOTP =
    otpInput1 + otpInput2 + otpInput3 + otpInput4 + otpInput5 + otpInput6;
  if (String(enteredOTP) === "") {
    document.getElementById("otpError").innerHTML = "*Otp is required.";
    return false;
  } else {
    verifyOTP(email, enteredOTP).then((response) => {
      console.log(response)
      if (response.ok) {
        const data = response.json();
        // console.log(data);
        if (response.status === 200) {
          document.getElementById("otpError").innerHTML = "";
          // alert("OTP verified successfully");
          window.location.href = "/reset_password";
          return true;
        } else {
          document.getElementById("otpError").innerHTML = "*INCORRECT OTP";
          alert("Failed to verify OTP. Please try again.");
          return false;
        }
      } else {
        document.getElementById("otpError").innerHTML = "*INCORRECT OTP";
        throw new Error("Failed to verify OTP");
      }
    });
  }
}

async function verifyOTP(email, otp) {
  const forgot_email = sessionStorage.getItem("verifiedEmail");
  const TOKEN = sessionStorage.getItem("token");
  
  const apiUrl = `${BASE_URL}/VerifyEmail/`;
  const response = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({ email, otp }),
    headers: {
      "Content-Type": "application/json",

    },
  });
  return response;
}

let countdownTime = 120; 
let timerInterval;
function updateTimer() {
  const minutes = Math.floor(countdownTime / 60);
  const seconds = countdownTime % 60;
  document.getElementById("minutes").textContent = String(minutes).padStart(2, '0');
  document.getElementById("seconds").textContent = String(seconds).padStart(2, '0');

  if (countdownTime === 0) {
      clearInterval(timerInterval);
      document.getElementById("resendOTP").style.display = "inline";
  } else {
      countdownTime--;
  }
} 

function resendOTPFunction() {
  countdownTime = 120;
  document.getElementById("resendOTP").style.display = "none";
  updateTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
}


async function checkOtp(event) {
  event.preventDefault();
  const email = sessionStorage.getItem("verifiedEmail");
  const otpInput1 = document.getElementById("otpInput1").value;
  const otpInput2 = document.getElementById("otpInput2").value;
  const otpInput3 = document.getElementById("otpInput3").value;
  const otpInput4 = document.getElementById("otpInput4").value;
  const otpInput5 = document.getElementById("otpInput5").value;
  const otpInput6 = document.getElementById("otpInput6").value;
  const enteredOTP =
    otpInput1 + otpInput2 + otpInput3 + otpInput4 + otpInput5 + otpInput6;
  if (String(enteredOTP) === "") {
    document.getElementById("otpError").innerHTML = "*Otp is required.";
    return false;
  } else {
    verifyOTP(email, enteredOTP).then((response) => {
      console.log(response)
      if (response.ok) {
        const data = response.json();
        // console.log(data);
        if (response.status === 200) {
          document.getElementById("otpError").innerHTML = "";
          // alert("OTP verified successfully");
          window.location.href = "/reset_password";
          return true;
        } else {
          document.getElementById("otpError").innerHTML = "*INCORRECT OTP";
          alert("Failed to verify OTP. Please try again.");
          return false;
        }
      } else {
        document.getElementById("otpError").innerHTML = "*INCORRECT OTP";
        throw new Error("Failed to verify OTP");
      }
    });
  }
}
// Initialize the timer when the page loads

function updateCountdown() {
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");
  const countdownText = document.getElementById("countdownText");
  const resendOTP = document.getElementById("resendOTP");

  const minutes = Math.floor(countdownTime / 60);
  const seconds = countdownTime % 60;
  if (countdownTime <= 0) {
      clearInterval(timerInterval);
      alert("OTP has expired.");
      document.getElementById("resendOTP").style.display = "inline"; // Show the "Resend OTP" option
  } else {
      // Decrement the OTP expiry time
      countdownTime--;
  }
}
window.onload = function() {
  timerInterval = setInterval(updateTimer, 1000);
};
// Attach a click event listener to the "Resend OTP" link
function generateNewOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

function resendOTPFunction() {
  const newOTP = generateNewOTP(); 
  otpExpiryTimeInSeconds = 2 * 60;
  countdownInterval = setInterval(updateCountdown, 1000); // Restart the countdown interval
  document.getElementById("countdownText").style.display = "inline"; // Show the countdown
  document.getElementById("resendOTP").style.display = "none"; // Hide the "Resend OTP" option
}

function validatePasswordForm(event) {
  event.preventDefault();
  var ChangePasswordAPI = `${BASE_URL}/ResetPasswordView/`;
  var lastThreePasswords = [];
  var email = EMAIL
  console.log(email);
  if (email) {
    // console.log("Email retrieved from session storage:", email);
  } else {
    // console.log("Email not found in session storage.");
    return false;
  }
  var newPassword = document.getElementById("newPassword").value;
  var confirmPassword = document.getElementById("confirmPassword").value;

  // Clear error messages
  document.getElementById("passwordError").innerHTML = "";
  document.getElementById("confirmPasswordError").innerHTML = "";
  if (newPassword === "") {
    document.getElementById("passwordError").innerHTML =
      "* New Password is required.";
    return false;
  }
  if (confirmPassword === "") {
    document.getElementById("confirmPasswordError").innerHTML =
      "* Confirm Password is required.";
    return false;
  }
  if (newPassword != confirmPassword) {
    document.getElementById("confirmPasswordError").innerHTML =
      "* New password and Confirm password do not match.";
    return false;
  }
  if (lastThreePasswords.includes(newPassword)) {
    document.getElementById("passwordError").innerHTML =
      "* New password cannot be one of the last three passwords.";
    return false;
  }
  // Add the new password to the list of last three passwords
  lastThreePasswords.push(newPassword);
  // Ensure the list contains only the last three passwords
  if (lastThreePasswords.length > 3) {
    lastThreePasswords.shift(); // Remove the oldest password
  }
  var requestData = {
    "email": email,
    "new_password": newPassword,
    "confirm_password": confirmPassword,
  };
  fetch(ChangePasswordAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => {
      // alert(response)
      if (response.status === 200) {
        showPopup()
        // alert("Password change successful!");
        // window.location.href = '/'
      } else {
        response.json().then((data) => {
          // alert("Password change failed: " + data.errorMessage);
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      // alert("An error occurred while changing the password.");
      // alert("An error occurred while changing the password.");
    });
  return false;
}


function passwordValidated() {
  if (validatePasswordChange()) {
    showOTPDialog();
    return false;
  }
}
function showOTPDialog() {
  var overlay = document.getElementById("overlay");
  var dialogBox = document.getElementById("dialogBox");
  overlay.style.display = "block";
  dialogBox.style.display = "block";
  // Create a div for the text
  var textDiv = document.createElement("div");
  var checkmarkIcon = document.createElement("i");
  //<i class="fas fa-search"></i>
  // Append the text div to the dialog box
  dialogBox.appendChild(textDiv);
  // Set a timeout to hide the dialog after 30 seconds
  setTimeout(function () {
    overlay.style.display = "none";
    dialogBox.style.display = "none";
  }, 30000); // 30 seconds in milliseconds
  var checkmarkIcon = document.createElement("i");
}
function handleInput(currentInput, nextInputId, previousInputId) {
  const maxLength = parseInt(currentInput.getAttribute("maxlength"));
  const currentLength = currentInput.value.length;
  const previousInput = document.getElementById(previousInputId);
  if (currentLength === maxLength) {
    const nextInput = document.getElementById(nextInputId);
    if (nextInput) {
      nextInput.focus();
    }
  } else if (currentLength === 0) {
    if (previousInput) {
      previousInput.focus();
    }
  }
}

function showSuccessPopup() {
  var popup = document.getElementById("successPopup");
  popup.style.display = "block";
  setTimeout(function () {
    popup.style.display = "none"; 
  }, 2000);
}



// function showPopup() {
//   const overlay = document.getElementById('overlay');
//   overlay.style.display = 'block';

//   // Hide the popup after 2 seconds
//   setTimeout(() => {
//       overlay.style.display = 'none';
//       // Redirect to another page
//       window.location.href = '/'; // Replace with your desired URL
//   }, 2000); // 2000 milliseconds (2 seconds)
// }





function showPopup() {
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'block';

  // Hide the popup after 2 seconds
  setTimeout(() => {
      overlay.style.display = 'none';
      window.location.href = '/';
  }, 2000);
}
showPopup();