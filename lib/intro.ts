/** Set for the rest of the tab's visit once the intro loader has played. */
export const INTRO_SEEN_KEY = "celcius:intro-seen";

/**
 * Runs before the page paints (inlined in layout.tsx): if the intro already
 * played in this tab, mark <html> so CSS hides the loader without a flash.
 */
export const introSeenScript = `try{if(sessionStorage.getItem(${JSON.stringify(
  INTRO_SEEN_KEY,
)}))document.documentElement.dataset.intro="seen"}catch(e){}`;
