import './styles/style.css'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger, Flip);

//console.log(THREE)

/* Gradient Three.js */
const containers = document.querySelectorAll('.canvas');
if (!containers.length) throw new Error("No shader-container elements found.");

containers.forEach(container => {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const vertexShader = `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec2 iResolution;
        uniform float iTime;
        uniform vec2 iMouse;
        uniform float ANIMATION_SPEED;
        uniform float WAVE_INTENSITY;
        uniform float WAVE_COMPLEXITY;
        uniform float ROTATION_SPEED;
        uniform float ROTATION_AMOUNT;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform float BLEND_SOFTNESS;
        uniform float TEXTURE_INTENSITY;
        uniform float TEXTURE_SCALE;

        mat2 rotate(float angle) {
            float c = cos(angle);
            float s = sin(angle);
            return mat2(c, -s, s, c);
        }

        vec2 hash22(vec2 p) {
            p = vec2(dot(p, vec2(157.13, 113.47)), dot(p, vec2(271.19, 419.23)));
            return fract(sin(p) * 19371.5813);
        }

        float customNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            float a = dot(hash22(i) - 0.5, f);
            float b = dot(hash22(i + vec2(1.0, 0.0)) - 0.5, f - vec2(1.0, 0.0));
            float c = dot(hash22(i + vec2(0.0, 1.0)) - 0.5, f - vec2(0.0, 1.0));
            float d = dot(hash22(i + vec2(1.0, 1.0)) - 0.5, f - vec2(1.0, 1.0));
            return 0.5 + mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        float blend(float edge0, float edge1, float x) {
            float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
            return t * t * (3.0 - 2.0 * t);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / iResolution.xy;
            vec2 coord = uv - 0.5;
            coord.x *= iResolution.x / iResolution.y;
            float rotationNoise = customNoise(vec2(iTime * 0.05 * ANIMATION_SPEED * ROTATION_SPEED, coord.x * coord.y * 1.5));
            coord *= rotate((rotationNoise - 0.5) * 4.0 * ROTATION_AMOUNT + iTime * 0.06 * ANIMATION_SPEED * ROTATION_SPEED);
            float waveTime = iTime * 0.8 * ANIMATION_SPEED;
            float mouseInfluenceX = iMouse.x * 5.0;
            float mouseInfluenceY = iMouse.y * 5.0;
            float freq1 = 2.5 * WAVE_COMPLEXITY;
            float freq2 = 3.2 * WAVE_COMPLEXITY;
            coord.x += sin(coord.y * freq1 + waveTime + mouseInfluenceX) * 0.15 * WAVE_INTENSITY;
            coord.y += cos(coord.x * freq2 + waveTime * 1.3 + mouseInfluenceY) * 0.12 * WAVE_INTENSITY;
            coord.x += sin(coord.y * freq2 * 0.6 + waveTime * 2.7 - mouseInfluenceY) * 0.08 * WAVE_INTENSITY;
            coord.y += cos(coord.x * freq1 * 1.8 + waveTime * 1.1 - mouseInfluenceX) * 0.06 * WAVE_INTENSITY;
            float blendRange = 0.7 * BLEND_SOFTNESS;
            float zone1 = blend(-blendRange, blendRange, (coord * rotate(0.3)).x);
            vec3 horizontalBlend = mix(uColor1, uColor2, zone1);
            float zone2 = blend(-blendRange, blendRange, (coord * rotate(-0.2)).x);
            vec3 horizontalBlend2 = mix(uColor3, uColor4, zone2);
            float verticalZone = blend(0.3 * BLEND_SOFTNESS, -0.5 * BLEND_SOFTNESS, coord.y + sin(coord.x * 2.0) * 0.2);
            vec3 finalColor = mix(horizontalBlend, horizontalBlend2, verticalZone);
            float texture1 = customNoise(coord * 6.0 * TEXTURE_SCALE + iTime * 0.03 * ANIMATION_SPEED) * 0.04 * TEXTURE_INTENSITY;
            float texture2 = customNoise(coord * 12.0 * TEXTURE_SCALE - iTime * 0.02 * ANIMATION_SPEED) * 0.02 * TEXTURE_INTENSITY;
            finalColor += texture1 + texture2;
            finalColor = pow(finalColor, vec3(0.85));
            finalColor = clamp(finalColor, 0.0, 1.0);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    const uniforms = {
        iTime: { value: 0.0 },
        iResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
        iMouse: { value: new THREE.Vector2(0.0, 0.0) },
        ANIMATION_SPEED: { value: 2.0 },
        WAVE_INTENSITY:  { value: 1.0 },
        WAVE_COMPLEXITY: { value: 1.0 },
        ROTATION_SPEED:  { value: 1.0 },
        ROTATION_AMOUNT: { value: 0.5 },
        uColor1: { value: new THREE.Color('#141416') },
        uColor2: { value: new THREE.Color('#2847AD') },
        uColor3: { value: new THREE.Color('#2960F7') },
        uColor4: { value: new THREE.Color('#2960F7') },
        BLEND_SOFTNESS:  { value: 2.0 },
        TEXTURE_INTENSITY: { value: 0 },
        TEXTURE_SCALE:   { value: .0 },
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        uniforms.iTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
    }
    animate();

    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = -((event.clientY - rect.top) / rect.height - 0.5);
        uniforms.iMouse.value.set(x, y);
    });

    const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
            const { width, height } = entry.contentRect;
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            uniforms.iResolution.value.set(width, height);
        }
    });

    resizeObserver.observe(container);
});


/* End of Three.js */

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
            ease: "none"
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
const images = gsap.utils.toArray('.about-img');
const imagesToAnimate = images.slice(1);

const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: ".about-container",
    start: "15% center",
    end: "bottom center",
    toggleActions: "play reverse play reverse",
  }
});

imagesToAnimate.forEach((img, index) => {
  const rotation = index % 2 === 0 ? 6 : -6;

  gsap.set(img, {
    scale: 0,
    rotate: rotation,
    transformOrigin: "center center"
  });

  timeline.to(img, {
    scale: 1,
    rotate: 0,
    ease: "expo.out",
    duration: 1
  }, index);
});

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

/* Process Tabs */
function initAccordionCSS() {
  document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

    accordion.querySelectorAll('[data-accordion-toggle]').forEach((toggle) => {
      const singleAccordion = toggle.closest('[data-accordion-status]');
      if (!singleAccordion) return;

      toggle.addEventListener('mouseenter', () => {
        singleAccordion.setAttribute('data-accordion-status', 'active');

        // Close siblings if enabled
        if (closeSiblings) {
          accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
            if (sibling !== singleAccordion) sibling.setAttribute('data-accordion-status', 'not-active');
          });
        }
      });

      toggle.addEventListener('mouseleave', () => {
        singleAccordion.setAttribute('data-accordion-status', 'not-active');
      });
    });
  });
}

initAccordionCSS();

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

    const rect = trailImage.getBoundingClientRect();
    const styles = {
      left: `${x - rect.width / 2}px`,
      top: `${y - rect.height / 2}px`,
      zIndex: state.globalIndex,
      display: 'block'
    };

    Object.assign(trailImage.style, styles);
    state.trailImageTimestamps.set(trailImage, Date.now());

	// Here, animate how the images will appear!
    gsap.fromTo(
      trailImage,
      { autoAlpha: 0, scale: 0.8 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 0.2,
        overwrite: true
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
      duration: 0.8,
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
    stopDuration: 350,
    trailLength: 8
  });
});