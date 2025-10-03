// Logout button functionality
document.getElementById("logoutBtn").addEventListener("click", function () {
  alert("You have logged out!");
  window.location.href = "/signup and signin page/signin.html"; 
});

// Upload form functionality
document.getElementById("uploadForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const uploadedFiles = document.getElementById("documentUpload").files;
  const fileList = document.getElementById("fileList");

  if (uploadedFiles.length === 0) {
    alert("Please select at least one file to upload!");
    return;
  }

  fileList.innerHTML = "";

  // Array to save in localStorage (just filenames)
  let savedFiles = [];

  for (let i = 0; i < uploadedFiles.length; i++) {
    const file = uploadedFiles[i];
    savedFiles.push(file.name);

    let li = document.createElement("li");

    const reader = new FileReader();
    reader.onload = function (e) {
      if (file.type.startsWith("image/")) {
        // Show image preview
        let img = document.createElement("img");
        img.src = e.target.result;
        img.width = 150;
        li.appendChild(img);
      } else if (file.type === "application/pdf") {
        // Show PDF preview as link
        let link = document.createElement("a");
        link.href = e.target.result;
        link.target = "_blank";
        link.textContent = "View PDF: " + file.name;
        li.appendChild(link);
      } else {
        // Other files → just show name
        li.textContent = file.name;
      }
    };
    reader.readAsDataURL(file);

    fileList.appendChild(li);
  }

  localStorage.setItem("studentFiles", JSON.stringify(savedFiles));

  alert("Files uploaded successfully!");
});

// Load saved files on refresh (only names, previews need backend storage)
window.onload = function () {
  const fileList = document.getElementById("fileList");
  const savedFiles = JSON.parse(localStorage.getItem("studentFiles")) || [];

  if (savedFiles.length > 0) {
    fileList.innerHTML = "";
    savedFiles.forEach(file => {
      let li = document.createElement("li");
      li.textContent = file + " (saved)";
      fileList.appendChild(li);
    });
  }
};
