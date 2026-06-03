const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll("[data-category]");
const form = document.querySelector("[data-form]");
const formStatus = document.querySelector("[data-form-status]");

const setupAnimatedFavicon = () => {
  const favicon = document.querySelector('link[rel="icon"]');
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!favicon || reducedMotion) {
    return;
  }

  const canvas = document.createElement("canvas");
  const size = 64;
  const context = canvas.getContext("2d");
  const source = new Image();

  if (!context) {
    return;
  }

  canvas.width = size;
  canvas.height = size;
  source.src = favicon.href;

  const drawFrame = (time) => {
    const pulse = (Math.sin(time / 240) + 1) / 2;
    const sweep = ((time / 28) % (size * 2)) - size;

    context.clearRect(0, 0, size, size);

    const background = context.createRadialGradient(28, 22, 6, 32, 32, 46);
    background.addColorStop(0, "#105b7a");
    background.addColorStop(0.58, "#062b3f");
    background.addColorStop(1, "#02121d");
    context.fillStyle = background;
    context.fillRect(0, 0, size, size);

    if (source.complete && source.naturalWidth > 0) {
      context.save();
      context.globalAlpha = 0.86;
      context.drawImage(source, 0, 0, size, size);
      context.restore();
    }

    context.save();
    context.globalCompositeOperation = "screen";
    context.shadowColor = "#26d9ff";
    context.shadowBlur = 10 + pulse * 18;
    context.strokeStyle = `rgba(38, 217, 255, ${0.42 + pulse * 0.38})`;
    context.lineWidth = 2.4;
    context.beginPath();
    context.moveTo(8, 43);
    context.lineTo(21, 23);
    context.lineTo(31, 32);
    context.lineTo(43, 14);
    context.lineTo(56, 25);
    context.stroke();

    const shine = context.createLinearGradient(sweep - 20, 0, sweep + 22, size);
    shine.addColorStop(0, "rgba(255, 255, 255, 0)");
    shine.addColorStop(0.5, "rgba(255, 255, 255, 0.86)");
    shine.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = shine;
    context.fillRect(0, 0, size, size);
    context.restore();

    favicon.href = canvas.toDataURL("image/png");
  };

  const startedAt = performance.now();
  const renderFrame = () => drawFrame(performance.now() - startedAt);

  renderFrame();
  window.setInterval(renderFrame, 160);
};

setupAnimatedFavicon();

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 16);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    projectCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const data = new FormData(form);

    formStatus.textContent = "Sending your request...";
    submitButton.disabled = true;

    try {
      const ajaxAction = form.action.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/");
      const response = await fetch(ajaxAction, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      form.reset();
      formStatus.textContent = "Thank you. Your request has been sent.";
    } catch (error) {
      formStatus.textContent = "We could not send the form in this browser. Please call 310-828-7707.";
    } finally {
      submitButton.disabled = false;
    }
  });
}
