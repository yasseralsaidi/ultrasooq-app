"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const GoogleTranslate = () => {
  useEffect(() => {
    if (!document.querySelector("script[src*='translate.google.com']")) {
      // Define the function before script loads
      (window as any).googleTranslateElementInit = function () {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ar",
          },
          "google_translate_element"
        );
      };

      // Create the script element dynamically
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      const translateContainer = document.getElementById("google_translate_element");
      if (translateContainer) {
        translateContainer.innerHTML = "";
      }
    };
  }, []);

  return <div id="google_translate_element" className="m-2 hidden"></div>;
};

export default GoogleTranslate;
