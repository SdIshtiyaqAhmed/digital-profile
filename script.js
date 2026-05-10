const STORAGE_KEY = "syed-hub-theme";
const root = document.documentElement;
const header = document.querySelector(".site-header");
const toggle = document.querySelector(".theme-toggle");
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const navLinks = Array.from(document.querySelectorAll(".site-nav__link"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const interactiveElements = Array.from(document.querySelectorAll(".link-card, .contact-button"));

function getPreferredTheme() {
  const storedTheme = localStorage.getItem(STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return "dark";
}

function updateToggle(theme) {
  const isDark = theme === "dark";

  toggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  toggle.setAttribute("aria-pressed", String(isDark));
}

function applyTheme(theme, persist = false) {
  root.setAttribute("data-theme", theme);
  updateToggle(theme);

  if (!prefersReducedMotion.matches) {
    toggle.animate(
      [
        { transform: "translateY(0) scale(1)", opacity: 1 },
        { transform: "translateY(-1px) scale(0.96)", opacity: 0.86 },
        { transform: "translateY(0) scale(1)", opacity: 1 }
      ],
      {
        duration: 260,
        easing: "ease-out"
      }
    );
  }

  if (persist) {
    localStorage.setItem(STORAGE_KEY, theme);
  }
}

function updateHeaderState() {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 18);
}

function setActiveLink(activeId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

applyTheme(getPreferredTheme());
updateHeaderState();

toggle.addEventListener("click", () => {
  const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(nextTheme, true);
});

mediaQuery.addEventListener("change", (event) => {
  if (localStorage.getItem(STORAGE_KEY)) {
    return;
  }

  applyTheme(event.matches ? "dark" : "light");
});

window.addEventListener("scroll", updateHeaderState, { passive: true });

if (sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (visibleEntry) {
        setActiveLink(visibleEntry.target.id);
      }
    },
    {
      rootMargin: "-35% 0px -45% 0px",
      threshold: [0.2, 0.4, 0.6]
    }
  );

  sections.forEach((section) => observer.observe(section));
  setActiveLink(sections[0].id);
}

if (revealItems.length) {
  if (prefersReducedMotion.matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }
}

if (!prefersReducedMotion.matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  interactiveElements.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 5;

      element.style.setProperty("--glow-x", `${x}%`);
      element.style.setProperty("--glow-y", `${y}%`);
      element.style.setProperty("--tilt-x", `${offsetX}px`);
      element.style.setProperty("--tilt-y", `${offsetY}px`);
    });

    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--glow-x", "50%");
      element.style.setProperty("--glow-y", "50%");
      element.style.setProperty("--tilt-x", "0px");
      element.style.setProperty("--tilt-y", "0px");
    });
  });
}
