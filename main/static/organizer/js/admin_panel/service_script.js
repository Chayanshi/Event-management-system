const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';

// const BASE_URL = 'http://127.0.0.1:8080/app'

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

document.addEventListener("DOMContentLoaded", () => {
  const isServiceListPage = document.getElementById("serviceTable") !== null;
  if (isServiceListPage) {
    // Fetch and display the list of portfolios
    fetchDataFromAPI();
  } else {
    // Get the current page URL
    const currentPageURL = window.location.pathname;
    // Check if it's the view or edit portfolio page
    if (currentPageURL.includes("/view_service/")) {
      // Fetch and populate portfolio details in the view page
      const sr_no = document.getElementById("sr_no").innerText;
      if (sr_no) {
        fetchServiceDetails(sr_no);
      } else {
        console.error("No sr_no found in the query parameter.");
      }
    } else if (currentPageURL.includes("/edit_service/")) {
      // Fetch and populate portfolio details in the edit form
      const sr_no = document.getElementById("sr_no").innerText;
      if (sr_no) {
        fetchServiceDetailsforEdit(sr_no);
      } else {
        console.error("No sr_no found in the query parameter.");
      }
    }
  }

  //NEW CODE

  const serviceNameInput = document.getElementById("serviceNameInput");
  const serviceStartDateInput = document.getElementById(
    "serviceStartDateInput"
  );
  const serviceEndDateInput = document.getElementById("serviceEndDateInput");
  // console.log(serviceNameInput);
  // Attach an event listener to each input field for the 'keyup' event
  serviceNameInput.addEventListener("input", handleServiceSearch);
  serviceStartDateInput.addEventListener("change", handleServiceSearch);
  serviceEndDateInput.addEventListener("change", handleServiceSearch);
  async function fetchServices(
    service_name,
    start_date,
    end_date,
    method = "POST"
  ) {
    // console.log(service_name);
    try {
      const keyword1 = service_name || "";
      const fromDate1 = start_date || "";
      const toDate1 = end_date || "";


      const formData = {
        Service_Name: keyword1,
        start_date: fromDate1,
        end_date: toDate1,
      };
      // console.log(service_name);
      const apiUrl = `${BASE_URL}/get_unique_service/`;
      const response = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: headers,
      });
      if (response.status === 200) {
        const responseData = await response.json();

        if (
          responseData &&
          responseData.Response &&
          Array.isArray(responseData.Response)
        ) {
          const serviceTableBody = document.querySelector("#serviceTable");
          serviceTableBody.innerHTML = ""; // Clear existing data
          responseData.Response.forEach((service, index) => {
            // console.log(service);
            const row = document.createElement("tr");
            row.innerHTML = `
                  <td>${index + 1}</td>
                  <td>${service.Service_Name}</td>
                  <td>${service.Service_ID}</td>
                  <td><img src="${service.Service_Image}" alt="Service Image" class="i4"></td>
                  <td class="serviceStartDate">${service.formatted_created_datetime}</td>
                  <td>
                    <i class="fa-solid fa-eye view-service" data-sr-no="${service.sr_no}"></i>
                    <i class="fa-regular fa-pen-to-square edit-service" data-service-id="${service.sr_no}"></i>
                    <i class="fa-solid fa-trash delete-service" data-service-name="${service.Service_Name}"></i>                  </td>
                  `;
            serviceTableBody.appendChild(row);
          });
        } else {
          console.error("No results found or invalid response structure");
        }
      } else {
        console.error("Failed to fetch services:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }

  // Function to handle the search when any input field changes
  function handleServiceSearch() {
    // console.log("HELLLLL");
    const serviceName = serviceNameInput.value;
    const serviceStartDate = formatDateToYYYYMMDD(serviceStartDateInput.value);
    const serviceEndDate = formatDateToYYYYMMDD(serviceEndDateInput.value);
    // console.log(serviceName,serviceStartDate,serviceEndDate)
    fetchServices(serviceName, serviceStartDate, serviceEndDate, "POST");
  }
});



let itemsPerPage = 10; // Set the number of items per page
let currentPage = 1; // Track the current page number
let totalPageCount = 1; // Track the total number of pages
let apiUrl = `${BASE_URL}/get_all_service/?page=${currentPage}&page_size=${itemsPerPage}`;


const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageNumbersContainer = document.getElementById('pageNumbers');
const numberofrows = document.getElementById('numberofrows');

// Function to update pagination controls
function updatePaginationControls() {
  pageNumbersContainer.innerHTML = ''; // Clear existing page numbers
  for (let i = 1; i <= totalPageCount; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.dataset.pageNumber = i;
    pageBtn.addEventListener('click', () => {
      const pageNumber = parseInt(pageBtn.dataset.pageNumber);
      if (pageNumber !== currentPage) {
        currentPage = pageNumber;
        apiUrl = `${BASE_URL}/get_all_service/?page=${currentPage}&page_size=${itemsPerPage}`;
        fetchDataFromAPI(apiUrl);
      }
    });
    pageNumbersContainer.appendChild(pageBtn);
  }
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPageCount;
}

// Function to fetch data from the GET API for services
async function fetchDataFromAPI(url) {
  try {
    const response = await fetch(url, {
      headers: headers,
    });
    const data = await response.json();

    if (response.ok) {
      const serviceTableBody = document.querySelector('#serviceTable');
      serviceTableBody.innerHTML = ''; // Clear existing data
      const startingSrNo = (currentPage - 1) * itemsPerPage + 1;

      data.Response.results.forEach((service, index) => {
        const row = document.createElement('tr');
        row.dataset.serviceName = service.Service_Name;
        row.innerHTML = `
          <td>${startingSrNo + index}</td>
          <td>${service.Service_Name}</td>
          <td>${service.Service_ID}</td>
          <td><img src="${service.Service_Image}" alt="Service Image" class="i4"></td>
          <td>${service.formatted_created_datetime}</td>
          <td>
            <i class="fa-solid fa-eye view-service" data-sr-no="${service.sr_no}"></i>
            <i class="fa-regular fa-pen-to-square edit-service" data-service-id="${service.sr_no}"></i>
            <i class="fa-solid fa-trash delete-service" data-service-name="${service.Service_Name}"></i>
          </td>`;
        serviceTableBody.appendChild(row);
      });

      totalPageCount = data.total_pages;
      updatePaginationControls();

      // Update the "next" and "previous" links if available
      nextBtn.dataset.nextUrl = data.Response.next ? data.Response.next : '';
      prevBtn.dataset.prevUrl = data.Response.previous ? data.Response.previous : '';
    } else {
      console.error('Failed to fetch services:', data.message);
    }
  } catch (error) {
    console.error('Error fetching services:', error);
  }
}

// Event listener for the "next" button
nextBtn.addEventListener('click', () => {
  if (currentPage < totalPageCount) {
    currentPage++; // Increment the current page number
    apiUrl = `${BASE_URL}/get_all_service/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchDataFromAPI(apiUrl); // Fetch and render data for the next page
  }
});

// Event listener for the "previous" button
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--; // Decrement the current page number
    apiUrl = `${BASE_URL}/get_all_service/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchDataFromAPI(apiUrl); // Fetch and render data for the previous page
  }
});

// Event listener for the number of rows selection
numberofrows.addEventListener('change', () => {
  const selectedValue = numberofrows.value;
  if (selectedValue === 'all') {
    itemsPerPage = totalPageCount * 10; // Set itemsPerPage to total count of services
  } else {
    itemsPerPage = parseInt(selectedValue);
  }
  currentPage = 1; // Reset current page to 1 when changing the number of items per page
  apiUrl = `${BASE_URL}/get_all_service/?page=${currentPage}&page_size=${itemsPerPage}`;
  fetchDataFromAPI(apiUrl); // Fetch and render data with the updated itemsPerPage
});

// Initial fetch to load the first page
fetchDataFromAPI(apiUrl);


// Function to handle viewing the service details
function viewServiceDetails(sr_no) {
  fetchServiceDetails(sr_no);
  window.location.href = `/view_service/${sr_no}`;
}

// Function to handle editing the service
function editService(sr_no) {
  window.location.href = `/edit_service/${sr_no}`;

  // Implement the code to open an edit form or modal, pre-fill with service data, and update the service on save
}

// Function to handle deleting the service
async function deleteService(serviceName) {
  const row = document.querySelector(`[data-service-name="${serviceName}"]`);
  if (!row) return;

  try {
    const sr_no = row.querySelector("[data-sr-no]").getAttribute("data-sr-no");
    // Make an API request to delete the service based on sr_no
    const deleteServiceResponse = await fetch(
      `${BASE_URL}/delete_service/${sr_no}/`,
      {
        method: "DELETE",
        headers: headers,
      }
    );

    if (!deleteServiceResponse.ok) {
      throw new Error("Failed to delete the service");
    }

    // Remove the row from the table to reflect the service is deleted
    row.remove();
  } catch (error) {
    console.error(`Error deleting the service: ${error.message}`);
  }
}

// Add an event listener for clicks on the document
document.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("view-service")) {
    const sr_no = target.getAttribute("data-sr-no");
    viewServiceDetails(sr_no);
  } else if (target.classList.contains("edit-service")) {
    const serviceID = target.getAttribute("data-service-id");
    editService(serviceID);
  } else if (target.classList.contains("delete-service")) {
    const serviceName = target.getAttribute("data-service-name");
    deleteService(serviceName);
  }
});

// Fetch data when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
  fetchDataFromAPI(apiUrl);
});

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Function to fetch service details based on sr_no
async function fetchServiceDetails(sr_no) {
  try {
    // console.log("Fetching service details for sr_no:", sr_no);

    const response = await fetch(
      `${BASE_URL}/get_perticular_service/${sr_no}/`,
      {
        headers: headers,
      }
    );
    // console.log(response);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const responseData = await response.json();
    const serviceDetails = responseData.Response; // Access the nested Response object

    // console.log("Service details 11111:", serviceDetails);

    // Populate the service details on the page
    const serviceDetailsContainer = document.getElementById("serviceDetails");
    const serviceImage = document.getElementById("serviceImage");
    const serviceName = document.getElementById("serviceName");
    const serviceId = document.getElementById("serviceID");
    const createdDateTime = document.getElementById("createdDateTime");
    serviceName.innerText = `${serviceDetails.Service_Name}`;
    serviceId.innerText = `${serviceDetails.Service_ID}`;
    createdDateTime.innerText = `${serviceDetails.formatted_created_datetime}`;
    serviceImage.innerHTML = `<img src="${serviceDetails.Service_Image}" alt="Service Image"  class="img-fluid" style="background-color: #fff;width:20%">`;
  } catch (error) {
    console.error(`Error fetching service details: ${error.message}`);
  }
}

const sr_no = document.getElementById("sr_no").innerText;

// console.log("sr_no:", sr_no);
if (sr_no) {
  // Fetch and display service details
  fetchServiceDetails(sr_no);
} else {
  console.error("No sr_no found in the query parameter.");
}

if (sr_no) {
  // Fetch and display service details
  fetchServiceDetailsforEdit(sr_no);
} else {
  console.error("No sr_no found in the query parameter.");
}

// Function to fetch service details for editing
// // JavaScript code to populate the form
const editServiceForm = document.getElementById("editServiceForm");

// Function to fetch service details based on sr_no
async function fetchServiceDetailsforEdit(sr_no) {
  try {
    // console.log("Fetching service details for sr_no:", sr_no);

    const response = await fetch(
      `${BASE_URL}/get_perticular_service/${sr_no}/`,
      {
        headers: headers,
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const responseData = await response.json();
    const serviceDetails = responseData.Response; // Access the nested Response object
    // console.log("serviceDetails", serviceDetails)

    // Get the form element
    const editServiceForm = document.getElementById("editServiceForm");

    // Iterate over the service details and create labels and input fields
    for (const key in serviceDetails) {
  if (serviceDetails.hasOwnProperty(key)) {
    // Create label element
    const label = document.createElement("label");
    label.textContent = key;

    // Create input element
    const input = document.createElement("input");
    input.type = "text";
    input.id = key; // Use the key as the input ID
    input.name = key;
    input.value = serviceDetails[key];
    input.className = "inputbox"; // Use className to set the class

    // Make input readonly except for Service_Name and Service_Image
    if (key !== "Service_Name" && key !== "Service_Image") {
      input.readOnly = true;
    }

    // Create line break elements for spacing
    const lineBreak = document.createElement("br");
    const lineBreak2 = document.createElement("br");
    const lineBreak3 = document.createElement("br");

    // Append label, input, and line breaks to the form
    editServiceForm.appendChild(label);
    // editServiceForm.appendChild(lineBreak);
    editServiceForm.appendChild(input);
    editServiceForm.appendChild(lineBreak2);
    // editServiceForm.appendChild(lineBreak3);

    // Special handling for the "Service_Image" key
    if (key === "Service_Image") {
      // Create an image element
      const image = document.createElement("img");
      image.src = `${serviceDetails[key]}`;
      image.alt = "Service Image";
      image.className = "img-fluid";
      image.style.backgroundColor = "white";
      image.style.width = "15%";
      image.style.margin = "10px";

      // Append the image to the form
      editServiceForm.appendChild(image);

      // Create an input element for changing the image
      const imageInput = document.createElement("input");
      imageInput.type = "file";
      imageInput.id = "Service_Image"; // Use the key as the input ID
      imageInput.name = "Service_Image";

      // Add an event listener to handle changes to the input field
      imageInput.addEventListener("change", function () {
        const newImage = this.files[0];
        const imageURL = URL.createObjectURL(newImage);
        image.src = imageURL;
      });

      // Create line break elements for spacing
      const lineBreak4 = document.createElement("br");
      const lineBreak5 = document.createElement("br");

      // Append the input and line breaks to the form
      editServiceForm.appendChild(imageInput);
      editServiceForm.appendChild(lineBreak4);
      editServiceForm.appendChild(lineBreak5);

      const submitButton = document.getElementById("submitButton");
      // Add an event listener for the Save Changes button
      submitButton.addEventListener('click', () => {
          // Get the sr_no from the query parameter
          const sr_no = document.getElementById('sr_no');
          submitForm();
      });
    }
  }
}
  } catch (error) {
    console.error(`Error fetching service details: ${error.message}`);
  }
}

async function submitForm() {
  try {
    const editServiceForm = document.getElementById("editServiceForm");
    const formData = new FormData(editServiceForm);

    // Get the sr_no from the URL
    const sr_no = document.getElementById("sr_no").innerText;

    if (sr_no) {
      const imageInput = document.getElementById("Service_Image");
      // const existingImageURL = serviceDetails["Service_Image"]; // Get the existing image URL

      if ( imageInput.files && imageInput.files.length > 0) {
        // If a new image is selected, include it in the FormData
        formData.set("Service_Image", imageInput.files[0]);
      }
      else {
        // If no new image is selected, include the existing image URL in the FormData
        formData.delete("Service_Image");
      }
  
      // Make an API request to update the service details
      const response = await fetch(`${BASE_URL}/update_service/${sr_no}/`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      if (response.ok) {
        showSuccessPopup()
        setTimeout(function () {
          // window.location.href = `/view_service/${sr_no}`;
          window.location.href = `/service_manage`;

      }, 2000);
        // window.location.href = `/view_service/${sr_no}`;
        // alert("Service details updated successfully.");
        // Redirect to the home page after successful update or handle as needed
      } else {
        throw new Error("Failed to update service details.");
      }
    } else {
      console.error("No sr_no found in the query parameter.");
    }
  } catch (error) {
    console.error(`Error submitting form: ${error.message}`);
  }
}




// Get the sr_no from the query parameter
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function formatDateToYYYYMMDD(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null; // Invalid date
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

// Add this function to show the success popup
function showSuccessPopup() {
  var popup = document.getElementById("successPopup");
  popup.style.display = "block";
  setTimeout(function () {
    popup.style.display = "none"; 
  }, 2000);
}
