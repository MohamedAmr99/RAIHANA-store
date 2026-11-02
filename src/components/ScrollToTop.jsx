import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // When pushing or replacing, always go to the top
    if (navType !== "POP") {
      // Small timeout to allow AnimatePresence delay
      setTimeout(() => window.scrollTo(0, 0), 10);
    } else {
      const savedPosition = sessionStorage.getItem(`scrollPos-${location.key}`);
      if (savedPosition) {
        const targetScroll = parseInt(savedPosition, 10);
        // AnimatePresence mode="wait" means the new page DOES NOT physically render 
        // until the old page's 500ms exit animation perfectly completes.
        // We will assert the scroll position steadily until the 
        // animations have finished painting the actual height to the browser.
        let attempts = 0;
        const intervalId = setInterval(() => {
          attempts++;
          window.scrollTo({ top: targetScroll, behavior: "instant" });
          if (attempts > 20) {
            clearInterval(intervalId); // Stop after 1000ms
          }
        }, 50);
      }
    }
  }, [location.pathname, location.key, navType]);

  useEffect(() => {
    // Continually save the user's vertical scroll position tied specifically to this history key.
    // If they press back, we will know exactly where they were for this specific page visit!
    let scrollTimeout;
    
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        sessionStorage.setItem(`scrollPos-${location.key}`, window.scrollY.toString());
      }, 100); // Throttled to avoid performance hits
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [location.key]);

  return null;
};

export default ScrollToTop;
