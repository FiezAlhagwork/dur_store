/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const SPLASH_DELAY = 2200;
const EXIT_DURATION = 1200;

const curveEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);

    const body = document.body;
    body.style.overflow = "hidden";

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, SPLASH_DELAY);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(hideTimer);
    };
  }, []);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} Z`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} 0 Q${dimension.width / 2} 0 0 0 Z`;

  const curveAnimation = {
    initial: { d: initialPath },
    exit: {
      d: targetPath,
      transition: {
        duration: EXIT_DURATION / 1000,
        ease: curveEase,
      },
    },
  };

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        document.body.style.overflow = "";
        if (onComplete) onComplete();
      }}
    >
      {isVisible && (
        <motion.div
          key="preloader"
          exit={{
            y: "-100%",
            transition: {
              duration: EXIT_DURATION / 1000,
              ease: curveEase,
            },
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-second pointer-events-auto"
        >
          <div className="absolute inset-0 pointer-events-none z-0" />

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              y: -40,
              transition: { duration: 0.5, ease: "easeIn" },
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 flex items-center justify-center"
          >
            <Image
              src="/erer.png"
              alt="Brand logo"
              width={130}
              height={130}
              priority
            />
          </motion.div>

          {dimension.height > 0 && (
            <svg className="absolute top-0 w-full h-[calc(100%+300px)] pointer-events-none fill-second">
              <motion.path
                variants={curveAnimation}
                initial="initial"
                exit="exit"
              />
            </svg>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
