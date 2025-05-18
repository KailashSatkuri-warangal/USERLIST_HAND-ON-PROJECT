// document.addEventListener('DOMContentLoaded', () => {
//     const usertablebody=document.getElementById("user-table-body");
//     // const loadingindicator=document.getElementById("loadingindicator");
//     // const errorindicator=document.getElementById("errorindicator");
//     // const errortextelement=document.getElementById("errortext");
//     const usertablesection=document.getElementById("user-table-section");
//     // const nousermessage=document.getElementById("nousermessage");

//     const apiurl="http://localhost:3000";
//     async function fetchAndDisplayUsers() {
//         const response = await fetch(`${apiurl}/api/students`);
//         const users = await response.json();
//         populateUserTable(users);

//     }
//     function populateUserTable(users){
//         users.forEach((user) => {
//       const row = usertablebody.insertRow();// Tailwind class for hover effect

//       // ID Cell
//       const idCell = row.insertCell();
//       idCell.textContent = user.student_id;

//       // First Name Cell
//       const firstNameCell = row.insertCell();
//       firstNameCell.textContent = user.first_name || "N/A";
//       // last Name Cell
//       const lastNameCell = row.insertCell();
//       lastNameCell.textContent = user.last_name || "N/A";
//       //

//       // Age Cell
//       const ageCell = row.insertCell();
//       ageCell.className = ageCell.textContent = user.age || "N/A";

//       // email cell
//       const emailCell = row.insertCell();
//       emailCell.textContent = user.email || "N/A";

//       // Department Cell
//       const departmentCell = row.insertCell();
//       departmentCell.textContent = user.major || "N/A";
//     });
//     usertablesection.classList.remove("hidden");
//     }
// });
document.addEventListener('DOMContentLoaded', () => {
  const usertablebody = document.getElementById("user-table-body");
  const usertablesection = document.getElementById("user-table-section");
  const loadingSpinner = document.getElementById("loading-spinner");
  const noDataMessage = document.getElementById("no-data");
  const searchInput = document.getElementById("search-input");
  const sortButtons = document.querySelectorAll(".sort-button");
  const refreshButton = document.querySelector(".refresh-button");
  const entriesSelect = document.getElementById("entries-per-page");
  const prevPageButton = document.getElementById("prev-page");
  const nextPageButton = document.getElementById("next-page");
  var api=3000
  const apiurl = `http://localhost:${api}`;
  let students = [];
  let filteredStudents = [];
  let currentSort = { field: "student_id", ascending: true };
  let currentPage = 1;
  let entriesPerPage = 10;

  async function fetchStudents() {
    loadingSpinner.classList.remove("hidden");
    usertablesection.classList.add("hidden");
    noDataMessage.classList.add("hidden");
    try {
      const response = await fetch(`${apiurl}/api/students`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      students = await response.json();
      applyFiltersAndSort();
    } catch (error) {
      console.error("Error fetching students:", error);
      usertablebody.innerHTML = `<tr><td colspan="10">Failed to load students: ${error.message}</td></tr>`;
      usertablesection.classList.remove("hidden");
    } finally {
      loadingSpinner.classList.add("hidden");
    }
  }

  function applyFiltersAndSort() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredStudents = students.filter(
      (student) =>
        student.first_name?.toLowerCase().includes(searchTerm) ||
        student.last_name?.toLowerCase().includes(searchTerm) ||
        student.email?.toLowerCase().includes(searchTerm)
    );

    filteredStudents.sort((a, b) => {
      const field = currentSort.field;
      let valueA = a[field] || "";
      let valueB = b[field] || "";
      
      // Handle numeric fields: student_id, gpa, age
      if (field === "student_id" || field === "gpa" || field === "age") {
        // Convert to numbers, treat invalid/non-numeric as Infinity (sorts to end)
        valueA = valueA && !isNaN(valueA) ? Number(valueA) : Infinity;
        valueB = valueB && !isNaN(valueB) ? Number(valueB) : Infinity;
        return currentSort.ascending ? valueA - valueB : valueB - valueA;
      }
      
      // String fields (e.g., first_name, email)
      return currentSort.ascending
        ? valueA.toString().localeCompare(valueB.toString())
        : valueB.toString().localeCompare(valueA.toString());
    });

    currentPage = 1; // Reset to first page on filter/sort
    updatePagination();
  }

  function updatePagination() {
    const totalEntries = filteredStudents.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    currentPage = Math.min(currentPage, totalPages || 1);

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages || totalEntries === 0;

    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const paginatedStudents = filteredStudents.slice(start, end);

    populateUserTable(paginatedStudents);
  }

  function populateUserTable(users) {
    usertablebody.innerHTML = "";
    if (users.length === 0) {
      noDataMessage.classList.remove("hidden");
      usertablesection.classList.add("hidden");
    } else {
      noDataMessage.classList.add("hidden");
      usertablesection.classList.remove("hidden");
      users.forEach((user) => {
        const row = usertablebody.insertRow();
        const cells = [
          { value: user.student_id || "N/A", label: "Student ID" },
          { value: user.first_name || "N/A", label: "First Name" },
          { value: user.last_name || "N/A", label: "Last Name" },
          { value: user.age || "N/A", label: "Age" },
          { value: user.email || "N/A", label: "Email" },
          { value: user.gender || "N/A", label: "Gender" },
          { value: user.major || "N/A", label: "Major" },
          { value: user.gpa || "N/A", label: "GPA" },
          { value: user.enrollment_date || "N/A", label: "Enrollment Date" },
          { value: user.graduation_date || "N/A", label: "Graduation Date" },
        ];
        cells.forEach((cell) => {
          const td = row.insertCell();
          td.textContent = cell.value;
          td.setAttribute("data-label", cell.label);
        });
      });
    }
  }

  searchInput.addEventListener("input", applyFiltersAndSort);

  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sortField = button.dataset.sort;
      if (currentSort.field === sortField) {
        currentSort.ascending = !currentSort.ascending;
      } else {
        currentSort.field = sortField;
        currentSort.ascending = true;
      }
      sortButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      applyFiltersAndSort();
    });
  });

  refreshButton.addEventListener("click", () => {
    searchInput.value = "";
    currentSort = { field: "student_id", ascending: true };
    sortButtons.forEach((btn) => btn.classList.remove("active"));
    sortButtons[0].classList.add("active");
    entriesSelect.value = "10";
    entriesPerPage = 10;
    currentPage = 1;
    fetchStudents();
  });

  entriesSelect.addEventListener("change", () => {
    entriesPerPage = parseInt(entriesSelect.value, 10);
    currentPage = 1;
    updatePagination();
  });

  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updatePagination();
    }
  });

  nextPageButton.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      updatePagination();
    }
  });

  sortButtons[0].classList.add("active");
  entriesSelect.value = "10";
  fetchStudents();
});