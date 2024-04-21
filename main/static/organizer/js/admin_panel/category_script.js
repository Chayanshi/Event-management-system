const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';

// const BASE_URL = 'http://127.0.0.1:8000/app'


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


document.addEventListener('DOMContentLoaded', () => {
    // Check if the current page is the category list page
    const isCategoryListPage = document.getElementById('categoryTable') !== null;

    if (isCategoryListPage) {
        // Fetch and display the list of categories
        fetchCategoriesFromAPI();
    } else {
        // Get the current page URL
        const currentPageURL = window.location.pathname;

        // Check if it's the view or edit category page
        if (currentPageURL.includes('/view_category/')) {
            // Fetch and populate category details in the view page
            const sr_no = document.getElementById('sr_no').innerText;
            if (sr_no) {
                fetchCategoryDetails(sr_no);
            } else {
                // console.error('No sr_no found in the query parameter.');
            }
        } else if (currentPageURL.includes('/edit_category/')) {
            // Fetch and populate category details in the edit form
            const sr_no = document.getElementById('sr_no').innerText;
            if (sr_no) {
                fetchCategoryDetailsForEdit(sr_no);
            } else {
                // console.error('No sr_no found in the query parameter.');
            }
        }
    }
});





let itemsPerPage = 10; // Set the number of items per page
let currentPage = 1; // Track the current page number
let totalPageCount = 1; // Track the total number of pages
let apiUrl = `${BASE_URL}/get_all_category/?page=${currentPage}&page_size=${itemsPerPage}`;

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
        apiUrl = `${BASE_URL}/get_all_category/?page=${currentPage}&page_size=${itemsPerPage}`;
        fetchCategoriesFromAPI(apiUrl);
      }
    });
    pageNumbersContainer.appendChild(pageBtn);
  }
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPageCount;
}

// Function to fetch data from the GET API for categories
async function fetchCategoriesFromAPI(url) {
  try {
    const response = await fetch(url, {
      headers: headers,
    });
    const data = await response.json();

    if (response.ok) {
      const categoryTableBody = document.querySelector('#categoryTable');
      categoryTableBody.innerHTML = ''; // Clear existing data
      const startingSrNo = (currentPage - 1) * itemsPerPage + 1;

      data.Response.results.forEach((category, index) => {
        const row = document.createElement('tr');
        row.dataset.categoryName = category.Category_name;
        row.innerHTML = `
          <td>${startingSrNo + index}</td>
          <td>${category.Category_name}</td>
          <td>${category.type}</td>
          <td>${category.formatted_created_datetime}</td>
          <td>
            <i class="fa-solid fa-eye view-category" data-sr-no="${category.sr_no}"></i>
            <i class="fa-regular fa-pen-to-square edit-category" data-category-id="${category.sr_no}"></i>
            <i class="fa-solid fa-trash delete-category" data-category-name="${category.Category_name}"></i>
          </td>`;
        categoryTableBody.appendChild(row);
      });

      totalPageCount = data.total_pages;
      updatePaginationControls();

      // Update the "next" and "previous" links if available
      nextBtn.dataset.nextUrl = data.Response.next ? data.Response.next : '';
      prevBtn.dataset.prevUrl = data.Response.previous ? data.Response.previous : '';
    } else {
      console.error('Failed to fetch categories:', data.message);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

// Event listener for the "next" button
nextBtn.addEventListener('click', () => {
  if (currentPage < totalPageCount) {
    currentPage++; // Increment the current page number
    apiUrl = `${BASE_URL}/get_all_category/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchCategoriesFromAPI(apiUrl); // Fetch and render data for the next page
  }
});

// Event listener for the "previous" button
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--; // Decrement the current page number
    apiUrl = `${BASE_URL}/get_all_category/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchCategoriesFromAPI(apiUrl); // Fetch and render data for the previous page
  }
});

// Event listener for the number of rows selection
numberofrows.addEventListener('change', () => {
  const selectedValue = numberofrows.value;
  if (selectedValue === 'all') {
    itemsPerPage = totalPageCount * 10; // Set itemsPerPage to total count of categories
  } else {
    itemsPerPage = parseInt(selectedValue);
  }
  currentPage = 1; // Reset current page to 1 when changing the number of items per page
  apiUrl = `${BASE_URL}/get_all_category/?page=${currentPage}&page_size=${itemsPerPage}`;
  fetchCategoriesFromAPI(apiUrl); // Fetch and render data with the updated itemsPerPage
});

// Initial fetch to load the first page
fetchCategoriesFromAPI(apiUrl);






// Function to handle viewing the category details
function viewCategoryDetails(sr_no) {
    // Redirect the user to the view_category.html page with the sr_no as a query parameter
    window.location.href = `view_category/${sr_no}`;
}

// Function to handle editing the category
function editCategory(sr_no) {
    window.location.href = `edit_category/${sr_no}`;
    // Implement the code to open an edit form or modal, pre-fill with category data, and update the category on save
}

// Function to handle deleting the category
async function deleteCategory(categoryName) {
    const row = document.querySelector(`[data-category-name="${categoryName}"]`);
    if (!row) return;

    try {
        const sr_no = row.querySelector('[data-sr-no]').getAttribute('data-sr-no');
        // Make an API request to delete the category based on sr_no
        const deleteCategoryResponse = await fetch(`${BASE_URL}/delete_category/${sr_no}/`, {
            method: 'DELETE',
            headers: headers,
        });

        if (!deleteCategoryResponse.ok) {
            throw new Error('Failed to delete the category');
        }

        // Remove the row from the table to reflect the category is deleted
        row.remove();
    } catch (error) {
        // console.error(`Error deleting the category: ${error.message}`);
    }
}

// Function to fetch and populate category details in the view page
async function fetchCategoryDetails(sr_no) {
    try {
        const response = await fetch(`${BASE_URL}/get_perticular_category/${sr_no}/`,{
            headers:headers,
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        const categoryDetails = responseData.Response; // Access the nested Response object

        const categoryDetailsContainer = document.getElementById('CategoryDetails');
        const categoryName = document.getElementById('categoryname');
        const createdDateTime = document.getElementById('createdDateTime');
        categoryName.innerText = `${categoryDetails.Category_name}`;
        createdDateTime.innerText =`${categoryDetails.formatted_created_datetime}`;
    } catch (error) {
        // console.error(`Error fetching category details: ${error.message}`);
    }
}


// Function to fetch and populate category details in the edit form
async function fetchCategoryDetailsForEdit(sr_no) {
    try {
        const response = await fetch(`${BASE_URL}/get_perticular_category/${sr_no}/`,{
            headers:headers,
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    
        const data = await response.json();
        console.log('Response data:', data);

        const categoryData = data.Response; 
        console.log('Category data:', categoryData);

        // Define the fields and labels
        // Specify which fields should be editable (Category_name and type)
        const fields = [
            { key: 'sr_no', label: 'SR No', readOnly: true },
            { key: 'Category_name', label: 'Category Name', readOnly: false },
            { key: 'type', label: 'Type', readOnly: false },
        ];

        // Iterate over the fields and create form elements
        fields.forEach((field) => {
            // Create label element
            const label = document.createElement('label');
            label.textContent = field.label;

            // Create input element
            const input = document.createElement('input');
            input.type = 'text';
            input.id = field.key; // Use the key as the input ID
            input.name = field.key;
            input.value = categoryData[field.key]; // Get the value using the key
            input.class = 'inputbox';
            
            // Set the input's readOnly attribute
            input.readOnly = field.readOnly;

            // Append the label, input, and line breaks to the form
            editCategoryForm.appendChild(label);
            // editCategoryForm.appendChild(document.createElement('br'));
            editCategoryForm.appendChild(input);
            editCategoryForm.appendChild(document.createElement('br'));
        });
    } catch (error) {
        // console.error(`Error fetching category details for edit: ${error.message}`);
    }
    const submitButton=document.getElementById('submitButton')
submitButton.addEventListener("click", function () {
    submitCategoryForm(sr_no); // Pass portfolioData as a parameter
  });

}

// Function to submit the category form
async function submitCategoryForm(sr_no) {
    try {
        // console.log("sr no arra hai ", sr_no);
        const editCategoryForm = document.getElementById('editCategoryForm');
        const formData = new FormData(editCategoryForm);

        // Convert form data to a JSON object
        const formDataJson = {};
        formData.forEach((value, key) => {
            formDataJson[key] = value;
        });

        // Make an API request to update the category details
        const response = await fetch(`${BASE_URL}/update_category/${sr_no}/`, {
            method: 'PUT', // Use PUT or the appropriate HTTP method
            body: JSON.stringify(formDataJson), // Convert the form data to JSON
            headers: headers,
        });

        if (response.ok) {
            showSuccessPopup()
        setTimeout(function () {
          window.location.href = `/category_manage`;
      }, 2000);
            // alert('Category details updated successfully.');
        } else {
            const errorElement = document.getElementById('updateError');
            errorElement.textContent = 'Failed to update category details. Please try again.';
            throw new Error('Failed to update category details.');
        }
    } catch (error) {
        // console.error(`Error submitting category form: ${error.message}`);
    }
}




function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Add an event listener for clicks on the document
document.addEventListener('click', async (event) => {
    const target = event.target;

    if (target.classList.contains('view-category')) {
        const sr_no = target.getAttribute('data-sr-no');
        viewCategoryDetails(sr_no);
    } else if (target.classList.contains('edit-category')) {
        const categoryID = target.getAttribute('data-category-id');
        editCategory(categoryID);
    } else if (target.classList.contains('delete-category')) {
        const categoryName = target.getAttribute('data-category-name');
        deleteCategory(categoryName);
    }
});


function formatDateToYYYYMMDD(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return null; // Invalid date
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


//search with onkeyup
document.addEventListener('DOMContentLoaded', function () {
    // Get references to the input fields
    const CategoryNameInput = document.getElementById('CategoryNameInput');
    const CategoryStartDateInput = document.getElementById('CategoryStartDateInput');
    const CategoryEndDateInput = document.getElementById('CategoryEndDateInput');

    // Attach an event listener to each input field for the 'keyup' event
    CategoryNameInput.addEventListener('input', handleCategorySearch);
    CategoryStartDateInput.addEventListener('change', handleCategorySearch);
    CategoryEndDateInput.addEventListener('change', handleCategorySearch);

    async function fetchCategories(Category_name, start_date, end_date, method = 'POST') {
        try {
            // Create a new FormData object to construct the request body
            const keyword1 = Category_name || "";
            const fromDate1 = start_date || "";
            const toDate1 = end_date || "";

            const formData = {
                Category_name : keyword1,
                start_date : fromDate1, 
                end_date : toDate1,
            }
            console.log(formData)

            // Construct the API URL
            const apiUrl = `${BASE_URL}/get_searched_category/`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers:headers,
            });


            // Check if the response status is OK (200)
            if (response.status === 200) {
                const responseData = await response.json();

                if (responseData && responseData.Response && Array.isArray(responseData.Response)) {
                    const categoryTableBody = document.querySelector('#categoryTable');
                    categoryTableBody.innerHTML = '';

                    responseData.Response.forEach((category, index) => {
                        // console.log(category)
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${category.Category_name}</td>
                            <td>${category.type}</td>
                            <td class="startDate">${new Date(category.formatted_created_datetime).toLocaleString()}</td>
                            <td>
                                <i class="fa-solid fa-eye view-category" data-sr-no="${category.sr_no}"></i>
                                <i class="fa-regular fa-pen-to-square edit-category" data-category-id="${category.sr_no}"></i>
                                <i class="fa-solid fa-trash delete-category" data-category-name="${category.Category_name}"></i>                            
                            </td>
                        `;
                        categoryTableBody.appendChild(row);
                    });
                } else {
                    // console.error('No results found or invalid response structure');
                }
            } else {
                // console.error('Failed to fetch categories:', response.statusText);
            }
        } catch (error) {
            // console.error('Error fetching categories:', error);
        }
    }

    // Function to handle the search when any input field changes
    function handleCategorySearch() {
        const CategoryName = CategoryNameInput.value;
        const CategoryStartDate = formatDateToYYYYMMDD(CategoryStartDateInput.value);
        const CategoryEndDate = formatDateToYYYYMMDD(CategoryEndDateInput.value);

        // Call the fetchCategories function with 'POST' method
        fetchCategories(CategoryName, CategoryStartDate, CategoryEndDate, method= 'POST');
    }
});

function showSuccessPopup() {
    var popup = document.getElementById("successPopup");
    popup.style.display = "block";
    setTimeout(function () {
      popup.style.display = "none"; 
    }, 4000);
  }
  
