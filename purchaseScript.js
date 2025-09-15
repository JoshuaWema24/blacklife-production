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
  const selectedTicketLabel = document.getElementById("selected-ticket-label");
  const totalPrice = document.getElementById("total-price");
  const firstNameInput = document.getElementById("first-name");
  const lastNameInput = document.getElementById("last-name");
  const idNumberInput = document.getElementById("id-number");
  const phoneInput = document.getElementById("phone-number");

  let selectedPrice = 0;
  let ticketLabel = "";
  let tshirtSize = "";

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
      } else {
        tshirtSizeSection.classList.add("hidden");
        tshirtSizeOptions.forEach((sizeRadio) => (sizeRadio.checked = false));
        tshirtSize = "";
      }
    });
  });

  tshirtSizeOptions.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      tshirtSize = event.target.value;
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
    if (isVipOrCouples && !tshirtSize) {
      showMessageBox("Please select a T-shirt size.");
      return;
    }
    if (
      firstNameInput.value.trim() === "" ||
      lastNameInput.value.trim() === "" ||
      idNumberInput.value.trim() === ""
    ) {
      showMessageBox("Please fill in all personal details.");
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
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            idNumber: idNumberInput.value.trim(),
            tshirtSize: tshirtSize,
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
