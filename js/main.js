(() => {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const video = document.querySelector(".hero-video");
  const poster = document.querySelector(".hero-poster");
  const navLinks = [...document.querySelectorAll(".site-nav a")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".panel-inner").forEach((el) => {
    if (!el.classList.contains("about-inner")) el.classList.add("reveal");
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  const aboutIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          aboutIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    if (reduceMotion) el.classList.add("is-in");
    else io.observe(el);
  });

  document.querySelectorAll("[data-reveal-about]").forEach((el) => {
    if (reduceMotion) el.classList.add("is-in");
    else aboutIo.observe(el);
  });

  if (header && hero) {
    const syncHeaderTheme = () => {
      const headerH = header.offsetHeight;
      const heroRect = hero.getBoundingClientRect();
      const inHero = heroRect.bottom > headerH + 24;
      header.classList.toggle("on-hero", inHero);
    };

    syncHeaderTheme();
    window.addEventListener("scroll", syncHeaderTheme, { passive: true });
    window.addEventListener("resize", syncHeaderTheme, { passive: true });
  }

  const setActiveNav = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    let current = "top";
    sections.forEach((section) => {
      if (section.offsetTop <= y) current = section.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href")?.slice(1);
      const active =
        href === current ||
        (current === "work" && href === "projects") ||
        (current === "projects" && href === "work");
      link.classList.toggle("is-active", Boolean(active));
    });
  };

  setActiveNav();
  window.addEventListener("scroll", setActiveNav, { passive: true });

  if (!video || !hero) return;

  const NAME_EARLY_SECONDS = 4;
  let nameRevealed = false;

  const revealName = () => {
    hero.classList.add("is-named");
  };

  const revealNameOnce = () => {
    if (nameRevealed) return;
    nameRevealed = true;
    revealName();
  };

  const maybeRevealNameEarly = () => {
    const { duration, currentTime } = video;
    if (!duration || !Number.isFinite(duration)) return;
    if (currentTime >= Math.max(0, duration - NAME_EARLY_SECONDS)) {
      revealNameOnce();
    }
  };

  const showVideo = () => {
    hero.classList.add("is-live");
  };

  const onEnded = () => {
    video.pause();
    showVideo();
    revealNameOnce();
  };

  const start = async () => {
    if (reduceMotion) {
      showVideo();
      revealNameOnce();
      if (poster) poster.style.opacity = "1";
      hero.classList.remove("is-live");
      return;
    }

    video.muted = true;
    video.playsInline = true;
    video.loop = false;

    try {
      await video.play();
      showVideo();
    } catch {
      if (poster) poster.style.opacity = "1";
      revealNameOnce();
    }
  };

  video.addEventListener("playing", showVideo);
  video.addEventListener("timeupdate", maybeRevealNameEarly);
  video.addEventListener("loadedmetadata", maybeRevealNameEarly);
  video.addEventListener("ended", onEnded);
  video.addEventListener("error", () => {
    if (poster) poster.style.opacity = "1";
    revealNameOnce();
  });

  if (video.ended) onEnded();
  else if (video.readyState >= 2) start();
  else video.addEventListener("canplay", start, { once: true });
})();
