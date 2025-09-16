document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventName = urlParams.get("event");
  if (eventName) {
    document.getElementById("event-title").textContent = eventName;
  }

  const payNowBtn = document.getElementById("pay-now-button");
  const ticketOptions = document.querySelectorAll('input[name="ticket-type"]');
  const tshirtSizeSection = document.getElementById("tshirt-size-section");
  const tshirtSizeOptions = document.querySelectorAll(
    'input[name="tshirt-size"]'
  );

  // ✅ New: color section
  const tshirtColorSection = document.createElement("div");
  tshirtColorSection.className = "text-left mb-6 hidden";
  tshirtColorSection.innerHTML = `
    <h4 class="text-lg text-gray-300 mb-4">T-Shirt Color:</h4>
    <div class="space-y-4">
      <div>
        <input type="radio" id="color-black" name="tshirt-color" value="Black" class="hidden" />
        <label for="color-black" class="radio-label flex justify-between items-center p-4 rounded-lg cursor-pointer border border-transparent hover:border-yellow-600">
          <span class="text-white">Black</span>
        </label>
      </div>
      <div>
        <input type="radio" id="color-white" name="tshirt-color" value="White" class="hidden" />
        <label for="color-white" class="radio-label flex justify-between items-center p-4 rounded-lg cursor-pointer border border-transparent hover:border-yellow-600">
          <span class="text-white">White</span>
        </label>
      </div>
      <div>
        </label>
      </div>
    </div>
  `;
  document
    .querySelector(".glassmorphism")
    .insertBefore(
      tshirtColorSection,
      document.querySelector("p.text-white.mt-6")
    );

  const selectedTicketLabel = document.getElementById("selected-ticket-label");
  const totalPrice = document.getElementById("total-price");

  // ✅ Updated inputs
  const referredByInput = document.getElementById("Referred-by");
  const lastNameInput = document.getElementById("last-name");
  const idNumberInput = document.getElementById("id-number");
  const phoneInput = document.getElementById("phone-number");

  let selectedPrice = 0;
  let ticketLabel = "";
  let tshirtSize = "";
  let tshirtColor = "";

  // Update selected ticket
  ticketOptions.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      selectedPrice = parseFloat(event.target.value);
      ticketLabel = event.target.getAttribute("data-label");
      selectedTicketLabel.textContent = ticketLabel;
      totalPrice.textContent = `Ksh ${selectedPrice.toFixed(0)}`;

      const isVipOrCouples =
        event.target.id === "vip" || event.target.id === "couples-group";

      if (isVipOrCouples) {
        tshirtSizeSection.classList.remove("hidden");
        tshirtColorSection.classList.remove("hidden");
      } else {
        tshirtSizeSection.classList.add("hidden");
        tshirtColorSection.classList.add("hidden");

        // reset
        tshirtSizeOptions.forEach((sizeRadio) => (sizeRadio.checked = false));
        document
          .querySelectorAll('input[name="tshirt-color"]')
          .forEach((c) => (c.checked = false));

        tshirtSize = "";
        tshirtColor = "";
      }
    });
  });

  tshirtSizeOptions.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      tshirtSize = event.target.value;
    });
  });

  document.querySelectorAll('input[name="tshirt-color"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
      tshirtColor = event.target.value;

      // ✅ Highlight selected label
      document
        .querySelectorAll('label[for^="color-"]')
        .forEach((label) =>
          label.classList.remove("border-yellow-600", "bg-gray-700")
        );

      const selectedLabel = document.querySelector(
        `label[for="${event.target.id}"]`
      );
      if (selectedLabel) {
        selectedLabel.classList.add("border-yellow-600", "bg-gray-700");
      }
    });
  });

  const showMessageBox = (message) => {
    const messageBox = document.createElement("div");
    messageBox.innerHTML = `
      <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-sm w-full">
          <p class="text-center mb-4">${message}</p>
          <button class="w-full bg-yellow-600 text-white px-4 py-2 rounded-full hover:bg-yellow-700 transition-colors duration-200" onclick="this.parentElement.parentElement.remove()">
            OK
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(messageBox);
  };

  payNowBtn.addEventListener("click", async () => {
    const phoneNumber = phoneInput.value.trim();

    if (selectedPrice <= 0) {
      showMessageBox("Please select a ticket type first.");
      return;
    }

    const isVipOrCouples =
      document.getElementById("vip").checked ||
      document.getElementById("couples-group").checked;

    if (isVipOrCouples && (!tshirtSize || !tshirtColor)) {
      showMessageBox("Please select a T-shirt size and color.");
      return;
    }

    if (
      lastNameInput.value.trim() === "" ||
      idNumberInput.value.trim() === ""
    ) {
      showMessageBox("Please fill in your last name and ID number.");
      return;
    }

    if (!phoneNumber.startsWith("254") || phoneNumber.length < 12) {
      showMessageBox("Please enter a valid phone number starting with '254'.");
      return;
    }

    try {
      const response = await fetch(
        "https://blacklife-production-backend2025.onrender.com/pay",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: selectedPrice,
            phone: phoneNumber,
            referredBy: referredByInput.value.trim() || null, // optional
            fullName: lastNameInput.value.trim(),
            idNumber: idNumberInput.value.trim(),
            tshirtSize: tshirtSize,
            tshirtColor: tshirtColor,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.mpesaResponse) {
        showMessageBox(
          "✅ Payment request sent! Please check your phone to complete the payment."
        );
        console.log("UMS Response:", data.mpesaResponse);
      } else {
        showMessageBox("❌ Payment initiation failed. Please try again.");
        console.error("UMS Error:", data);
      }
    } catch (error) {
      console.error("Error:", error);
      showMessageBox("Something went wrong. Please try again.");
    }
  });
});
