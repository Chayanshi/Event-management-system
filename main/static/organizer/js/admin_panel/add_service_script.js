

const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
const headers = {
  Authorization: `Bearer ${TOKEN}`,
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

document.getElementById("fileUploadForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const apiUrl = `${BASE_URL}/Add_New_Service/`;
  const formData = new FormData();
  const fileInput = document.getElementById("fileInput");
  const serviceName = document.getElementById("Service_Name").value;

  if (fileInput.files.length > 0 && serviceName.trim() !== "") {
    formData.append("Service_Name", serviceName);
    formData.append("Service_Image", fileInput.files[0]);

    fetch(apiUrl, {
      method: "POST",
      body: formData,
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the API response here, e.g., update the UI or redirect
        // console.log("API Response:", data);
        // Check for success or error status and act accordingly
        if (data.status === 200) {
          showSuccessPopup()
        setTimeout(function () {
          window.location.href = "/service_manage";
      }, 1000);
          // alert("File and data uploaded successfully.");
          // Redirect or update UI as needed
          
        } else {
          alert("API request failed. Check the response for details.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during the API request.");
      });
  } else {
    alert("Please select a file and provide a service name.");
  }
});

// Add this function to show the success popup
function showSuccessPopup() {
  var popup = document.getElementById("successPopup");
  popup.style.display = "block";
  setTimeout(function () {
    popup.style.display = "none"; 
  }, 1000);
}