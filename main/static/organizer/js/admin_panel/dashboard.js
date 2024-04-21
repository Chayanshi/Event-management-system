const EMAIL = sessionStorage.getItem("verifiedEmail");
const TOKEN = sessionStorage.getItem("token");
const BASE_URL = 'https://py-infinityadmin.mobiloitte.io/app';
// const BASE_URL='http://127.0.0.1:8000/app'
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

// Function to fetch data from the GET API
document.addEventListener('DOMContentLoaded', function() {
    async function fetchDataFromAPI() {
        try {
            const response = await fetch(`${BASE_URL}/Dashboard/`,{
                headers:headers,
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Populate the HTML elements with the received data
            const totalBlogsElement = document.getElementById('totalBlogs');
            const totalBrandsElement = document.getElementById('totalBrands');
            const totalServicesElement = document.getElementById('totalServices');
            const totalPortfolioElement = document.getElementById('totalPortfolio');

            // Populate the values in the respective elements
            totalBlogsElement.textContent = data.Total_Blogs;
            totalBrandsElement.textContent = data.Total_Brands;
            totalServicesElement.textContent = data.Total_Services;
            totalPortfolioElement.textContent = data.Total_Portfolio;

            // Populate the latest portfolio data (you can do this in a loop if needed)
            const latestPortfolioTableBody = document.getElementById('latestPortfolioTableBody');

            if (data.portfolios_list.length > 0) {
                // Clear existing rows
                latestPortfolioTableBody.innerHTML = '';

                // Iterate over the portfolio data and create rows
                data.portfolios_list.forEach((portfolio) => {
                    const row = document.createElement('tr');
                    row.setAttribute('class', "datarow" )
                    
                    row.innerHTML = `
                        <td style="text-align: center;">${portfolio.Portfolio_Name}</td>
                        <td style="text-align: center;">${portfolio.formatted_created_datetime}</td>
                        <td style="text-align: center;">${portfolio.Portfolio_Category.Category_name}</td>
                    `;

                    latestPortfolioTableBody.appendChild(row);
                });
            }

        } catch (error) {
            // console.error(`Error fetching data from the API: ${error.message}`);
        }
    }
    fetchDataFromAPI();
});
