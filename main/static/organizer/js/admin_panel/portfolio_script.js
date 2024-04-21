const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';


// const BASE_URL = 'http://127.0.0.1:8000/app'

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

document.addEventListener("DOMContentLoaded", () => {
  // Check if the current page is the portfolio list page
  const isPortfolioListPage =
    document.getElementById("portfolioTable") !== null;

  if (isPortfolioListPage) {
    // Fetch and display the list of portfolios
    fetchPortfoliosFromAPI();
  } else {
    // Get the current page URL
    const currentPageURL = window.location.pathname;

    // Check if it's the view or edit portfolio page
    if (currentPageURL.includes("/view_portfolio/")) {
      // Fetch and populate portfolio details in the view page
      const sr_no = document.getElementById("sr_no").innerText;
      if (sr_no) {
        fetchPortfolioDetails(sr_no);
      } else {
        console.error("No sr_no found in the query parameter.");
      }
    } else if (currentPageURL.includes("/edit_portfolio/")) {
      // Fetch and populate portfolio details in the edit form
      const sr_no = document.getElementById("sr_no").innerText;
      if (sr_no) {
        fetchPortfolioDetailsForEdit(sr_no);

        // Call the function to populate the category dropdown after the form is loaded
        fetchPortfolioCategoriesAndPopulateDropdown();
      } else {
        console.error("No sr_no found in the query parameter.");
      }
    }
  }
});



let itemsPerPage = 10; // Set the number of items per page
let currentPage = 1; // Track the current page number
let totalPageCount = 1; // Track the total number of pages
let apiUrl = `${BASE_URL}/Get_All_Portfolio/?page=${currentPage}&page_size=${itemsPerPage}`;

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
        apiUrl = `${BASE_URL}/Get_All_Portfolio/?page=${currentPage}&page_size=${itemsPerPage}`;
        fetchPortfoliosFromAPI(apiUrl);
      }
    });
    pageNumbersContainer.appendChild(pageBtn);
  }
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPageCount;
}

// Function to fetch data from the GET API for portfolios
async function fetchPortfoliosFromAPI(url) {
  try {
    const response = await fetch(url, {
      headers: headers,
    });
    const data = await response.json();

    if (response.ok) {
      const portfolioTableBody = document.querySelector('#portfolioTable');
      portfolioTableBody.innerHTML = ''; // Clear existing data
      const startingSrNo = (currentPage - 1) * itemsPerPage + 1;

      data.Response.results.forEach((portfolio, index) => {
        const row = document.createElement('tr');
        row.setAttribute('class', 'datarow');
        row.dataset.portfolioName = portfolio.Portfolio_Name;
        row.innerHTML = `
          <td>${startingSrNo + index}</td>
          <td>${portfolio.Portfolio_Name}</td>
          <td>${portfolio.Portfolio_Category ? portfolio.Portfolio_Category.Category_name : 'N/A'}</td>
          <td><img src="${portfolio.Portfolio_Image}" alt="Portfolio Image" class="i4"></td>
          <td>${new Date(portfolio.formatted_created_datetime).toLocaleString()}</td>
          <td>
            <i class="fa-solid fa-eye view-portfolio" data-sr-no="${portfolio.sr_no}"></i>
            <i class="fa-regular fa-pen-to-square edit-portfolio" data-portfolio-id="${portfolio.sr_no}"></i>
            <i class="fa-solid fa-trash delete-portfolio" data-portfolio-name="${portfolio.Portfolio_Name}"></i>
          </td>`;
        portfolioTableBody.appendChild(row);
      });

      totalPageCount = data.total_pages;
      updatePaginationControls();

      // Update the "next" and "previous" links if available
      nextBtn.dataset.nextUrl = data.Response.next ? data.Response.next : '';
      prevBtn.dataset.prevUrl = data.Response.previous ? data.Response.previous : '';
    } else {
      console.error('Failed to fetch portfolios:', data.message);
    }
  } catch (error) {
    console.error('Error fetching portfolios:', error);
  }
}

// Event listener for the "next" button
nextBtn.addEventListener('click', () => {
  if (currentPage < totalPageCount) {
    currentPage++; // Increment the current page number
    apiUrl = `${BASE_URL}/Get_All_Portfolio/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchPortfoliosFromAPI(apiUrl); // Fetch and render data for the next page
  }
});

// Event listener for the "previous" button
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--; // Decrement the current page number
    apiUrl = `${BASE_URL}/Get_All_Portfolio/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchPortfoliosFromAPI(apiUrl); // Fetch and render data for the previous page
  }
});

// Event listener for the number of rows selection
numberofrows.addEventListener('change', () => {
  const selectedValue = numberofrows.value;
  if (selectedValue === 'all') {
    itemsPerPage = totalPageCount * 10; // Set itemsPerPage to total count of portfolios
  } else {
    itemsPerPage = parseInt(selectedValue);
  }
  currentPage = 1; // Reset current page to 1 when changing the number of items per page
  apiUrl = `${BASE_URL}/Get_All_Portfolio/?page=${currentPage}&page_size=${itemsPerPage}`;
  fetchPortfoliosFromAPI(apiUrl); // Fetch and render data with the updated itemsPerPage
});

// Initial fetch to load the first page
fetchPortfoliosFromAPI(apiUrl);





// Function to handle viewing the portfolio details
function viewPortfolioDetails(sr_no) {
  // Redirect the user to the portfolio_details.html page with the sr_no as a query parameter
  window.location.href = `/view_portfolio/${sr_no}`;
}

// Function to handle editing the portfolio
function editPortfolio(sr_no) {
  window.location.href = `/edit_portfolio/${sr_no}`;
  // Implement the code to open an edit form or modal, pre-fill with portfolio data, and update the portfolio on save
}

// Function to handle deleting the portfolio
async function deletePortfolio(portfolioName) {
  const row = document.querySelector(
    `[data-portfolio-name="${portfolioName}"]`
  );
  if (!row) return;

  try {
    const sr_no = row.querySelector("[data-sr-no]").getAttribute("data-sr-no");
    // Make an API request to delete the portfolio based on sr_no
    const deletePortfolioResponse = await fetch(
      `${BASE_URL}/delete_portfolio/${sr_no}/`,
      {
        method: "DELETE",
        headers: headers,
      }
    );

    if (!deletePortfolioResponse.ok) {
      throw new Error("Failed to delete the portfolio");
    }

    // Remove the row from the table to reflect the portfolio is deleted
    row.remove();
  } catch (error) {
    console.error(`Error deleting the portfolio: ${error.message}`);
  }
}

// Function to fetch and populate portfolio details in the view page
async function fetchPortfolioDetails(sr_no) {
  try {
    const response = await fetch(
      `${BASE_URL}/Get_Perticular_Portfolio/${sr_no}/`,{
        headers:headers,
      });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const responseData = await response.json();
    const portfolioDetails = responseData.Response; // Access the nested Response object

    // Populate the view page with portfolio details
    const portfolioDetailsContainer =
      document.getElementById("portfolioDetails");
    portfolioDetailsContainer.innerHTML = `
    <img src="${portfolioDetails.Portfolio_Image}" alt="Portfolio Image" style="width:20%">
    <h1 class="view_details mt-3">Portfolio Name : ${portfolioDetails.Portfolio_Name}</h1>
    <p class="view_details">Category : ${portfolioDetails.Portfolio_Category.Category_name}</p>
    <p class="view_details">Portfolio Type : ${portfolioDetails.Portfolio_Category.type}</p>
    
    
    <p class="view_details">Created Date/Time: ${portfolioDetails.formatted_created_datetime}</p>
    <!-- Add more details here as needed -->
    `;
  } catch (error) {
    console.error(`Error fetching portfolio details: ${error.message}`);
  }
}

// Function to fetch and populate portfolio details in the edit form

// Function to fetch portfolio categories from the API and populate the dropdown
async function fetchPortfolioCategoriesAndPopulateDropdown() {
  try {
    const response = await fetch(
      `${BASE_URL}/get_portfolio_category/`,{
        headers:headers,
      });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    // console.log("Fetched category data:", data);

    // Create a reference to the category select element
    const categorySelect = document.getElementById("Portfolio_Category");

    // Clear any existing options
    categorySelect.innerHTML = "";

    // Populate the dropdown with fetched categories
    data.Response.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.sr_no; // Use sr_no as the value
      option.text = category.Category_name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error(
      `Error fetching portfolio categories. Status: ${
        error.response.status
      }, Response: ${await error.response.text()}`
    );
    console.error(`Error fetching portfolio categories: ${error.message}`);
  }
}

// Function to fetch portfolio details for editing
// async function fetchPortfolioDetailsForEdit(sr_no) {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/Get_Perticular_Portfolio/${sr_no}/`,{
//         headers:headers,
//       });
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     const data = await response.json();
//     const portfolioData = data.Response;

//     // Create a reference to the editPortfolioForm
//     const editPortfolioForm = document.getElementById("editPortfolioForm");
//     // Clear any existing content in the form
//     editPortfolioForm.innerHTML = "";

//     // Define the fields and labels
//     // Modify the fields array to specify which fields should be editable
//     const fields = [
//       { key: "sr_no", label: "SR No", readOnly: true },
//       { key: "Portfolio_Name", label: "Portfolio Name", readOnly: false },
//       { key: "Portfolio_Image", label: "Portfolio Image", readOnly: false }, // Set to false for editing
//       {
//         key: "formatted_created_datetime",
//         label: "Created Date/Time",
//         readOnly: true,
//       },
//       { key: "Portfolio_Category.sr_no", label: "Category", readOnly: false }, // Allow editing
//     ];

//     // Iterate over the fields and create form elements
//     fields.forEach((field) => {
//       // Create label element
//       const label = document.createElement("label");
//       label.textContent = field.label;

//       // Create input element
//       const input = document.createElement("input");
//       input.type = "text";
//       input.id = field.key; // Use the key as the input ID
//       input.name = field.key;
//       input.value = getFieldFromNestedObject(portfolioData, field.key); // Get the value using the key
//       input.className = "inputbox";

//       // Set the input's readOnly attribute
//       input.readOnly = field.readOnly;

//       // Special handling for the "Portfolio_Image" field
//       if (field.key === "Portfolio_Image") {
//         // Create an image element to display the current image
//         const image = document.createElement("img");
//         image.src = input.value;
//         image.alt = "Portfolio Image";
//         image.className = "img-fluid"; // Apply Bootstrap class for responsive images
//         image.style.width = "20%";
//         image.style.padding = "2%";

//         // Create an input element for changing the image
//         const imageInput = document.createElement("input");
//         imageInput.type = "file";
//         imageInput.id = "Portfolio_Image";
//         imageInput.name = "Portfolio_Image";
//         imageInput.style.color = "#fff";

//         // Add an event listener to handle changes to the input field
//         imageInput.addEventListener("change", function () {
//           const newImage = this.files[0];
//           const imageURL = URL.createObjectURL(newImage);
//           image.src = imageURL;
//         });

//         // Append the label, image, input, and line breaks to the form
//         editPortfolioForm.appendChild(label);

//         editPortfolioForm.appendChild(image);
//         editPortfolioForm.appendChild(imageInput);
//         editPortfolioForm.appendChild(document.createElement("br"));
//       } else if (field.key === "Portfolio_Category.sr_no") {
//         // Create a select element for the category dropdown
//         const categorySelect = document.createElement("select");
//         categorySelect.id = "Portfolio_Category";
//         categorySelect.name = "Portfolio_Category";
//         categorySelect.style.backgroundColor = "white";

//         // Add an option to select the current category
//         const currentCategory = getFieldFromNestedObject(
//           portfolioData,
//           field.key
//         );
//         const currentCategoryName = getFieldFromNestedObject(
//           portfolioData,
//           "Portfolio_Category.Category_name"
//         );
//         const option = document.createElement("option");
//         option.value = currentCategory;
//         option.text = currentCategoryName;
//         option.style.backgroundColor = "white";
//         categorySelect.appendChild(option);

//         // Populate the dropdown with category options
//         fetchPortfolioCategoriesAndPopulateDropdown();

//         // Append the category select to the form
//         editPortfolioForm.appendChild(label);
//         editPortfolioForm.appendChild(document.createElement("br"));
//         editPortfolioForm.appendChild(categorySelect);
//         editPortfolioForm.appendChild(document.createElement("br"));
//       } else {
//         // Append the label, input, and line breaks to the form
//         editPortfolioForm.appendChild(label);
//         editPortfolioForm.appendChild(document.createElement("br"));
//         editPortfolioForm.appendChild(input);
//         editPortfolioForm.appendChild(document.createElement("br"));
//       }
//     });

//     // Create a button for submitting the form
//     // const submitButton = document.createElement("button");
//     // submitButton.textContent = "Save Changes";
//     // submitButton.type = "button";
//     // submitButton.id = "saveButton";
//     // submitButton.className = "btn bg-white border-dark m-1";

//     // Add an event listener to handle form submission
//     const submitButton=document.getElementById('submitButton')
//     submitButton.addEventListener("click", function () {
//       submitPortfolioForm(sr_no, portfolioData); // Pass portfolioData as a parameter
//     });

//     // Append the submit button to the form
//     editPortfolioForm.appendChild(submitButton);
//   } catch (error) {
//     console.error(
//       `Error fetching portfolio details for edit: ${error.message}`
//     );
//   }
// }


async function fetchPortfolioDetailsForEdit(sr_no) {
  try {
      const response = await fetch(
          `${BASE_URL}/Get_Perticular_Portfolio/${sr_no}/`,
          {
              headers: headers,
          }
      );
      if (!response.ok) {
          throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const portfolioData = data.Response;

      // Create a reference to the editPortfolioForm
      const editPortfolioForm = document.getElementById("editPortfolioForm");

      // Clear any existing content in the form
      editPortfolioForm.innerHTML = "";

      // Define the fields and labels
      const fields = [
          { key: "sr_no", label: "SR No", readOnly: true },
          { key: "Portfolio_Name", label: "Portfolio Name", readOnly: false },
          { key: "Portfolio_Image", label: "Portfolio Image", readOnly: false },
          {
              key: "formatted_created_datetime",
              label: "Created Date/Time",
              readOnly: true,
          },
          {
              key: "Portfolio_Category.sr_no",
              label: "Category",
              readOnly: false,
          },
      ];

      // Iterate over the fields and create form elements
      fields.forEach((field) => {
          // Create label element
          const label = document.createElement("label");
          label.textContent = field.label;

          // Create input element
          const input = document.createElement("input");
          input.type = "text";
          input.id = field.key;
          input.name = field.key;
          input.value = getFieldFromNestedObject(portfolioData, field.key);
          input.className = "inputbox";
          input.style.marginTop="1%"
          input.style.marginBottom="1%"

          // Set the input's readOnly attribute
          input.readOnly = field.readOnly;

          // Special handling for the "Portfolio_Image" field
          if (field.key === "Portfolio_Image") {
              // Create an image element to display the current image
              const image = document.createElement("img");
              image.src = input.value;
              image.alt = "Portfolio Image";
              image.className = "img-fluid"; // Apply Bootstrap class for responsive images
              image.style.width = "20%";
              image.style.padding = "2%";

              // Create an input element for changing the image
              const imageInput = document.createElement("input");
              imageInput.type = "file";
              imageInput.id = "Portfolio_Image";
              imageInput.name = "Portfolio_Image";
              imageInput.style.color = "#fff";

              // Add an event listener to handle changes to the input field
              imageInput.addEventListener("change", function () {
                  const newImage = this.files[0];
                  const imageURL = URL.createObjectURL(newImage);
                  image.src = imageURL;
              });

              // Append the label, image, input, and line breaks to the form
              editPortfolioForm.appendChild(label);
              editPortfolioForm.appendChild(image);
              editPortfolioForm.appendChild(imageInput);
              editPortfolioForm.appendChild(document.createElement("br"));
          } else if (field.key === "Portfolio_Category.sr_no") {
              // Create a select element for the category dropdown
              const categorySelect = document.createElement("select");
              categorySelect.id = "Portfolio_Category";
              categorySelect.name = "Portfolio_Category";
              categorySelect.style.backgroundColor = "white";
              categorySelect.style.marginTop="1%"
              categorySelect.style.marginBottom="1%"

              // Add an option to select the current category
              const currentCategory = getFieldFromNestedObject(
                  portfolioData,
                  field.key
              );
              const currentCategoryName = getFieldFromNestedObject(
                  portfolioData,
                  "Portfolio_Category.Category_name"
              );
              const option = document.createElement("option");
              option.value = currentCategory;
              option.text = currentCategoryName;
              option.style.background="white";
              categorySelect.appendChild(option);
              

              // Populate the dropdown with category options
              fetchPortfolioCategoriesAndPopulateDropdown();

              // Append the category select to the form
              editPortfolioForm.appendChild(label);
              // editPortfolioForm.appendChild(document.createElement("br"));
              editPortfolioForm.appendChild(categorySelect);
              editPortfolioForm.appendChild(document.createElement("br"));
          } else {
              // Append the label, input, and line breaks to the form
              editPortfolioForm.appendChild(label);
              // editPortfolioForm.appendChild(document.createElement("br"));
              editPortfolioForm.appendChild(input);
              editPortfolioForm.appendChild(document.createElement("br"));
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

      

      // Add an event listener to handle form submission
      submitButton.addEventListener("click", function () {
          submitPortfolioForm(sr_no, portfolioData);
      });

      // Append the submit button to the form
      editPortfolioForm.appendChild(goback)
      editPortfolioForm.appendChild(submitButton);
  } catch (error) {
      console.error(`Error fetching portfolio details for edit: ${error.message}`);
  }
}

// Function to get a field from a nested object using dot notation
function getFieldFromNestedObject(object, field) {
  const fieldKeys = field.split(".");
  return fieldKeys.reduce(
    (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : ""),
    object
  );
}


async function submitPortfolioForm(sr_no, portfolioData) {
  try {
  const editPortfolioForm = document.getElementById('editPortfolioForm');
  const formData = new FormData(editPortfolioForm);
  
  
  // Dynamically find the file input field for "Portfolio_Image"
  const portfolioImageInput = editPortfolioForm.querySelector('#Portfolio_Image');
  
  
  // Ensure that the "Portfolio_Image" field is included in the form data
  // if a file has been selected
  if (portfolioImageInput.files.length > 0) {
  formData.set('Portfolio_Image', portfolioImageInput.files[0]);
  } else {
  // Remove the "Portfolio_Image" field if no file is selected
  formData.delete('Portfolio_Image');
  }
  
  
  // Add the Portfolio_Category_id to the form data
  const category = getFieldFromNestedObject(portfolioData, 'Portfolio_Category.sr_no');
  formData.set('Portfolio_Category_id', category);
  
  
  const categoryExists = await checkCategoryExists(category);
  
  
  if (!categoryExists) {
  // Display an error message to the user
  const errorElement = document.getElementById('categoryError');
  errorElement.textContent = 'Category not found. Please select a valid category.';
  return; // Prevent further processing
  } else {
  // Clear any previous error messages
  const errorElement = document.getElementById('categoryError');
  errorElement.textContent = '';
  }
  
  
  // Make an API request to update the portfolio details
  const response = await fetch(`${BASE_URL}/update_Portfolio/${sr_no}/`, {
  method: 'PUT',
  body: formData,
  headers:{  
    Authorization: `Bearer ${TOKEN}`,
  } // Use the FormData object for file upload and other data
  });
  
  
  if (response.ok) {
    window.location.href = `/portfolio_manage`;
    // showSuccessPopup()
    // setTimeout(function () {
    //     window.location.href = `/portfolio_manage`;
    //   }, 2000);
  // alert('Portfolio details updated successfully.');
  // Redirect to the home page or handle success as needed
  } else {
  // Handle the error, e.g., display an error message
  const errorElement = document.getElementById('updateError');
  errorElement.textContent = 'Failed to update portfolio details. Please try again.';
  throw new Error('Failed to update portfolio details.');
  }
  } catch (error) {
  console.error(`Error submitting portfolio form: ${error.message}`);
  }
  }


async function checkCategoryExists(Category_id) {
  try {
    const response = await fetch(
      `${BASE_URL}/get_portfolio_category/`,{
        headers:headers,
      });
    if (response.ok) {
      const data = await response.json();
      // console.log(data);
      // Check if the specified Category_id exists in the Response array

      const categoryExists = data.Response.some(
        (category) => category.sr_no === Category_id
      );
      return categoryExists;
    } else {
      throw new Error("Failed to check category existence.");
    }
  } catch (error) {
    console.error(`Error checking category existence: ${error.message}`);
    // You can return an error message or handle the error case as needed
    return false; // For example, return false when the category is not found
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Check if the current page is the portfolio list page
  const isPortfolioListPage =
    document.getElementById("portfolioTable") !== null;

  if (isPortfolioListPage) {
    // Fetch and display the list of portfolios
    fetchPortfoliosFromAPI(apiUrl);
  } else {
    // Get the current page URL
    const currentPageURL = window.location.pathname;

    // Check if it's the view or edit portfolio page
    if (currentPageURL.includes("/view_portfolio/")) {
      // Fetch and populate portfolio details in the view page
      const sr_no = document.getElementById("sr_no").innerText;
      if (sr_no) {
        fetchPortfolioDetails(sr_no);
      } else {
        console.error("No sr_no found in the query parameter.");
      }
    } else if (currentPageURL.includes("/edit_portfolio/")) {
      // Fetch and populate portfolio details in the edit form
      const sr_no = document.getElementById("sr_no").innerText;
      if (sr_no) {
        fetchPortfolioDetailsForEdit(sr_no);
        // Call the function to populate the category dropdown
        fetchPortfolioCategoriesAndPopulateDropdown();
      } else {
        console.error("No sr_no found in the query parameter.");
      }
    }
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

  if (target.classList.contains("view-portfolio")) {
    const sr_no = target.getAttribute("data-sr-no");
    viewPortfolioDetails(sr_no);
  } else if (target.classList.contains("edit-portfolio")) {
    const portfolioID = target.getAttribute("data-portfolio-id");
    editPortfolio(portfolioID);
  } else if (target.classList.contains("delete-portfolio")) {
    const portfolioName = target.getAttribute("data-portfolio-name");
    deletePortfolio(portfolioName);
  }
});




function formatDateToYYYYMMDD(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
  return null; // Invalid date
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
  }
  
  
  document.addEventListener('DOMContentLoaded', function () {
  // Get references to the input fields

  const portfolioNameInputs = document.getElementById('portfolioNameInput');
  const startDateInputs = document.getElementById('portfolioStartDateInput');
  const endDateInputs = document.getElementById('portfolioEndDateInput');

  portfolioNameInputs.addEventListener('input', handleSearch);
  startDateInputs.addEventListener('change', handleSearch);
  endDateInputs.addEventListener('change', handleSearch);

  function handleSearch() {
    const portfolioName = portfolioNameInputs.value;
    const portfolioStartDate = formatDateToYYYYMMDD(startDateInputs.value);
    const portfolioEndDate = formatDateToYYYYMMDD(endDateInputs.value);
    fetchServices(portfolioName, portfolioStartDate, portfolioEndDate, "POST");
  }
});

async function fetchServices(
  portfolioName,
  portfolioStartDate,
  portfolioEndDate,
  method="POST"
){
  try{
    const keyword1 = portfolioName || "";
      const fromDate1 = portfolioStartDate || "";
      const toDate1 = portfolioEndDate || "";

      const formData = {
        Portfolio_Name : keyword1,
        start_date : fromDate1,
        end_date : toDate1
      }
      const apiUrl = `${BASE_URL}/GetUniquePortfolio/`;
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
        ){
          const portfolioTableBody = document.querySelector("#portfolioTable");
          portfolioTableBody.innerHTML = ""
          responseData.Response.forEach((portfolio, index)=>{
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${index + 1}</td>
              <td>${portfolio.Portfolio_Name}</td>
              <td>${portfolio.Portfolio_Category.Category_name}</td>
              <td><img src="${portfolio.Portfolio_Image}" alt="Portfolio Image" class="i4"></td>
              <td class="startDate">${new Date(portfolio.formatted_created_datetime).toLocaleString()}</td>
              <td>
              <i class="fa-solid fa-eye view-portfolio" data-sr-no="${portfolio.sr_no}"></i>
              <i class="fa-regular fa-pen-to-square edit-portfolio" data-portfolio-id="${portfolio.sr_no}"></i>
              <i class="fa-solid fa-trash delete-portfolio" data-portfolio-name="${portfolio.Portfolio_Name}"></i>  </td>
            `;
            portfolioTableBody.appendChild(row)
          })
        }else {
          console.error("No results found or invalid response structure");
        }
      } else {
        console.error("Failed to fetch portfolio:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  }
  // // Function to handle the search when any input field changes
  // function handleSearch() {
  // // Initialize empty values for portfolioName, startDate, and endDate
  // let portfolioName = '';
  // let startDate = '';
  // let endDate = '';
  
  
  // // Loop through the input collections and update values
  // portfolioNameInputs.forEach(input => {
  // if (input.classList.contains('i2')) {
  // portfolioName = input.value;
  // }
  // });
  
  
  // startDateInputs.forEach(input => {
  // if (input.classList.contains('i3')) {
  // startDate = input.value;
  // startDate= formatDateToYYYYMMDD(startDate)
  // }
  // });
  
  
  // endDateInputs.forEach(input => {
  // if (input.classList.contains('i3')) {
  // endDate = input.value;
  // endDate= formatDateToYYYYMMDD(endDate)
  // }
  // });
  
  
  // if (!portfolioName) {
  // console.error('Invalid input values. Make sure all fields are filled.');
  // return;
  // }
  
  
  // // Call the fetchPortfolios function with 'POST' method
  // fetchPortfolios(portfolioName, startDate, endDate, 'POST');
  // }
  // });


  

//function to display dialog box
  function showSuccessPopup() {
    var popup = document.getElementById("successPopup");
    popup.style.display = "block";
    setTimeout(function () {
      popup.style.display = "none"; 
    }, 2000);
  }
  




  // async function fetchPortfolios(portfolioName, startDate, endDate, method = 'POST') {
  //   try {
  //   // Create a new FormData object to construct the request body
  //   const keyword1 = portfolioName || "";
  //   const fromDate1 = startDate || "";
  //   const toDate1 = endDate || "";
  //   const formData = {
  //   "Portfolio_Name" : keyword1,
  //   "start_date" : fromDate1,
  //   "end_date" : toDate1,
  //   }
    
  //   const apiUrl = `${BASE_URL}/GetUniquePortfolio/`; // Replace with your API URL
    
    
  //   const response = await fetch(apiUrl, {
  //   method: 'POST',
  //   body: JSON.stringify(formData),
  //   headers:headers// Use the FormData object as the request body
  //   });
  //   // console.log(response);
    
    
  //   // Check if the response status is OK (200)
  //   if (response.status === 200) {
  //   const responseData = await response.json();
    
    
  //   if (responseData && responseData.Response && Array.isArray(responseData.Response)) {
  //   const portfolioTableBody = document.querySelector('#portfolioTable');
  //   portfolioTableBody.innerHTML = ''; // Clear existing data
    
    
  //   responseData.Response.forEach((portfolio, index) => {
  //   // Check if the portfolio creation date is within the specified date range
  //   if (!startDate || (portfolio.formatted_created_datetime >= startDate && portfolio.formatted_created_datetime <= endDate)) {
  //   const row = document.createElement('tr');
  //   row.innerHTML = `
  //   <td>${index + 1}</td>
  //   <td>${portfolio.Portfolio_Name}</td>
  //   <td>${portfolio.Portfolio_Category.Category_name}</td>
  //   <td><img src="${portfolio.Portfolio_Image}" alt="Portfolio Image" class="i4"></td>
  //   <td class="startDate">${new Date(portfolio.formatted_created_datetime).toLocaleString()}</td>
  //   <td>
  //   <i class="fa-solid fa-eye view-portfolio" data-sr-no="${portfolio.sr_no}"></i>
  //                       <i class="fa-regular fa-pen-to-square edit-portfolio" data-portfolio-id="${portfolio.sr_no}"></i>
  //                       <i class="fa-solid fa-trash delete-portfolio" data-portfolio-name="${portfolio.Portfolio_Name}"></i>  </td>
  //   `;
  //   portfolioTableBody.appendChild(row);
  //   }
  //   });
  //   } else {
  //   console.error('No results found or invalid response structure');
  //   }
  //   } else {
  //   console.error('Failed to fetch portfolios:', response.statusText);
  //   }
  //   } catch (error) {
  //   console.error('Error fetching portfolios:', error);
  //   }
  //   }
    