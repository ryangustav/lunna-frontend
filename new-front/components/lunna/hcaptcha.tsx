"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    hcaptcha: any;
  }
}

interface HCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function HCaptcha({ onVerify, onExpire }: HCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const sitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-ffffffffffff";

  useEffect(() => {
    if (window.hcaptcha) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.hcaptcha.com/1/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Optional cleanup of script if wanted, but generally script is fine to persist
    };
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.hcaptcha) return;

    const widgetId = window.hcaptcha.render(containerRef.current, {
      sitekey,
      theme: "dark",
      callback: (token: string) => onVerify(token),
      "expired-callback": () => {
        if (onExpire) onExpire();
      },
    });

    return () => {
      if (window.hcaptcha && widgetId !== undefined) {
        try {
          window.hcaptcha.reset(widgetId);
        } catch (e) {
          // Ignore reset errors on unmount
        }
      }
    };
  }, [loaded, sitekey, onVerify, onExpire]);

  return (
    <div className="flex justify-center my-4 min-h-[78px]">
      <div ref={containerRef} />
    </div>
  );
}
