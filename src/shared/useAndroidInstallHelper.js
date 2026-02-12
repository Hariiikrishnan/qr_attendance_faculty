import { useEffect, useState } from "react";

export function useAndroidInstallHelper() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isAndroid =
      /android/i.test(navigator.userAgent);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches;

    if (isAndroid && !isStandalone) {
      const dismissed = localStorage.getItem(
        "android-install-dismissed"
      );

      if (!dismissed) {
        setShow(true);
      }
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("android-install-dismissed", "true");
    setShow(false);
  };

  return { show, dismiss };
}
