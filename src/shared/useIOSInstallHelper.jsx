import { useEffect, useState } from "react";

export function useIOSInstallHelper() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isIOS && !isInStandaloneMode) {
      const dismissed = localStorage.getItem(
        "ios-install-dismissed"
      );

      if (!dismissed) {
        setShow(true);
      }
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("ios-install-dismissed", "true");
    setShow(false);
  };

  return { show, dismiss };
}
