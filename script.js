const listings = [
  {
    name: "Green View Boys Hostel",
    type: "hostel",
    price: 6200,
    distance: "650 m from main gate",
    description: "Triple and double sharing rooms with daily meals, Wi-Fi and study-friendly rules.",
    amenities: ["Food", "Wi-Fi", "Laundry", "Security"],
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80",
    phone: "+919999999999"
  },
  {
    name: "Aarav Premium PG",
    type: "pg",
    price: 8500,
    distance: "1.1 km from library",
    description: "Clean furnished PG with AC options, attached washrooms and flexible meal plans.",
    amenities: ["AC option", "Meals", "Housekeeping", "CCTV"],
    image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=900&q=80",
    phone: "+919999999999"
  },
  {
    name: "College Road 2BHK Flat",
    type: "flat",
    price: 12000,
    distance: "900 m from campus",
    description: "Student-friendly flat for groups with kitchen, balcony and negotiable rent.",
    amenities: ["Kitchen", "Balcony", "Parking", "Negotiable"],
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    phone: "+919999999999"
  },
  {
    name: "Sunrise Girls Hostel",
    type: "hostel",
    price: 7000,
    distance: "500 m from bus stop",
    description: "Secure girls hostel with biometric entry, home-style food and peaceful rooms.",
    amenities: ["Food", "Biometric", "Wi-Fi", "Warden"],
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80",
    phone: "+919999999999"
  },
  {
    name: "Metro Student PG",
    type: "pg",
    price: 5800,
    distance: "1.4 km from college",
    description: "Budget PG with shared rooms, filtered water and quick transport access.",
    amenities: ["Budget", "RO Water", "Transport", "Wi-Fi"],
    image: "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=900&q=80",
    phone: "+919999999999"
  },
  {
    name: "North Gate Studio Flat",
    type: "flat",
    price: 9800,
    distance: "750 m from north gate",
    description: "Independent studio with private kitchen setup and owner open to student tenants.",
    amenities: ["Private", "Kitchen", "Furnished", "Near gate"],
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
    phone: "+919999999999"
  }
];

const listingGrid = document.querySelector("#listingGrid");
const filterButtons = document.querySelectorAll(".filter");
const budgetFilter = document.querySelector("#budgetFilter");
let activeType = "all";

function formatPrice(price) {
  return `Rs ${price.toLocaleString("en-IN")}/mo`;
}

function renderListings() {
  const budgetLimit = budgetFilter.value;
  const visibleListings = listings.filter((listing) => {
    const matchesType = activeType === "all" || listing.type === activeType;
    const matchesBudget = budgetLimit === "all" || listing.price <= Number(budgetLimit);
    return matchesType && matchesBudget;
  });

  listingGrid.innerHTML = visibleListings.map((listing) => `
    <article class="listing-card">
      <img src="${listing.image}" alt="${listing.name}">
      <div class="listing-body">
        <div class="listing-meta">
          <span class="tag">${listing.type}</span>
          <span class="price">${formatPrice(listing.price)}</span>
        </div>
        <h3>${listing.name}</h3>
        <p>${listing.distance}</p>
        <p>${listing.description}</p>
        <div class="amenities">
          ${listing.amenities.map((item) => `<span>${item}</span>`).join("")}
        </div>
        <div class="card-actions">
          <a class="call" href="tel:${listing.phone}">Call Owner</a>
          <button type="button" data-interest="${listing.name}">Interested</button>
        </div>
      </div>
    </article>
  `).join("");

  if (!visibleListings.length) {
    listingGrid.innerHTML = `<p class="empty-state">No listings match this filter yet. Try another budget.</p>`;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeType = button.dataset.filter;
    renderListings();
  });
});

budgetFilter.addEventListener("change", renderListings);

document.addEventListener("click", (event) => {
  const interestButton = event.target.closest("[data-interest]");
  if (!interestButton) return;

  const propertyName = interestButton.dataset.interest;
  document.querySelector("#student-form").scrollIntoView({ behavior: "smooth" });
  const timelineInput = document.querySelector("[name='timeline']");
  timelineInput.value = `Interested in ${propertyName}`;
  timelineInput.focus();
});

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function postLead(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

function handleForm(formId, messageId, endpoint, successMessage) {
  const form = document.querySelector(formId);
  const messageBox = document.querySelector(messageId);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageBox.textContent = "Saving...";

    try {
      await postLead(endpoint, formToObject(form));
      messageBox.textContent = successMessage;
      form.reset();
    } catch (error) {
      messageBox.textContent = error.message;
    }
  });
}

handleForm(
  "#studentLeadForm",
  "#studentMessage",
  "/api/student-leads",
  "Request received. Your lead is saved and ready for follow-up."
);

handleForm(
  "#ownerForm",
  "#ownerMessage",
  "/api/owner-leads",
  "Property details saved. You can now track this owner lead."
);

renderListings();
