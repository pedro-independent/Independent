import './styles/style.css'

const page = document.body.dataset.page;

gsap.registerPlugin(ScrollTrigger, Flip, ScrambleTextPlugin, SplitText, Draggable, InertiaPlugin, Physics2DPlugin);


/* Change Page Title on Leave */
const documentTitleStore = document.title;
const documentTitleOnBlur = "😭 Please come back!";

// Set original title if user is on the site
window.addEventListener("focus", () => {
  document.title = documentTitleStore;
});

// If user leaves tab, set the alternative title
window.addEventListener("blur", () => {
  document.title = documentTitleOnBlur;
});

/* Check section for navbar color change */
function initCheckSectionThemeScroll() {

  // Get detection offset, in this case the navbar
  const navBarHeight = document.querySelector("[data-nav-bar-height]")
  const themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 0;

  function checkThemeSection() {
    const themeSections = document.querySelectorAll("[data-theme-section]");

    themeSections.forEach(function(themeSection) {
      const rect = themeSection.getBoundingClientRect();
      const themeSectionTop = rect.top;
      const themeSectionBottom = rect.bottom;

      // If the offset is between the top & bottom of the current section
      if (themeSectionTop <= themeObserverOffset && themeSectionBottom >= themeObserverOffset) {
        // Check [data-theme-section]
        const themeSectionActive = themeSection.getAttribute("data-theme-section");
        document.querySelectorAll("[data-theme-nav]").forEach(function(elem) {
          if (elem.getAttribute("data-theme-nav") !== themeSectionActive) {
            elem.setAttribute("data-theme-nav", themeSectionActive);
          }
        });

        // Check [data-bg-section]
        const bgSectionActive = themeSection.getAttribute("data-bg-section");
        document.querySelectorAll("[data-bg-nav]").forEach(function(elem) {
          if (elem.getAttribute("data-bg-nav") !== bgSectionActive) {
            elem.setAttribute("data-bg-nav", bgSectionActive);
          }
        });
      }
    });
  }

  function startThemeCheck() {
    document.addEventListener("scroll", checkThemeSection);
  }

  // Initial check and start listening for scroll
  checkThemeSection();
  startThemeCheck();
}

initCheckSectionThemeScroll();

/* Mobile Menu */
function initMobileMenu() {
  // Add debounced listener once
  if (!initMobileMenu._resized) {
    initMobileMenu._resized = true;
    window.addEventListener('resize', () => {
      clearTimeout(initMobileMenu._timer);
      initMobileMenu._timer = setTimeout(initMobileMenu, 200);
    });
  }

  // Mobile menu logic below
  if (window.innerWidth >= 768) return;

  const btn = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-menu-status]');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      nav.dataset.menuStatus = nav.dataset.menuStatus === 'open' ? 'closed' : 'open';
    });
  }

  const toggles = Array.from(document.querySelectorAll('[data-dropdown-toggle]'));
  toggles.forEach(t => {
    t.addEventListener('click', () => {
      const isOpen = t.dataset.dropdownToggle === 'open';
      toggles.forEach(other => {
        if (other !== t) {
          other.dataset.dropdownToggle = 'closed';
          if (other === document.activeElement) other.blur();
        }
      });
      t.dataset.dropdownToggle = isOpen ? 'closed' : 'open';
      if (isOpen && t === document.activeElement) t.blur();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
});


/* Scaling Video on Scroll */
function initFlipOnScroll() {
  let wrapperElements = document.querySelectorAll("[data-flip-element='wrapper']");
  let targetEl = document.querySelector("[data-flip-element='target']");

  let tl;
  function flipTimeline() {
    if (tl) {
      tl.kill();
      gsap.set(targetEl, { clearProps: "all" });
    }
    
    // Use the first and last wrapper elements for the scroll trigger.
    tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapperElements[0],
        start: "top 75%",
        endTrigger: wrapperElements[wrapperElements.length - 1],
        end: "center 75%",
        scrub: 0.25
      }
    });
    
    // Loop through each wrapper element.
    wrapperElements.forEach(function(element, index) {
      let nextIndex = index + 1;
      if (nextIndex < wrapperElements.length) {
        let nextWrapperEl = wrapperElements[nextIndex];
        // Calculate vertical center positions relative to the document.
        let nextRect = nextWrapperEl.getBoundingClientRect();
        let thisRect = element.getBoundingClientRect();
        let nextDistance = nextRect.top + window.pageYOffset + nextWrapperEl.offsetHeight / 2;
        let thisDistance = thisRect.top + window.pageYOffset + element.offsetHeight / 2;
        let offset = nextDistance - thisDistance;
        // Add the Flip.fit tween to the timeline.
        tl.add(
          Flip.fit(targetEl, nextWrapperEl, {
            duration: offset,
            ease: "none",
            borderRadius: 0,
          })
        );
      }
    });
  }

  flipTimeline();

  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      flipTimeline();
    }, 100);
  });
}

initFlipOnScroll();

/* About images reveal */
// const images = gsap.utils.toArray('.about-img');
// const imagesToAnimate = images.slice(1);

// const timeline = gsap.timeline({
//   scrollTrigger: {
//     trigger: ".about-container",
//     start: "15% center",
//     end: "bottom center",
//     toggleActions: "play reverse play reverse",
//   }
// });

// imagesToAnimate.forEach((img, index) => {
//   const rotation = index % 3 === 0 ? 6 : -6;

//   gsap.set(img, {
//     scale: 0,
//     rotate: rotation,
//     transformOrigin: "center center"
//   });

//   timeline.to(img, {
//     scale: 1,
//     rotate: 0,
//     ease: "expo.out",
//     duration: 1
//   }, index);
// });

/* Projects Video on Hover */
function initPlayVideoHover() {
  const wrappers = document.querySelectorAll('[data-video-on-hover]');

  wrappers.forEach(wrapper => {
    const video = wrapper.querySelector('video');
    const src = wrapper.getAttribute('data-video-src') || '';
    if (!video || !src) return;

    wrapper.addEventListener('mouseenter', () => {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', src);
      }
      wrapper.dataset.videoOnHover = 'active';
      video.play().catch(err => {
        console.warn('play on hover is blocked:', err);
      });
    });

    wrapper.addEventListener('mouseleave', () => {
      wrapper.dataset.videoOnHover = 'not-active';
      setTimeout(() => {
        video.pause();
        video.currentTime = 0;
      }, 200);
    });
  });
}

initPlayVideoHover();

/* Cursor */
function initCursorMarqueeEffect() {
  const hoverOutDelay = 0.4;
  const followDuration = 0.6;
  const speedMultiplier = 5;

  const cursor = document.querySelector('[data-cursor-marquee-status]');
  if (!cursor) return;
  const targets = cursor.querySelectorAll('[data-cursor-marquee-text-target]');

  const xTo = gsap.quickTo(cursor, 'x', { duration: followDuration, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: followDuration, ease: 'power3' });

  let pauseTimeout = null;
  let activeEl = null;
  let lastX = 0;
  let lastY = 0;

  function playFor(el) {
    if (!el) return;
    if (pauseTimeout) clearTimeout(pauseTimeout);
    const text = el.getAttribute('data-cursor-marquee-text') || '';
    const sec = (text.length || 1) / speedMultiplier;
    targets.forEach(t => {
      t.textContent = text;
      t.style.animationPlayState = 'running';
      t.style.animationDuration = sec + 's';
    });
    cursor.setAttribute('data-cursor-marquee-status', 'active');
    activeEl = el;
  }

  function pauseLater() {
    cursor.setAttribute('data-cursor-marquee-status', 'not-active');
    if (pauseTimeout) clearTimeout(pauseTimeout);
    pauseTimeout = setTimeout(() => {
      targets.forEach(t => {
        t.style.animationPlayState = 'paused';
      });
    }, hoverOutDelay * 1000);
    activeEl = null;
  }

  function checkTarget() {
    const el = document.elementFromPoint(lastX, lastY);
    const hit = el && el.closest('[data-cursor-marquee-text]');
    if (hit !== activeEl) {
      if (activeEl) pauseLater();
      if (hit) playFor(hit);
    }
  }

  window.addEventListener('pointermove', e => {
    lastX = e.clientX;
    lastY = e.clientY;
    xTo(lastX);
    yTo(lastY);
    checkTarget();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    xTo(lastX);
    yTo(lastY);
    checkTarget();
  }, { passive: true });

  setTimeout(() => {
    cursor.setAttribute('data-cursor-marquee-status', 'not-active');
  }, 500);
}

initCursorMarqueeEffect();

/* Process Tabs */
function initAccordionCSS() {
  const applyMobileBehavior = () => {
    document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
      accordion.querySelectorAll('[data-accordion-status]').forEach((item) => {
        item.setAttribute('data-accordion-status', 'active');
        item.style.border = ''; // reset to default border
      });
    });
  };

  const applyDesktopBehavior = () => {
    document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
      const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

      const updateSiblingBorders = () => {
        const items = Array.from(accordion.querySelectorAll('[data-accordion-status]'));

        // Reset all borders
        items.forEach(item => {
          item.style.border = '';
        });

        // Find the active item
        const activeIndex = items.findIndex(
          item => item.getAttribute('data-accordion-status') === 'active'
        );

        if (activeIndex > 0) {
          const previousItem = items[activeIndex - 1];
          previousItem.style.border = 'none';
        }
      };

      accordion.querySelectorAll('[data-accordion-toggle]').forEach((toggle) => {
        const singleAccordion = toggle.closest('[data-accordion-status]');
        if (!singleAccordion) return;

        toggle.addEventListener('mouseenter', () => {
          singleAccordion.setAttribute('data-accordion-status', 'active');

          if (closeSiblings) {
            accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
              if (sibling !== singleAccordion) {
                sibling.setAttribute('data-accordion-status', 'not-active');
              }
            });
          }

          updateSiblingBorders();
        });

        toggle.addEventListener('mouseleave', () => {
          singleAccordion.setAttribute('data-accordion-status', 'not-active');
          updateSiblingBorders();
        });
      });
    });
  };

  const handleResize = () => {
    if (window.innerWidth < 991) {
      applyMobileBehavior();
    } else {
      applyDesktopBehavior();
    }
  };

  // Run once on load
  handleResize();

  // Run on resize
  window.addEventListener('resize', handleResize);
}

initAccordionCSS();



/* Marquee */
function initCSSMarquee() {
  const pixelsPerSecond = 75; // Set the marquee speed (pixels per second)
  const marquees = document.querySelectorAll('[data-css-marquee]');
  
  // Duplicate each [data-css-marquee-list] element inside its container
  marquees.forEach(marquee => {
    marquee.querySelectorAll('[data-css-marquee-list]').forEach(list => {
      const duplicate = list.cloneNode(true);
      marquee.appendChild(duplicate);
    });
  });

  // Create an IntersectionObserver to check if the marquee container is in view
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.querySelectorAll('[data-css-marquee-list]').forEach(list => 
        list.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused'
      );
    });
  }, { threshold: 0 });
  
  // Calculate the width and set the animation duration accordingly
  marquees.forEach(marquee => {
    marquee.querySelectorAll('[data-css-marquee-list]').forEach(list => {
      list.style.animationDuration = (list.offsetWidth / pixelsPerSecond) + 's';
      list.style.animationPlayState = 'paused';
    });
    observer.observe(marquee);
  });
}

initCSSMarquee();

/* Image Trail */
function initImageTrail(config = {}) {

  // config + defaults
  const options = {
    minWidth: config.minWidth ?? 992,
    moveDistance: config.moveDistance ?? 15,
    stopDuration: config.stopDuration ?? 300,
    trailLength: config.trailLength ?? 5
  };

  const wrapper = document.querySelector('[data-trail="wrapper"]');
  
  if (!wrapper || window.innerWidth < options.minWidth) {
    return;
  }
  
  // State management
  const state = {
    trailInterval: null,
    globalIndex: 0,
    last: { x: 0, y: 0 },
    trailImageTimestamps: new Map(),
    trailImages: Array.from(document.querySelectorAll('[data-trail="item"]')),
    isActive: false
  };

  // Utility functions
  const MathUtils = {
    lerp: (a, b, n) => (1 - n) * a + n * b,
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
  };

  function getRelativeCoordinates(e, rect) {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function activate(trailImage, x, y) {
    if (!trailImage) return;

    // Define how far the image will drift away from the cursor
    const PUSH_AMOUNT = 50; // You can adjust this value

    // --- Calculate direction ---
    const dx = x - state.last.x;
    const dy = y - state.last.y;
    const distance = Math.hypot(dx, dy);
    const directionX = distance > 0 ? dx / distance : 0;
    const directionY = distance > 0 ? dy / distance : 0;
    // --- End calculation ---

    const rect = trailImage.getBoundingClientRect();
    const styles = {
      left: `${x - rect.width / 2}px`,
      top: `${y - rect.height / 2}px`,
      zIndex: state.globalIndex,
      //display: 'block'
    };

    Object.assign(trailImage.style, styles);
    state.trailImageTimestamps.set(trailImage, Date.now());

    // Here, animate how the images will appear!
    gsap.fromTo(
      trailImage,
      { // FROM state
        autoAlpha: 0,
        scale: 0,
        rotation: 0,
        x: 0,
        y: 0
      },
      { // TO state
        scale: 1,
        autoAlpha: 1,
        duration: 0.8,
        rotation: (Math.random() - 0.5) * 40,
        //rotation: -12,
        ease: "expo.out",
        overwrite: true,
        // Add the drift animation
        x: directionX * PUSH_AMOUNT,
        y: directionY * PUSH_AMOUNT
      }
    );

    state.last = { x, y };
  }

  function fadeOutTrailImage(trailImage) {
    if (!trailImage) return;
    
    // Here, animate how the images will disappear!
    gsap.to(trailImage, {
      opacity: 0,
      scale: 0.2,
      duration: 0.6,
      ease: "expo.out",
      onComplete: () => {
        gsap.set(trailImage, { autoAlpha: 0 });
      }
    });
  }

  function handleOnMove(e) {
    if (!state.isActive) return;

    const rectWrapper = wrapper.getBoundingClientRect();
    const { x: relativeX, y: relativeY } = getRelativeCoordinates(e, rectWrapper);
    
    const distanceFromLast = MathUtils.distance(
      relativeX, 
      relativeY, 
      state.last.x, 
      state.last.y
    );

    if (distanceFromLast > window.innerWidth / options.moveDistance) {
      const lead = state.trailImages[state.globalIndex % state.trailImages.length];
      const tail = state.trailImages[(state.globalIndex - options.trailLength) % state.trailImages.length];

      activate(lead, relativeX, relativeY);
      fadeOutTrailImage(tail);
      state.globalIndex++;
    }
  }

  function cleanupTrailImages() {
    const currentTime = Date.now();
    for (const [trailImage, timestamp] of state.trailImageTimestamps.entries()) {
      if (currentTime - timestamp > options.stopDuration) {
        fadeOutTrailImage(trailImage);
        state.trailImageTimestamps.delete(trailImage);
      }
    }
  }

  function startTrail() {
    if (state.isActive) return;
    
    state.isActive = true;
    wrapper.addEventListener("mousemove", handleOnMove);
    state.trailInterval = setInterval(cleanupTrailImages, 100);
  }

  function stopTrail() {
    if (!state.isActive) return;
    
    state.isActive = false;
    wrapper.removeEventListener("mousemove", handleOnMove);
    clearInterval(state.trailInterval);
    state.trailInterval = null;
    
    // Clean up remaining trail images
    state.trailImages.forEach(fadeOutTrailImage);
    state.trailImageTimestamps.clear();
  }

  // Initialize ScrollTrigger
  ScrollTrigger.create({
    trigger: wrapper,
    start: "top bottom",
    end: "bottom top",
    onEnter: startTrail,
    onEnterBack: startTrail,
    onLeave: stopTrail,
    onLeaveBack: stopTrail
  });

  // Clean up on window resize
  const handleResize = () => {
    if (window.innerWidth < options.minWidth && state.isActive) {
      stopTrail();
    } else if (window.innerWidth >= options.minWidth && !state.isActive) {
      startTrail();
    }
  };

  window.addEventListener('resize', handleResize);

  return () => {
    stopTrail();
    window.removeEventListener('resize', handleResize);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const imageTrail = initImageTrail({
    minWidth: 992,
    moveDistance: 15,
    stopDuration: 800,
    trailLength: 8
  });
});

/* Current Time */
function initDynamicCurrentTime() {
  const defaultTimezone = "Europe/Lisbon";

  // Helper function to format numbers with leading zero
  const formatNumber = (number) => number.toString().padStart(2, '0');

  // Function to create a time formatter with the correct timezone
  const createFormatter = (timezone) => {
    return new Intl.DateTimeFormat([], {
      timeZone: timezone,
      timeZoneName: 'short',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Optional: Remove to match your simpler script
    });
  };

  // Function to parse the formatted string into parts
  const parseFormattedTime = (formattedDateTime) => {
    const match = formattedDateTime.match(/(\d+):(\d+):(\d+)\s*([\w+]+)/);
    if (match) {
      return {
        hours: match[1],
        minutes: match[2],
        seconds: match[3],
        timezone: match[4], // Handles both GMT+X and CET cases
      };
    }
    return null;
  };

  // Function to update the time for all elements
  const updateTime = () => {
    document.querySelectorAll('[data-current-time]').forEach((element) => {
      const timezone = element.getAttribute('data-current-time') || defaultTimezone;
      const formatter = createFormatter(timezone);
      const now = new Date();
      const formattedDateTime = formatter.format(now);

      const timeParts = parseFormattedTime(formattedDateTime);
      if (timeParts) {
        const {
          hours,
          minutes,
          seconds,
          timezone
        } = timeParts;

        // Update child elements if they exist
        const hoursElem = element.querySelector('[data-current-time-hours]');
        const minutesElem = element.querySelector('[data-current-time-minutes]');
        const secondsElem = element.querySelector('[data-current-time-seconds]');
        const timezoneElem = element.querySelector('[data-current-time-timezone]');

        if (hoursElem) hoursElem.textContent = hours;
        if (minutesElem) minutesElem.textContent = minutes;
        if (secondsElem) secondsElem.textContent = seconds;
        if (timezoneElem) timezoneElem.textContent = timezone;
      }
    });
  };

  // Initial update and interval for subsequent updates
  updateTime();
  setInterval(updateTime, 1000);
}


initDynamicCurrentTime();

if (page === "404") {

function initConfettiExplosion(x, y) {
  const dotCount = gsap.utils.random(10, 20, 1);
  const colors   = ["#2960F7", "#1e1e1e", "#858585", "#2960F7"];
  const container = document.querySelector('[data-minigame-init]');

  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    container.appendChild(dot);

    gsap.set(dot, {
      left:  `${x}px`,
      top:   `${y}px`,
      scale: 0,
      backgroundColor: gsap.utils.random(colors)
    });

    gsap.timeline({ onComplete: () => dot.remove() })
      .to(dot, {
        scale:    gsap.utils.random(0.3, 1),
        duration: 0.3,
        ease:     "power3.out"
      })
      .to(dot, {
        duration: 2,
        physics2D: {
          velocity: gsap.utils.random(500, 1000),
          angle:    gsap.utils.random(0, 360),
          gravity:  500
        },
        autoAlpha: 0,
        ease:      "none"
      }, "<");
  }
}

function init404Minigame() {
  const CONFIG = {
    dragToVelocityRatio: 0.01,
    inertiaResistance:   20,
    pullReset:           { duration: 0.8, ease: 'elastic.out(1,0.5)' },
    rocketFadeOut:       { duration: 0.5 },
    maxSpeed:            2000,
    flyMinDuration:      1.5,
    flyMaxDuration:      3,
    flyRotateDuration:   1
  };

  const container     = document.querySelector('[data-minigame-init]');
  const pull          = container.querySelector('[data-minigame-pull]');
  const rocket        = container.querySelector('[data-minigame-rocket]');
  const line          = container.querySelector('[data-minigame-line]');
  const statusEl      = container.querySelector('[data-minigame-status]');
  const scoreTimeSpan = container.querySelector('[data-minigame-score-time]');
  const resetButton   = container.querySelector('[data-minigame-reset]');
  const flies         = Array.from(container.querySelectorAll('[data-minigame-fly]'));

  let dragStart, rocketTween, isFlying = false;
  let containerRect, origin;
  let startTime = null;

  const rawTargets = [
    ...container.querySelectorAll('[data-minigame-target]'),
    ...flies
  ];
  const allTargets = rawTargets.filter(el => el && window.getComputedStyle(el).display !== 'none');
  const totalTargets = allTargets.length;
  console.log(`🎯 Targets on load: ${totalTargets}`);
  const hitTargets   = new Set();
  const flyTweens    = new Map();

  function resetGame() {
    hitTargets.clear();
    allTargets.forEach(el => {
      el.style.visibility    = '';
      el.style.opacity       = '';
      el.style.pointerEvents = '';
    });

    startTime = null;
    statusEl.setAttribute('data-minigame-status','ready');
    scoreTimeSpan.textContent = '0.00';

    gsap.set([pull, rocket, line], {
      clearProps: 'all',
      x: 0, y: 0,
      opacity: 1,
      rotation: 0
    });
    isFlying = false;
    if (rocketTween) rocketTween.kill();

    containerRect = container.getBoundingClientRect();

    flies.forEach(fly => {
      if (flyTweens.has(fly)) flyTweens.get(fly).kill();

      const maxX = containerRect.width  - fly.offsetWidth;
      const maxY = containerRect.height - fly.offsetHeight;
      const startX = gsap.utils.random(0, maxX);
      const startY = gsap.utils.random(0, maxY);

      gsap.set(fly, { clearProps: 'x,y,rotation' });
      fly.style.left      = `${startX}px`;
      fly.style.top       = `${startY}px`;
      fly.style.transform = 'rotate(0deg)';

      moveFly(fly);
    });
  }

  resetButton.addEventListener('click', () => {
    console.log('🔄 Resetting game');
    resetGame();
  });
  resetGame();

  function moveFly(fly) {
    const maxX = containerRect.width  - fly.offsetWidth;
    const maxY = containerRect.height - fly.offsetHeight;
    const newX = gsap.utils.random(0, maxX);
    const newY = gsap.utils.random(0, maxY);

    const cur = fly.getBoundingClientRect();
    const curX = cur.left - containerRect.left;
    const curY = cur.top  - containerRect.top;
    const dx = newX - curX;
    const dy = newY - curY;
    const targetAngle = Math.atan2(dy, dx) * 180 / Math.PI + 90;

    gsap.to(fly, {
      rotation: targetAngle,
      duration: CONFIG.flyRotateDuration,
      ease:     'elastic.out(1,0.75)'
    });

    const tween = gsap.to(fly, {
      left:     `${newX}px`,
      top:      `${newY}px`,
      duration: gsap.utils.random(CONFIG.flyMinDuration, CONFIG.flyMaxDuration),
      ease:     'power1.inOut',
      onComplete: () => moveFly(fly)
    });
    flyTweens.set(fly, tween);
  }

  function rectsOverlap(r1, r2) {
    return !(
      r2.left   > r1.right ||
      r2.right  < r1.left  ||
      r2.top    > r1.bottom||
      r2.bottom < r1.top
    );
  }

  function onRocketUpdate() {
    const rRect = rocket.getBoundingClientRect();
    const cRect = containerRect;
    if (
      rRect.right  < cRect.left   ||
      rRect.left   > cRect.right  ||
      rRect.bottom < cRect.top    ||
      rRect.top    > cRect.bottom
    ) {
      rocketTween.kill();
      isFlying = false;
      gsap.set(rocket, { opacity: 0 });
      return;
    }
    for (let t of allTargets) {
      if (hitTargets.has(t)) continue;
      const tRect = t.getBoundingClientRect();
      if (rectsOverlap(rRect, tRect)) {
        hitTargets.add(t);
        console.log(`🏹 Hit ${hitTargets.size}/${totalTargets}`);
        if (flies.includes(t) && flyTweens.has(t)) flyTweens.get(t).kill();
        explodeTarget(t, tRect);
        onHit();
        break;
      }
    }
  }

  function onHit() {
    if (hitTargets.size === totalTargets) {
      console.log('✅ All targets hit!');
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      statusEl.setAttribute('data-minigame-status','finished');
      scoreTimeSpan.textContent = elapsed;
    }
  }

  function explodeTarget(el, tRect) {
    gsap.to(el, {
      scale:    0.95,
      opacity:  0.1,
      duration: 0.2,
      pointerEvents: 'none'
    });
    const cx = tRect.left + tRect.width/2  + window.scrollX;
    const cy = tRect.top  + tRect.height/2 + window.scrollY;
    initConfettiExplosion(cx, cy);
  }

  Draggable.create(pull, {
    type: 'x,y',
    bounds: container,

    onPress() {
      if (isFlying) return this.endDrag();
      if (!startTime) {
        startTime = Date.now();
        statusEl.setAttribute('data-minigame-status','running');
      }
      if (rocketTween) { rocketTween.kill(); isFlying = false; }
      gsap.set(rocket, { clearProps:'all', x:0, y:0, opacity:0, rotation:0 });

      containerRect         = container.getBoundingClientRect();
      this.hasDraggedEnough = false;

      const rb = rocket.getBoundingClientRect();
      origin = {
        x: (rb.left + rb.width/2) - containerRect.left,
        y: (rb.top  + rb.height/2) - containerRect.top
      };

      Object.assign(line.style, {
        left:            `${origin.x}px`,
        top:             `${origin.y}px`,
        width:           '0px',
        transform:       'rotate(0deg)',
        transformOrigin: '0 50%',
        opacity:         '0'
      });

      const pr = pull.getBoundingClientRect();
      dragStart = {
        x: pr.left + pr.width/2,
        y: pr.top  + pr.height/2
      };
      pull.classList.add('is--drag');
      pull.style.cursor = 'grabbing';
    },

    onDrag() {
      const pr = pull.getBoundingClientRect();
      const px = (pr.left + pr.width/2) - containerRect.left;
      const py = (pr.top  + pr.height/2) - containerRect.top;
      const dx = px - origin.x, dy = py - origin.y;
      const len = Math.hypot(dx, dy);
      if (len >= 24) this.hasDraggedEnough = true;

      const ang = Math.atan2(dy, dx) * 180 / Math.PI;
      line.style.width     = `${len}px`;
      line.style.transform = `rotate(${ang}deg)`;
      line.style.opacity   = '1';
      gsap.set(pull, { rotation: ang - 90 });
    },

    onRelease() {
      pull.style.cursor = 'grab';
      pull.classList.remove('is--drag');

      if (!this.hasDraggedEnough || isFlying) {
        gsap.to(pull, { x:0, y:0, rotate:0, ...CONFIG.pullReset });
        gsap.to(line, { opacity:0, duration:0.2 });
        return;
      }

      gsap.to(line, { opacity:0, duration:0.2 });

      const pr   = pull.getBoundingClientRect();
      const dx0  = dragStart.x - (pr.left + pr.width/2);
      const dy0  = dragStart.y - (pr.top  + pr.height/2);
      const avg  = (containerRect.width + containerRect.height)/2;
      const scale= CONFIG.dragToVelocityRatio * avg;
      let vx = dx0 * scale, vy = dy0 * scale;
      const speed = Math.hypot(vx, vy);
      if (speed > CONFIG.maxSpeed) {
        const f = CONFIG.maxSpeed/speed;
        vx *= f; vy *= f;
      }

      const launchAngle = Math.atan2(vy, vx) * 180 / Math.PI;
      gsap.set(rocket, { rotation: launchAngle + 90 });
      gsap.to(pull, { x:0, y:0, rotate:0, ...CONFIG.pullReset });
      gsap.set(rocket, { x:0, y:0, opacity:1 });
      isFlying = true;

      rocketTween = gsap.to(rocket, {
        inertia: {
          x: { velocity: vx },
          y: { velocity: vy },
          resistance: CONFIG.inertiaResistance
        },
        onUpdate: onRocketUpdate,
        onComplete: () => {
          isFlying = false;
          gsap.to(rocket, { opacity:0, duration: CONFIG.rocketFadeOut.duration });
        }
      });
    }
  });
}

// Initialize 404 Error Minigame
init404Minigame();
}