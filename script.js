window.onload = function () {
    checkLogin(); // ✅ Ensure login check happens first

    if (document.getElementById("resultYear")) {
        populateYearDropdowns();
    }

    if (document.getElementById("adminResultsDisplay")) {
        displayResults(true);
    } else if (document.getElementById("resultsDisplay")) {
        displayResults(false);
    }

    if (document.getElementById("adminNewsDisplay")) {
        displayNews(true);
    } else if (document.getElementById("newsDisplay")) {
        displayNews(false);
    }

    if (document.getElementById("adminVideoDisplay")) {
        displayVideos(true); // ✅ Admin page (includes delete buttons)
    } else if (document.getElementById("videoGallery")) {
        displayVideos(false); // ✅ Public video page
    }

    if (document.getElementById("bannerImage")) {
        setupBannerRotation();
    }
};


// ✅ Ensure Admin Login is Checked
function checkLogin() {
    let loginModal = document.getElementById("loginModal");

    if (!sessionStorage.getItem("isAdmin")) {
        console.log("🚫 Access denied - showing login modal.");
        
        if (loginModal) {
            loginModal.style.display = "block"; // Show login modal
        }
        return;
    }

    console.log("✅ Admin logged in - granting access.");
    
    // Hide login modal and show admin content
    if (loginModal) {
        loginModal.style.display = "none";
    }

    let adminContent = document.getElementById("adminContent");
    if (adminContent) {
        adminContent.style.display = "block";
    }
}

// ✅ Validate Admin Login
function validateLogin() {
    let passwordField = document.getElementById("adminPassword");

    if (!passwordField) {
        alert("Error: Password field is missing!");
        return;
    }

    let password = passwordField.value.trim();

    if (password === "admin123") {
        console.log("✅ Login successful - Granting access.");
        sessionStorage.setItem("isAdmin", "true");

        let loginModal = document.getElementById("loginModal");
        if (loginModal) {
            loginModal.style.display = "none";
        }

        let adminContent = document.getElementById("adminContent");
        if (adminContent) {
            adminContent.style.display = "block";
        }

        setTimeout(() => {
            window.location.href = "admin.html";
        }, 500);
    } else {
        console.log("❌ Incorrect password entered!");
        alert("❌ Incorrect Password! Please try again.");
    }
}

// ✅ Logout Function
function logout() {
    sessionStorage.removeItem("isAdmin");
    alert("You have been logged out.");
    window.location.replace("index.html");
}

// ✅ Populate Year Dropdown
function populateYearDropdowns() {
    let currentYear = new Date().getFullYear();
    let futureYears = 5;
    let dropdown = document.getElementById("resultYear");

    if (!dropdown) return; // Prevents errors

    dropdown.innerHTML = "";
    for (let year = currentYear - 5; year <= currentYear + futureYears; year++) {
        let option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        dropdown.appendChild(option);
    }
}

// ✅ Save Results to Local Storage
function saveResults() {
    let fileInput = document.getElementById("resultsFile");
    let selectedYear = document.getElementById("resultYear").value;
    let file = fileInput.files[0];

    if (!file) {
        alert("Please select a results file to upload.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function (event) {
        let resultsList = JSON.parse(localStorage.getItem("results")) || {};
        if (!resultsList[selectedYear]) {
            resultsList[selectedYear] = [];
        }
        resultsList[selectedYear].push({ name: file.name, data: event.target.result });

        localStorage.setItem("results", JSON.stringify(resultsList));
        alert("Results uploaded successfully!");
        displayResults(true);
    };
    reader.readAsDataURL(file);
}

// ✅ Display Results (Admin Includes Delete Button)
function displayResults(isAdmin) {
    let resultsList = JSON.parse(localStorage.getItem("results")) || {};
    let resultsDisplay = document.getElementById(isAdmin ? "adminResultsDisplay" : "resultsDisplay");

    if (!resultsDisplay) return;
    resultsDisplay.innerHTML = "";

    let hasResults = false;

    for (const year in resultsList) {
        let yearSection = document.createElement("div");
        yearSection.innerHTML = `<h3>${year} Competition Results</h3>`;

        resultsList[year].forEach((file, index) => {
            let resultEntry = document.createElement("p");
            resultEntry.innerHTML = `
                <a href="${file.data}" download>${file.name}</a> 
                ${isAdmin ? `<button onclick="deleteResult('${year}', ${index})" class="delete-btn">Delete</button>` : ""}
            `;
            yearSection.appendChild(resultEntry);
        });

        resultsDisplay.appendChild(yearSection);
        hasResults = true;
    }

    if (!hasResults) {
        resultsDisplay.innerHTML = "<p>No results available yet.</p>";
    }
}

// ✅ Delete Specific Result (Admin Only)
function deleteResult(year, index) {
    let resultsList = JSON.parse(localStorage.getItem("results")) || {};

    if (!resultsList[year]) return;

    resultsList[year].splice(index, 1); // Remove the selected result

    if (resultsList[year].length === 0) {
        delete resultsList[year];
    }

    localStorage.setItem("results", JSON.stringify(resultsList));
    displayResults(true);
}

// ✅ Save News to Local Storage
function saveNews() {
    let newsTitle = document.getElementById("newsTitle").value.trim();
    let newsContent = document.getElementById("newsText").value.trim();
    let newsImageFile = document.getElementById("newsImageFile").files[0];

    if (newsTitle === "" || newsContent === "") {
        alert("Please enter a news title and content.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function (event) {
        let newsList = JSON.parse(localStorage.getItem("newsArticles")) || [];
        newsList.unshift({
            title: newsTitle,
            content: newsContent,
            image: newsImageFile ? event.target.result : null,
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem("newsArticles", JSON.stringify(newsList));
        alert("News saved successfully!");
        displayNews(true); // Refresh news list in admin
    };

    if (newsImageFile) {
        reader.readAsDataURL(newsImageFile);
    } else {
        reader.onload();
    }
}

// ✅ Add Multiple Videos
function addVideo() {
    let videoTitle = document.getElementById("videoTitle").value.trim();
    let videoFile = document.getElementById("videoFile").files[0];

    if (!videoFile) {
        alert("Please select a video file to upload.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function (event) {
        let videos = JSON.parse(localStorage.getItem("videos")) || [];

        videos.push({ // ✅ Append new video instead of replacing
            title: videoTitle || "Untitled Video",
            video: event.target.result,
            date: new Date().toLocaleDateString()
        });

        localStorage.setItem("videos", JSON.stringify(videos));
        alert("Video added successfully!");

        // ✅ Clear input fields after adding
        document.getElementById("videoTitle").value = "";
        document.getElementById("videoFile").value = "";

        // ✅ Refresh both admin and public views
        displayVideos(true);
        displayVideos(false);
    };
    reader.readAsDataURL(videoFile);
}

// ✅ Display Videos (Now Works for Multiple Uploads)
function displayVideos(isAdmin) {
    let videos = JSON.parse(localStorage.getItem("videos")) || [];
    let videoContainer = document.getElementById(isAdmin ? "adminVideoDisplay" : "videoGallery");

    if (!videoContainer) return;
    videoContainer.innerHTML = "";

    if (videos.length === 0) {
        videoContainer.innerHTML = "<p>No videos available.</p>";
        return;
    }

    videos.forEach((videoItem, index) => {
        let videoElement = document.createElement("div");
        videoElement.classList.add("video-item");
        videoElement.innerHTML = `
            <h3>${videoItem.title ? videoItem.title : "Untitled Video"}</h3>
            <video width="320" height="240" controls>
                <source src="${videoItem.video}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <p><strong>Uploaded on: ${videoItem.date}</strong></p>
            ${isAdmin ? `<button onclick="deleteVideo(${index})" class="delete-btn">Delete</button>` : ""}
            <hr>
        `;
        videoContainer.appendChild(videoElement);
    });
}

// ✅ Delete Specific Video (Admin Only)
function deleteVideo(index) {
    let videos = JSON.parse(localStorage.getItem("videos")) || [];

    if (index < 0 || index >= videos.length) {
        alert("Invalid video selection.");
        return;
    }

    videos.splice(index, 1); // ✅ Remove the selected video
    localStorage.setItem("videos", JSON.stringify(videos)); // ✅ Update storage

    // ✅ Refresh both admin and public views after deletion
    displayVideos(true);
    displayVideos(false);
}