"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    hcaptcha: any;
    onloadHCaptchaCallback: () => void;
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
  const widgetIdRef = useRef<any>(null);

  useEffect(() => {
    if (window.hcaptcha) {
      setLoaded(true);
      return;
    }

    // Check if script is already injected
    let script = document.querySelector('script[src*="hcaptcha.com/1/api.js"]') as HTMLScriptElement;

    if (script) {
      // If script is already in document but window.hcaptcha is not ready yet, wait for it
      const checkInterval = setInterval(() => {
        if (window.hcaptcha) {
          setLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    } else {
      // Inject script explicitly
      script = document.createElement("script");
      script.src = "https://js.hcaptcha.com/1/api.js?onload=onloadHCaptchaCallback&render=explicit";
      script.async = true;
      script.defer = true;
      
      window.onloadHCaptchaCallback = () => {
        setLoaded(true);
      };

      document.body.appendChild(script);
    }
  }, []);

  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.hcaptcha) return;

    // VERY IMPORTANT: Clear any previous elements to avoid "Only one captcha is permitted per parent container"
    containerRef.current.innerHTML = "";

    try {
      const widgetId = window.hcaptcha.render(containerRef.current, {
        sitekey,
        theme: "dark",
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => {
          if (onExpireRef.current) onExpireRef.current();
        },
      });
      widgetIdRef.current = widgetId;
    } catch (e) {
      console.warn("hCaptcha render warning:", e);
    }

    return () => {
      if (window.hcaptcha && widgetIdRef.current !== null) {
        try {
          window.hcaptcha.reset(widgetIdRef.current);
        } catch (e) {
          // Ignore
        }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [loaded, sitekey]);

  return (
    <div className="flex justify-center my-4 min-h-[78px]">
      <div ref={containerRef} />
    </div>
  );
}
