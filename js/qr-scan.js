
let cafeScanner = null;

document.addEventListener("DOMContentLoaded", () => {
  const scanButton = document.getElementById("scan-cafe-btn");
  const closeButton = document.getElementById("close-scanner");
  const scannerPanel = document.getElementById("cafe-scanner");
  const message = document.getElementById("qr-message");

  if (!scanButton || !scannerPanel) return;

  scanButton.addEventListener("click", async () => {
    document.querySelectorAll(".s-view").forEach(view => {
      view.classList.remove("active");
    });

    scannerPanel.style.display = "block";
    message.textContent = "Allow camera access to scan a café QR code.";

    try {
      if (!cafeScanner) {
        cafeScanner = new Html5Qrcode("qr-reader");
      }

      await cafeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          try {
            const scannedURL = new URL(decodedText);

            if (
              scannedURL.protocol !== "https:" &&
              scannedURL.protocol !== "http:"
            ) {
              throw new Error("Invalid link");
            }

            if (cafeScanner && cafeScanner.isScanning) await cafeScanner.stop();
            message.textContent = "Café found. Opening its menu…";
            window.location.href = scannedURL.href;
          } catch {
            message.textContent =
              "This QR code does not contain a valid café link.";
          }
        },
        () => {}
      );
    } catch (error) {
      message.textContent =
        "Camera unavailable. Allow camera permission and use HTTPS or localhost.";
    }
  });

  closeButton.addEventListener("click", async () => {
    if (cafeScanner && cafeScanner.isScanning) {
      await cafeScanner.stop();
    }

    scannerPanel.style.display = "none";
    Student.show("home");
  });
});
