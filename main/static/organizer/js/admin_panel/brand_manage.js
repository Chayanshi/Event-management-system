const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
// const BASE_URL = 'http://127.0.0.1:8000/app'

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};
const authHeader ={
  Authorization: `Bearer ${TOKEN}`,
}



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
  // Check if the current page is the brand list page
  const isBrandListPage = document.getElementById("brandTable") !== null;
  // Add an event listener to handle form submission

  if (isBrandListPage) {
    // Fetch and display the list of brands
    fetchBrandsFromAPI();
  } else {
    // Get the current page URL
    const currentPageURL = window.location.pathname;

    // Check if it's the view or edit brand page
    if (currentPageURL.includes("/view_brand/")) {
      // Fetch and populate brand details in the view page
      const sr_no = document.getElementById("sr_no").innerText;
      if (sr_no) {
        fetchBrandDetails(sr_no);
      } else {
        console.error("No sr_no found in the query parameter.");
      }
    } else if (currentPageURL.includes("/edit_brand/")) {
      // Fetch and populate brand details in the edit form
      const sr_no = document.getElementById("sr_no").innerText;
      if (sr_no) {
        fetchBrandDetailsForEdit(sr_no);
      } else {
        console.error("No sr_no found in the query parameter.");
      }
    }
  }
});





let itemsPerPage = 10; // Set the number of items per page
let currentPage = 1; // Track the current page number
let totalPageCount = 1; // Track the total number of pages
let apiUrl = `${BASE_URL}/GetAllBrands/?page=${currentPage}&page_size=${itemsPerPage}`;

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNumbersContainer = document.getElementById("pageNumbers");
const numberofrows = document.getElementById("numberofrows");

// Function to update pagination controls
function updatePaginationControls() {
  pageNumbersContainer.innerHTML = ""; // Clear existing page numbers
  for (let i = 1; i <= totalPageCount; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.dataset.pageNumber = i;
    pageBtn.addEventListener("click", () => {
      const pageNumber = parseInt(pageBtn.dataset.pageNumber);
      if (pageNumber !== currentPage) {
        currentPage = pageNumber;
        apiUrl = `${BASE_URL}/GetAllBrands/?page=${currentPage}&page_size=${itemsPerPage}`;
        fetchBrandsFromAPI(apiUrl);
      }
    });
    pageNumbersContainer.appendChild(pageBtn);
  }
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPageCount;
}

// Function to fetch data from the GET API for brands
async function fetchBrandsFromAPI(url) {
  try {
    const response = await fetch(url, {
      headers: headers,
    });
    const data = await response.json();

    if (response.ok) {
      const brandTableBody = document.querySelector("#brandTable");
      brandTableBody.innerHTML = ""; // Clear existing data
      data.Response.results.forEach((brand, index) => {
        const startingSrNo = (currentPage - 1) * itemsPerPage + 1;
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${startingSrNo + index}</td>
        <td>${brand.brand_name}</td>
        <td><img src="${brand.brand_Image}" alt="Brand Image" class="i4"></td>
        <td>${new Date(brand.formatted_created_datetime).toLocaleString()}</td>
        <td>
          <i class="fa-solid fa-eye view-brand" data-sr-no="${brand.sr_no}"></i> 
          <i class="fa-regular fa-pen-to-square edit-brand" data-sr-no="${brand.sr_no}"></i>
          <i class="fa-solid fa-trash delete-brand" data-brand-name="${brand.sr_no}"></i>
        </td>`;
        brandTableBody.appendChild(row);
      });
      totalPageCount = data.total_pages;
      updatePaginationControls();
    } else {
      console.error("Failed to fetch brands:", data.message);
    }
    // Update the "next" and "previous" links if available
    nextBtn.dataset.nextUrl = data.next ? data.next : "";
    prevBtn.dataset.prevUrl = data.previous ? data.previous : "";
  } catch (error) {
    console.error("Error fetching brands:", error);
  }
}

// Event listener for the "next" button
nextBtn.addEventListener("click", () => {
  if (currentPage < totalPageCount) {
    currentPage++; // Increment the current page number
    apiUrl = `${BASE_URL}/GetAllBrands/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchBrandsFromAPI(apiUrl); // Fetch and render data for the next page
  }
});

// Event listener for the "previous" button
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--; // Decrement the current page number
    apiUrl = `${BASE_URL}/GetAllBrands/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchBrandsFromAPI(apiUrl); // Fetch and render data for the previous page
  }
});

// Event listener for the number of rows selection
numberofrows.addEventListener("change", () => {
  const selectedValue = numberofrows.value;
  if (selectedValue === "all") {
    itemsPerPage = totalPageCount * 10; // Set itemsPerPage to total count of brands
  } else {
    itemsPerPage = parseInt(selectedValue);
  }
  currentPage = 1; // Reset current page to 1 when changing the number of items per page
  apiUrl = `${BASE_URL}/GetAllBrands/?page=${currentPage}&page_size=${itemsPerPage}`;
  fetchBrandsFromAPI(apiUrl); // Fetch and render data with the updated itemsPerPage
});

// Initial fetch to load the first page
fetchBrandsFromAPI(apiUrl);





// Function to handle viewing the brand details
function viewBrandDetails(sr_no) {
  // Redirect the user to the view_brand.html page with sr_no as a query parameter
  window.location.href = `/view_brand/${sr_no}`;
}

// Function to handle editing the brand
function editBrand(sr_no) {
  window.location.href = `/edit_brand/${sr_no}`;
  // Implement the code to open an edit form or modal, pre-fill with brand data, and update the brand on save
}

async function deleteBrand(sr_no) {
  const row = document.querySelector(`[data-brand-name="${sr_no}"]`);
  if (!row) {
    console.error(`Row with data-brand-name "${sr_no}" not found.`);
    return;
  }
  try {
    const deleteBrandResponse = await fetch(
      `${BASE_URL}/DeleteBrand/${sr_no}/`,
      {
        method: "DELETE",
        headers: headers,
      }
    );
    if (!deleteBrandResponse.ok) {
      throw new Error("Failed to delete the brand");
    }
    row.remove();
    window.location.reload();
  } catch (error) {
    console.error(`Error deleting the brand: ${error.message}`);
  }
}
// Function to fetch and populate brand details in the view page
async function fetchBrandDetails(sr_no) {
  // console.log(sr_no);
  try {
    const response = await fetch(`${BASE_URL}/Get_Perticular_brand/${sr_no}/`, {
      headers: headers,
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const responseData = await response.json();
    const brandDetails = responseData.Response;
    const brandDetailsContainer = document.getElementById("BrandDetails");
    brandDetailsContainer.innerHTML = ` 
                <img src="${brandDetails.brand_Image}" alt="Brand Image" class="img-fluid" style="width:20%">
                <p class="view_details mt-3">Brand SR No : ${brandDetails.sr_no}</p>
                <p class="view_details">Brand Name : ${brandDetails.brand_name}</p>
                <p class="view_details>Created Datetime : ${brandDetails.formatted_created_datetime}</p>
                `;
  } catch (error) {
    console.error(`Error fetching brand details : ${error.message}`);
  }
}
// Function to fetch and populate brand details in the edit form
async function fetchBrandDetailsForEdit(sr_no) {
  try {
    const response = await fetch(`${BASE_URL}/Get_Perticular_brand/${sr_no}/`, {
      headers: authHeader
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    // console.log('Response data:', data);

    const brandData = data.Response;
    // console.log("Brand data:", brandData);
    const fields = [
      { key: "sr_no", label: "Brand SR No", readOnly: true },
      { key: "brand_name", label: "Brand Name", readOnly: false },
      { key: "brand_Image", label: "Brand Image", readOnly: false },
      {
        key: "formatted_created_datetime",
        label: "Created Date/Time",
        readOnly: true,
      },
    ];
    const editBrandForm = document.getElementById("editBrandForm");
    editBrandForm.innerHTML = "";
    fields.forEach((field) => {
      // Create label element
      const label = document.createElement("label");
      label.textContent = field.label;

      // Create input element
      const input = document.createElement("input");
      input.type = "text";
      input.id = field.key; // Use the key as the input ID
      input.name = field.key;
      input.value = brandData[field.key]; // Get the value using the key
      input.className = "inputbox";

      // Set the input's readOnly attribute
      input.readOnly = field.readOnly;

      // Special handling for the "Brand_Image" field
      if (field.key === "brand_Image") {
        // Create an image element to display the current image
        const image = document.createElement("img");
        image.src = brandData[field.key]; // Set the image source to the brand image URL
        image.alt = "Brand Image";
        image.style.width = "20%";
        image.style.padding = "2%";
        image.className = "img-fluid"; // Apply Bootstrap class for responsive images

        // Create an input element for changing the image
        const imageInput = document.createElement("input");
        imageInput.type = "file";
        imageInput.id = "brand_Image";
        imageInput.name = "brand_Image";
        imageInput.style.color = "white";

        // Add an event listener to handle changes to the input field
        imageInput.addEventListener("change", function () {
          const newImage = this.files[0];
          const imageURL = URL.createObjectURL(newImage);
          image.src = imageURL;
        });

        // Append the label, image, input, and line breaks to the form
        editBrandForm.appendChild(label);
        editBrandForm.appendChild(image);
        editBrandForm.appendChild(imageInput);
        editBrandForm.appendChild(document.createElement("br"));
      } else {
        // Append the label, input, and line breaks to the form
        editBrandForm.appendChild(label);
        // editBrandForm.appendChild(document.createElement("br"));
        editBrandForm.appendChild(input);
        editBrandForm.appendChild(document.createElement("br"));
      }
    });

        const goback = document.createElement("a");
        goback.textContent = "Go Back";
        goback.href="javascript:history.back()"
        goback.className = "btn";
        goback.style.marginTop="40px";
        goback.style.backgroundColor="#B0D9B1";
        goback.style.color="#425743";

        // Create a button for submitting the form
        const submitButton = document.createElement("button");
        submitButton.textContent = "Save Changes";
        submitButton.type = "button";
        submitButton.id = "saveButton";
        submitButton.className = "btn";
        submitButton.style.marginTop="40px";
        submitButton.style.marginLeft="10px";
        submitButton.style.backgroundColor="#B0D9B1";
        submitButton.style.color="#425743";


        // Append the Save Changes button to the form
        editBrandForm.appendChild(goback);
        editBrandForm.appendChild(submitButton);


    // Add an event listener to handle form submission
    submitButton.addEventListener("click", function () {
      submitBrandForm(sr_no); // Pass brandData as a parameter
    });

  } catch (error) {
    console.error(`Error fetching brand details for edit: ${error.message}`);
  }
}

// Function to submit the brand form
// async function submitBrandForm(sr_no) {
//   try {
//     const editBrandForm = document.getElementById("editBrandForm");

//     // const editBrandForm = document.createElement("form");
// editBrandForm.id = "editBrandForm";
// editBrandForm.enctype = "multipart/form-data"; // Add enctype for file upload

//     const formData = new FormData(editBrandForm);
    
//     const formDataJson = {};
//     formData.forEach((value, key) => {
//         formDataJson[key] = value;
//     });
//     // Make an API request to update the brand details using "sr_no" as the identifier
//     const response = await fetch(`${BASE_URL}/UpdateBrand/${sr_no}/`, {
//       method: "PUT",
//       body:  JSON.stringify(formData),
//       headers: headers,
//     });

//     if (response.status==200) {
//       alert("Brand details updated successfully.");
//     } else {
//       const errorElement = document.getElementById("updateError");
//       errorElement.textContent =
//         "Failed to update brand details. Please try again.";
//       throw new Error("Failed to update brand details.");
//     }
//   } catch (error) {
//     console.error(`Error submitting brand form: ${error.message}`);
//   }
// }

async function submitBrandForm(sr_no) {
  try {
      const editBrandForm = document.getElementById('editBrandForm');
      const formData = new FormData(editBrandForm);

      // Make an API request to update the brand details using "sr_no" as the identifier
      const response = await fetch(`${BASE_URL}/UpdateBrand/${sr_no}/`, {
          method: 'PUT',
          body: formData,
          headers:{
              Authorization: `Bearer ${TOKEN}`,

          },
      });

      if (response.ok) {
        showSuccessPopup()  
          setTimeout(function () {
            window.location.href = `/brand_manage`;
        }, 2000);
          // alert('Brand details updated successfully.');
      } else {
          const errorElement = document.getElementById('updateError');
          errorElement.textContent = 'Failed to update brand details. Please try again.';
          throw new Error('Failed to update brand details.');
      }
  } catch (error) {
      console.error(`Error submitting brand form: ${error.message}`);
  }
}


// Function to handle changes to the brand image input
function handleImageChange() {
  const imageInput = document.getElementById("brand_Image");
  const imagePreview = document.getElementById("imagePreview");

  imageInput.addEventListener("change", function () {
    const newImage = this.files[0];
    const imageURL = URL.createObjectURL(newImage);
    imagePreview.src = imageURL;
  });
}

// Add an event listener to handle form submission
document.addEventListener("DOMContentLoaded", () => {
  const isEditBrandPage = document.getElementById("editBrandForm") !== null;

  if (isEditBrandPage) {
    fetchBrandDetailsForEdit(sr_no); // Assuming sr_no is defined
    handleImageChange();
  }
});

// Function to get query parameter from URL
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Add an event listener for clicks on the document
document.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("view-brand")) {
    const sr_no = target.getAttribute("data-sr-no");
    viewBrandDetails(sr_no); // Use sr_no as the identifier
  } else if (target.classList.contains("edit-brand")) {
    const sr_no = target.getAttribute("data-sr-no");
    editBrand(sr_no); // Use sr_no as the identifier
  } else if (target.classList.contains("delete-brand")) {
    const brandName = target.getAttribute("data-brand-name");
    deleteBrand(brandName);
  }
});

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

//search with onkeyup
document.addEventListener("DOMContentLoaded", function () {
  // Get references to the input fields
  const brandNameInput = document.getElementById("brandNameInput");
  const startDateInput = document.getElementById("brandStartDateInput");
  const endDateInput = document.getElementById("brandEndDateInput");

  // Attach an event listener to each input field for the 'keyup' event
  brandNameInput.addEventListener("input", handleSearch);
  startDateInput.addEventListener("change", handleSearch);
  endDateInput.addEventListener("change", handleSearch);

  async function fetchBrands(
    brand_name,
    start_date,
    end_date,
    method = "POST"
  ) {
    try {
      // Create a new FormData object to construct the request body

      const fromDate1 = start_date || "";
      const keyword1 = brand_name || "";
      const toDate1 = end_date || "";
      // Create a new FormData object to construct the request body
      const formData = {
        brand_name: keyword1,
        start_date: fromDate1,
        end_date: toDate1,
      };

      // Construct the API URL
      const apiUrl = `${BASE_URL}/GetSearchedBrand/`;

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
          const brandTableBody = document.querySelector("#brandTable");
          brandTableBody.innerHTML = "";

          responseData.Response.forEach((brand, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${brand.brand_name}</td>
                            <td><img src="${
                              brand.brand_Image
                            }" alt="Brand Image" class="i4"></td>
                            <td class="startDate">${new Date(
                              brand.formatted_created_datetime
                            ).toLocaleString()}</td>
                            <td>
                            <i class="fa-solid fa-eye view-brand" data-sr-no="${brand.sr_no}"></i> 
                            <i class="fa-regular fa-pen-to-square edit-brand" data-sr-no="${brand.sr_no}"></i>
                            <i class="fa-solid fa-trash delete-brand" data-brand-name="${ brand.sr_no}"></i>                            </td>
                        `;
            // console.log(brand);
            brandTableBody.appendChild(row);
          });
        } else {
          console.error("No results found or invalid response structure");
        }
      } else {
        console.error("Failed to fetch brands:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  }
  function handleSearch() {
    const brandName = brandNameInput.value;
    const startDate = formatDateToYYYYMMDD(startDateInput.value);
    const endDate = formatDateToYYYYMMDD(endDateInput.value);
    fetchBrands(brandName, startDate, endDate, "POST");
  }
});

function showSuccessPopup() {
  var popup = document.getElementById("successPopup");
  popup.style.display = "block";
  setTimeout(function () {
    popup.style.display = "none"; 
  }, 2000);
}
