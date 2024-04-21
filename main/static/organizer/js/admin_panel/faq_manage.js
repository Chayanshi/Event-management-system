
const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = "https://py-infinityadmin.mobiloitte.io/app";
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



// Call the function to fetch and display FAQ details
document.addEventListener('DOMContentLoaded', () => {
    const currentPageURL = window.location.pathname;

    // console.log(currentPageURL)
    if (currentPageURL.includes('/view_faq/')) {
        const sr_no = document.getElementById('sr_no').innerText;
        fetchAndDisplayFAQDetails(sr_no);
    }
    else if(currentPageURL.includes('/faq_manage/')){
        // console.log("current homepage   ")
        fetchFAQs(apiUrl)
    }
});




// let apiUrl = `${BASE_URL}/GetAllFAQView/`;
let itemsPerPage = 10; // Set the number of items per page
let currentPage = 1; // Track the current page number
let totalPageCount = 1; // Track the total number of pages

let apiUrl = `${BASE_URL}/GetAllFAQView/?page=${currentPage}&page_size=${itemsPerPage}`;


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
        apiUrl = `${BASE_URL}/GetAllFAQView/?page=${currentPage}&page_size=${itemsPerPage}`;
        fetchFAQs(apiUrl);
      }
    });
    pageNumbersContainer.appendChild(pageBtn);
  }
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPageCount;
}

// Function to fetch data from the GET API for FAQs
async function fetchFAQs(url) {
  try {
    const response = await fetch(url, {
      headers: headers,
    });
    const data = await response.json();

    if (response.ok) {
      const faqTableBody = document.querySelector('#faqtable');
      faqTableBody.innerHTML = ''; // Clear existing data
      const startingSrNo = (currentPage - 1) * itemsPerPage + 1;

      data.Response.results.forEach((faq, index) => {
        const row = document.createElement('tr');
        row.dataset.faqId = faq.sr_no; // Store FAQ ID in data attribute
        row.innerHTML = `
          <td>${startingSrNo + index}</td>
          <td>${faq.question}</td>
          <td>${faq.answer}</td>
          <td>${new Date(faq.created_at).toLocaleString()}</td>
          <td>
            <i class="fa-solid fa-eye view-faq" data-faq-id="${faq.sr_no}"></i>
            <i class="fa-solid fa-trash delete-faq" data-faq-id="${faq.sr_no}"></i>
          </td>`;
        faqTableBody.appendChild(row);
      });

      totalPageCount = data.total_pages;
      updatePaginationControls();

      // Update the "next" and "previous" links if available
      nextBtn.dataset.nextUrl = data.next ? data.next : '';
      prevBtn.dataset.prevUrl = data.previous ? data.previous : '';
    } else {
      console.error('Failed to fetch FAQs:', data.message);
    }
  } catch (error) {
    console.error('Error fetching FAQs:', error);
  }
}

// Event listener for the "next" button
nextBtn.addEventListener('click', () => {
  if (currentPage < totalPageCount) {
    currentPage++; // Increment the current page number
    apiUrl = `${BASE_URL}/GetAllFAQView/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchFAQs(apiUrl); // Fetch and render data for the next page
  }
});

// Event listener for the "previous" button
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--; // Decrement the current page number
    apiUrl = `${BASE_URL}/GetAllFAQView/?page=${currentPage}&page_size=${itemsPerPage}`;
    fetchFAQs(apiUrl); // Fetch and render data for the previous page
  }
});

// Event listener for the number of rows selection
numberofrows.addEventListener('change', () => {
  const selectedValue = numberofrows.value;
  if (selectedValue === 'all') {
    itemsPerPage = totalPageCount * 10; // Set itemsPerPage to total count of FAQs
  } else {
    itemsPerPage = parseInt(selectedValue);
  }
  currentPage = 1; // Reset current page to 1 when changing the number of items per page
  apiUrl = `${BASE_URL}/GetAllFAQView/?page=${currentPage}&page_size=${itemsPerPage}`;
  fetchFAQs(apiUrl); // Fetch and render data with the updated itemsPerPage
});

// Initial fetch to load the first page
fetchFAQs(apiUrl);


// Function to fetch and display FAQ details
async function fetchAndDisplayFAQDetails(faqId) {
    try {
        // console.log("Sr no is ",sr_no)
        const response = await fetch(`${BASE_URL}/getPerticularFAQ/${faqId}/`, {
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const responseBody = await response.json();

        if (response.ok) {
            const faqDetailsDiv = document.querySelector('#faqDetails');
            const faqData = responseBody.Response; // Access the "Response" property
            faqDetailsDiv.innerHTML = `
               <div"><h3 class="view_details"> <strong style="color:gold; font-size:1.6rem;">Question :</strong> <br> ${faqData.question}</h3> </div>  <br>
                <p class="view_details" style="width:90%"><strong style="color:gold;font-size:1.6rem;">Answer :</strong> <br> ${faqData.answer}</p> <br>
                <p class="view_details"> <strong style="color:gold;font-size:1.6rem;">Created at :</strong> <br>  ${new Date(faqData.created_at).toLocaleString()}</p>
            `;
        } else {
            console.error('Failed to fetch FAQ details:', responseBody.message);
        }
    } catch (error) {
        console.error('Error fetching FAQ details:', error);
    }
}

// Event listener for clicking on FAQ items
document.addEventListener('click', async (event) => {
    const target = event.target;
    const row = target.closest('tr');

    if (target.classList.contains('view-faq')) {
        // Handle viewing the FAQ
        const faqId = row.dataset.faqId; // Get FAQ ID from the data attribute

        try {
            // Redirect to a new HTML page with the FAQ ID as a query parameter
            window.location.href = `view_faq/${faqId}`;

            // Return a promise that resolves when the redirection is complete
            const redirectToFAQDetailsPage = new Promise((resolve) => {
                window.addEventListener('popstate', () => {
                    // This event listener will be triggered when the page changes due to the redirection
                    resolve();
                });
            });

            // Wait for the redirection to complete
            await redirectToFAQDetailsPage;

            // After redirection, fetch and display FAQ details if needed
            fetchAndDisplayFAQDetails(faqId);
        } catch (error) {
            console.error(`Error redirecting to FAQ details page: ${error.message}`);
        }
    } else if (target.classList.contains('delete-faq')) {
        // Handle deleting the FAQ
        const faqId = row.dataset.faqId; // Get FAQ ID from the data attribute
        try {
            const deleteFAQResponse = await fetch(`${BASE_URL}/FAQDelete/${faqId}/`, {
                method: 'DELETE', // Use the appropriate HTTP method for deleting FAQs
                headers: headers,
            });

            if (deleteFAQResponse.ok) {
                row.remove();
                // Refresh the current page after successful deletion
                window.location.reload();
            } else {
                throw new Error("Failed to delete FAQ");
            }
        } catch (error) {
            console.error(`Error deleting the FAQ: ${error.message}`);
        }
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

document.addEventListener('DOMContentLoaded', function () {
    const faqKeywordInput = document.getElementById('faqKeywordInput');
    const faqFromDateInput = document.getElementById('faqFromDateInput');
    const faqToDateInput = document.getElementById('faqToDateInput');
    const statusMessage = document.getElementById('statusMessage'); // Add an element to display status messages

    faqKeywordInput.addEventListener('input', handleFaqSearch); // Use 'input' event instead of 'keyup'
    faqFromDateInput.addEventListener('change', handleFaqSearch); // Use 'input' event instead of 'change'
    faqToDateInput.addEventListener('change', handleFaqSearch); // Use 'input' event instead of 'change'


async function fetchFaqs(keyword, fromDate, toDate) {
    try {
        
        const keyword1 = keyword || "";
        const fromDate1 = fromDate || "";
        const toDate1 = toDate || "";

        const apiUrl = `${BASE_URL}/GetAllFAQView/?q=${encodeURIComponent(keyword1)}&from_date=${encodeURIComponent(fromDate1)}&to_date=${encodeURIComponent(toDate1)}`

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers:headers,
        });

        if (response.status === 200) {
            const responseData = await response.json();

            if (responseData && responseData.Response.results && responseData.Response.results.length > 0) {
                const faqTableBody = document.getElementById('faqtable');
                faqTableBody.innerHTML = '';

                responseData.Response.results.forEach((faq, index) => {
                    const row = document.createElement('tr');
                    row.dataset.faqId = faq.sr_no; // Store FAQ ID in data attribute
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${faq.question}</td>
                        <td>${faq.answer}</td>
                        <td>${new Date(faq.created_at).toLocaleString()}</td>
                        <td>
                        <i class="fa-solid fa-eye view-faq" data-faq-id="${faq.sr_no}"></i>
                        <i class="fa-solid fa-trash delete-faq" data-faq-id="${faq.sr_no}"></i>                        </td>
                    `;
                    faqTableBody.appendChild(row);
                });
            } else {
                // Display a message when no results are found
                // statusMessage.textContent = 'No results found';
            }
        } else if (response.status === 400) {
            // Display a message for invalid query parameters
            statusMessage.textContent = 'Invalid query parameters';
        } else {
            // Display an error message for other response status codes
            console.error('Failed to fetch FAQs:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching FAQs:', error);
    }
}

function handleFaqSearch() {
    const keyword = faqKeywordInput.value;
    const fromDate = formatDateToYYYYMMDD(faqFromDateInput.value);
    const toDate = formatDateToYYYYMMDD(faqToDateInput.value);

    // Clear previous status messages
    // statusMessage.textContent = '';
    

    fetchFaqs(keyword, fromDate, toDate);
}
});