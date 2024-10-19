const buttons = document.querySelectorAll(".rounded-btn");
const cards = document.querySelectorAll(".card");
const fixdiv = document.querySelector(".fixdiv");

document.addEventListener("DOMContentLoaded", () => {
  buttons.forEach((btn, i) => {
    if (i === 0) {
      btn.classList.add("active");
      btn.style.backgroundColor = window.getComputedStyle(
        cards[0].querySelector(".card-body")
      ).backgroundColor;
      btn.style.color = "white";
    } else {
      btn.classList.remove("active");
      btn.style.backgroundColor = "#363636";
      btn.style.color = "white";
    }
  });

  // Disable observer on load
  disableObserver = true;

  // Reactivate observer after a delay to avoid triggering during initial load
  setTimeout(() => {
    disableObserver = false;
  }, 100); // 100ms delay to ensure first button is set before observer kicks in
});

let disableObserver = false; // Flag to disable observer initially

// IntersectionObserver for observing cards
const observer = new IntersectionObserver(
  (entries) => {
    if (disableObserver) return; // If observer is disabled, skip the logic

    entries.forEach((entry) => {
      const index = Array.from(cards).indexOf(entry.target);

      if (entry.isIntersecting) {
        // Get the background color of the current card
        const cardBackgroundColor = window.getComputedStyle(
          entry.target.querySelector(".card-body")
        ).backgroundColor;

        // Change the corresponding button's color to match the card
        buttons.forEach((btn, i) => {
          if (i === index) {
            btn.classList.add("active");
            btn.style.backgroundColor = cardBackgroundColor; // Apply the card's background color
            btn.style.color = "white"; // Set the text color to white
          } else {
            btn.classList.remove("active");
            btn.style.backgroundColor = "#363636"; // Reset other buttons to default background color
            btn.style.color = "white"; // Reset other buttons' text color
          }
        });
      } else {
        // Handle reverse scrolling case (scrolling up)
        if (entry.boundingClientRect.top > 0) {
          // Card is leaving from the bottom (scrolling up)
          const previousCardIndex = Math.max(index - 1, 0); // Previous card
          const previousCardBackgroundColor = window.getComputedStyle(
            cards[previousCardIndex].querySelector(".card-body") // Correctly query the previous card's body
          ).backgroundColor;

          buttons.forEach((btn, i) => {
            if (i === previousCardIndex) {
              btn.classList.add("active");
              btn.style.backgroundColor = previousCardBackgroundColor; // Apply the previous card's background color
              btn.style.color = "white"; // Set the text color to white
            } else {
              btn.classList.remove("active");
              btn.style.backgroundColor = "#363636"; // Reset other buttons to default
              btn.style.color = "white"; // Reset other buttons' text color
            }
          });
        }
      }
    });
  },
  {
    threshold: 0.99, // 99% visibility required to trigger
    rootMargin: "0px", // Standard margin for smooth detection
  }
);

// Start observing each card after DOM is ready
cards.forEach((card) => {
  observer.observe(card);
});

// Observer for the last card to handle fixdiv position
const lastCardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const lastCardTop = entry.target.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      // Fixdiv will remain sticky while the last card is entering viewport
      if (lastCardTop <= windowHeight && lastCardTop >= 0) {
        fixdiv.style.position = "sticky";
        fixdiv.style.top = "60px";
      }

      // Fixdiv will scroll with the last card once it is fully in view
      if (lastCardTop <= 0) {
        fixdiv.style.position = "relative"; // Last card takes fixdiv along with it
        fixdiv.style.top = "auto";
      }

      // Handle reverse scrolling to make fixdiv sticky again
      if (lastCardTop > windowHeight) {
        fixdiv.style.position = "sticky";
        fixdiv.style.top = "60px";
      }
    });
  },
  {
    threshold: 0.99, // Last card is entering and exiting the viewport
  }
);

lastCardObserver.observe(cards[cards.length - 1]);

// Smooth shrinking and blurring cards on scroll
window.addEventListener("scroll", function () {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card, index) => {
    if (index === cards.length - 1) return; // Skip the last card

    const nextCard = cards[index + 1];
    const nextCardRect = nextCard.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const overlapPercentage = Math.max(
      0,
      (window.innerHeight - nextCardRect.top) / window.innerHeight
    );

    const scaleValue = 1 - overlapPercentage * 0.2; // scale down by 20%
    const blurValue = overlapPercentage * 5; // blur max 5px

    card.style.transform = `scale(${scaleValue})`;
    card.style.filter = `blur(${blurValue}px)`;
  });
});
