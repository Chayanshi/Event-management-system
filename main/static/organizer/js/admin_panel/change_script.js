const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
// const BASE_URL = 'http://127.0.0.1:8000/app';
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



async function validateForm(event) {
    event.preventDefault();
    var emailInput = document.forms["myForm"]["email"].value;
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const changeUrl = `${BASE_URL}/ChangePasswordView/`;
    if (emailInput === "") {
      document.getElementById("emailError").innerHTML = "*Email id is required.";
      return false;
    } else if (!emailPattern.test(emailInput)) {
      document.getElementById("emailError").innerHTML = "*Email id is incorrect";
      return false;
    } else { 

      data = {
        "email" : EMAIL
      } 
      try {
        const response = await fetch(changeUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        if (response.ok) {
          const responseData = await response.json();
        //   console.log("Response Body:", responseData)
          if (response.status === 200) {
            alert('OTP sent successfully');
            goToOtpPage();
            // console.log("OTP sent");
            return true;
          } else if (response.status === 404) {
            alert("error message")
        // const error = new Error("User not registered");
        // alert("error")
        document.getElementById("emailError").innerHTML = error.message;
       
        return false;
        }
         else {
            alert("Failed to send OTP. Please try again.");
            return false;
          }
        } else {
          console.error('Failed to send OTP. Server returned an error.');
          return false;
        }

      } catch (error) {
        console.error('Error sending OTP:', error);
        return false;
      }
    }
 
}  

function goToOtpPage(){
    window.location.href = '/verifyOtp';
}

async function verifyOTP(email, otp) {
    const apiUrl = `${BASE_URL}/VerifyEmail/`;
    const response = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({ email, otp }),
        headers: headers,
    });
    return response;
}

let countdownTime = 120; // 2 minutes
let timerInterval; // Variable to hold the timer interval

function updateTimer() {
    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;
    // console.log(document.getElementById("minutes").textContent)
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
    const email = EMAIL
    const otpInput = document.getElementById('otp').value;
    // console.log(typeof(otpInput))
    if (String(otpInput) === "") {
        document.getElementById("otpError").innerHTML = "*Otp is required.";
        return false;
    } else {
        await verifyOTP(email, otpInput).then((response) => {
            // console.log(response)
            if (response.ok) {
                const data = response.json();
                // console.log(data);
                if (response.status === 200) {
                    document.getElementById("otpError").innerHTML = "";
                    alert('OTP verified successfully');
                    window.location.href = '/change_verify';
                    return true;
                } else {
                    document.getElementById("otpError").innerHTML = "*INCORRECT OTP";
                    alert("Failed to verify OTP. Please try again.");
                    return false;
                }
            } else {
                document.getElementById("otpError").innerHTML = "*Failed to verify OTP";
                throw new Error("Failed to verify OTP");
            }
        });
    }
}

// Initialize the timer when the page loads
// updateTimer();
timerInterval = setInterval(updateTimer, 1000);



function updateCountdown() {
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");
    const countdownText = document.getElementById("countdownText");
    const resendOTP = document.getElementById("resendOTP");

    const minutes = Math.floor(otpExpiryTimeInSeconds / 60);
    const seconds = otpExpiryTimeInSeconds % 60;
    if (otpExpiryTimeInSeconds <= 0) {
        console.log("Reached")
        // OTP has expired, you can handle this event as needed
        clearInterval(countdownInterval);
        alert("OTP has expired.");
        document.getElementById("resendOTP").style.display = "inline"; // Show the "Resend OTP" option
    } else {
        // Decrement the OTP expiry time
        otpExpiryTimeInSeconds--;
    }
}

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


function togglePasswordVisibility(inputId) {
      var passwordInput = document.getElementById(inputId);
      var eyeIcon = passwordInput.nextElementSibling;
  
      if (passwordInput.type === "password") {
          passwordInput.type = "text";
          eyeIcon.classList.remove("fa-eye-slash");
          eyeIcon.classList.add("fa-eye");
      } else {
          passwordInput.type = "password";
          eyeIcon.classList.remove("fa-eye");
          eyeIcon.classList.add("fa-eye-slash");
      }
  }
  
// async function validatePasswordForm() {
//     var lastThreePasswords = [];
//     var currentPassword = document.getElementById("currentPasswordInput").value;
//     var newPassword = document.getElementById("newPasswordInput").value;
//     var confirmPassword = document.getElementById("confirmPasswordInput").value;

//     // Clear error messages
//     document.getElementById("currentPasswordError").innerHTML = "";
//     document.getElementById("newPasswordError").innerHTML = "";
//     document.getElementById("confirmPasswordError").innerHTML = "";

//     if (currentPassword === "") {
//         document.getElementById("currentPasswordError").innerHTML = "* Current Password is required.";
//         return false;
//     }
//     if (newPassword === "") {
//         document.getElementById("newPasswordError").innerHTML = "* New Password is required.";
//         return false;
//     }
//     if (confirmPassword === "") {
//         document.getElementById("confirmPasswordError").innerHTML = "* Confirm Password is required.";
//         return false;
//     }
//     if(newPassword!=confirmPassword){
//         document.getElementById("confirmPasswordError").innerHTML = "* New password and Confirm password do not match.";
//         return false;
//     }
//     if (lastThreePasswords.includes(newPassword)) {
//         document.getElementById("newPasswordError").innerHTML = "* New password cannot be one of the last three passwords.";
//         return false;
//     }
//     lastThreePasswords.push(newPassword);
//     if (lastThreePasswords.length > 3) {
//         lastThreePasswords.shift(); // Remove the oldest password
//     }
//     var sessionemail = EMAIL
//     const data = {
//         "email": EMAIL,
//         "current_password": currentPassword,
//         "new_password": newPassword,
//         "confirm_password": confirmPassword
//     }


//     const response = await fetch(`http://172.16.12.253:9090/Reset_Change/`,{
//         method: 'POST',
//         headers:headers,
//         body: JSON.stringify(data)
//     })
//     alert(response)
//     try {
       
//     if (!response.ok){
//         alert("Password did't changed")
//     }
//     else{
//             const responseData = await response.json();
//             if (responseData.success) {
//                 alert("Password Changed");
//                 window.location.href = '/admin_login';
//             } else {
//                 alert("Password change failed: " + responseData.message);
//             }
//         }
//     } catch (error) {
//         throw new Error
//     } }


async function validatePasswordForm(event) {
    event.preventDefault()
    var lastThreePasswords = [];
    var currentPassword = document.getElementById("currentPasswordInput").value;
    var newPassword = document.getElementById("newPasswordInput").value;
    var confirmPassword = document.getElementById("confirmPasswordInput").value;

    // Clear error messages
    document.getElementById("currentPasswordError").innerHTML = "";
    document.getElementById("newPasswordError").innerHTML = "";
    document.getElementById("confirmPasswordError").innerHTML = "";

    if (currentPassword === "") {
        document.getElementById("currentPasswordError").innerHTML = "* Current Password is required.";
        return false;
    }
    if (newPassword === "") {
        document.getElementById("newPasswordError").innerHTML = "* New Password is required.";
        return false;
    }
    if (confirmPassword === "") {
        document.getElementById("confirmPasswordError").innerHTML = "* Confirm Password is required.";
        return false;
    }
    if (newPassword !== confirmPassword) {
        document.getElementById("confirmPasswordError").innerHTML = "* New password and Confirm password do not match.";
        return false;
    }
    if (lastThreePasswords.includes(newPassword)) {
        document.getElementById("newPasswordError").innerHTML = "* New password cannot be one of the last three passwords.";
        return false;
    }
    lastThreePasswords.push(newPassword);
    if (lastThreePasswords.length > 3) {
        lastThreePasswords.shift(); // Remove the oldest password
    }
    
    const data = {
        email: EMAIL,
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
    };

    try {
        const response = await fetch(`${BASE_URL}/Reset_Change/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        // console.log(response)
        alert(response)
        if (!response.ok) {
            alert("Password didn't change");
        } else {
            const responseData = await response.json();
            // console.log(responseData)
            if (response.ok) {
                // alert("Password Changed");
                showSuccessPopup()
                setTimeout(function () {
                window.location.href = `/admin_dashboard`;
            }, 2000);
                // window.location.href = '/admin_dashboard';
            } else {
                alert("Password change failed: " + responseData.message);
            }
        }
    } catch (error) {
        console.error("An error occurred:", error);
        // Handle the error appropriately, e.g., show an error message to the user.
    }
}

       
function passwordValidated(){
      if (validatePasswordChange()){
            showOTPDialog();
            return false;
      }
}

//function to display dialog box
function showSuccessPopup() {
    var popup = document.getElementById("successPopup");
    popup.style.display = "block";
    setTimeout(function () {
      popup.style.display = "none"; 
    }, 2000);
  }
  