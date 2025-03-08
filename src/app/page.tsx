"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

export default function Home() {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hearts, setHearts] = useState<
    Array<{ id: number; x: number; y: number; size: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const likeButtonRef = useRef<HTMLButtonElement>(null);
  const likeCounterRef = useRef<HTMLSpanElement>(null);
  const prevLikesRef = useRef(0);

  // Fetch likes from the server
  const fetchLikes = useCallback(async () => {
    try {
      const response = await fetch("/api/likes");
      if (response.ok) {
        const data = await response.json();
        setLikes(data.totalLikes || 0);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, []);

  // Load likes from server and check if user has liked on component mount
  useEffect(() => {
    // Check if user has already liked from localStorage
    const userHasLiked = localStorage.getItem("userHasLiked");
    if (userHasLiked === "true") {
      setHasLiked(true);
    }

    // Initial fetch
    fetchLikes().then(() => {
      prevLikesRef.current = likes;
    });

    // Setup polling interval (every 10 seconds)
    const pollInterval = setInterval(() => {
      fetchLikes();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [fetchLikes]);

  // Check if likes have increased and show notification
  useEffect(() => {
    if (
      prevLikesRef.current > 0 &&
      likes > prevLikesRef.current &&
      !isLoading
    ) {
      // Someone else has liked the page
      setShowNotification(true);

      // Add animation to the counter
      if (likeCounterRef.current) {
        likeCounterRef.current.classList.add("like-counter-pulse");
        setTimeout(() => {
          if (likeCounterRef.current) {
            likeCounterRef.current.classList.remove("like-counter-pulse");
          }
        }, 1000);
      }

      // Hide notification after animation completes
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }

    prevLikesRef.current = likes;
  }, [likes, isLoading]);

  // Function to create a flying heart
  const createHeart = useCallback((x: number, y: number) => {
    const newHeart = {
      id: Date.now(),
      x,
      y,
      size: Math.random() * (30 - 15) + 15, // Random size between 15-30px
    };

    setHearts((prevHearts) => [...prevHearts, newHeart]);

    // Remove heart after animation completes
    setTimeout(() => {
      setHearts((prevHearts) =>
        prevHearts.filter((heart) => heart.id !== newHeart.id)
      );
    }, 4000);
  }, []);

  // Create multiple hearts when like button is clicked
  const createHearts = useCallback(
    (x: number, y: number) => {
      // Create 10 hearts
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          const offsetX = x + (Math.random() * 100 - 50);
          const offsetY = y + (Math.random() * 50 - 25);
          createHeart(offsetX, offsetY);
        }, i * 100);
      }
    },
    [createHeart]
  );

  // Add pulse animation to button
  const addPulseAnimation = useCallback(() => {
    if (likeButtonRef.current) {
      likeButtonRef.current.classList.add("pulse-animation");
      setTimeout(() => {
        if (likeButtonRef.current) {
          likeButtonRef.current.classList.remove("pulse-animation");
        }
      }, 500);
    }
  }, []);

  // Handle like button click
  const handleLike = async (e: React.MouseEvent) => {
    if (!hasLiked && !isLoading) {
      try {
        setIsLoading(true);

        // Send like to server
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLikes(data.totalLikes || 0);
          setHasLiked(true);

          // Store that user has liked in localStorage
          localStorage.setItem("userHasLiked", "true");

          // Add pulse animation
          addPulseAnimation();

          // Create flying hearts animation
          createHearts(e.clientX, e.clientY);
        } else {
          console.error("Failed to update likes");
        }
      } catch (error) {
        console.error("Error updating likes:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 md:p-12 bg-gradient-to-b from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-purple-900/30 relative">
      {/* Like Notification */}
      {showNotification && (
        <div className="like-notification">
          ❤️ Someone just sent their love!
        </div>
      )}

      {/* Decorative Hearts */}
      <div
        className="absolute top-10 left-10 text-3xl float-animation"
        style={{ animationDelay: "0s" }}
      >
        💕
      </div>
      <div
        className="absolute top-20 right-10 text-4xl float-animation"
        style={{ animationDelay: "0.5s" }}
      >
        💖
      </div>
      <div
        className="absolute bottom-20 left-20 text-2xl float-animation"
        style={{ animationDelay: "1s" }}
      >
        💝
      </div>
      <div
        className="absolute bottom-40 right-20 text-3xl float-animation"
        style={{ animationDelay: "1.5s" }}
      >
        💘
      </div>
      <div
        className="absolute top-60 right-40 text-2xl float-animation"
        style={{ animationDelay: "2s" }}
      >
        💗
      </div>

      {/* Flying Hearts (for animation) */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="flying-heart"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            fontSize: `${heart.size}px`,
          }}
        >
          ❤️
        </div>
      ))}

      {/* Header */}
      <header className="w-full flex justify-center mb-8">
        <div className="w-32 h-32 relative">
          <Image
            src="/logo.png"
            alt="Faztro Logo"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center text-center max-w-3xl mx-auto z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-accent pink-glow md:leading-18">
          Happy International Women's Day!
        </h1>

        <div className="relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25"></div>
          <div className="relative bg-white p-6 rounded-lg shadow-xl pink-border">
            <p className="text-xl md:text-2xl mb-4 text-pink-500">
              Today, we celebrate the incredible women who inspire, lead, and
              make our world a better place.
            </p>
            <p className="text-lg md:text-xl text-pink-500">
              Thank you for your strength, resilience, and endless contributions
              to society.
            </p>
          </div>
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center mb-12">
          <button
            ref={likeButtonRef}
            onClick={handleLike}
            disabled={hasLiked || isLoading}
            className={`button-highlight button-shine flex items-center gap-2 px-6 py-3 rounded-full text-white transition-all shadow-lg hover:shadow-xl relative z-10 ${
              hasLiked
                ? "bg-primary-dark cursor-default"
                : isLoading
                ? "bg-primary-dark cursor-wait"
                : "bg-primary hover:bg-primary-dark primary-button-glow"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={hasLiked ? "white" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {hasLiked ? "Thank You!" : isLoading ? "Sending..." : "Send Love"}
          </button>
          <p className="mt-2 text-sm">
            <span ref={likeCounterRef} className="font-bold">
              {likes}
            </span>{" "}
            {likes === 1 ? "person" : "people"} have sent their love
          </p>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
          <a
            href="https://www.faztro.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="button-highlight button-shine flex items-center justify-center gap-2 p-4 bg-secondary hover:bg-opacity-80 rounded-lg transition-all relative z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="text-foreground font-medium">Faztro Website</span>
          </a>
          <a
            href="https://app.faztro.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="button-highlight button-shine flex items-center justify-center gap-2 p-4 bg-secondary hover:bg-opacity-80 rounded-lg transition-all relative z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span className="text-foreground font-medium">Faztro App</span>
          </a>
          <a
            href="https://www.instagram.com/faztroprime/"
            target="_blank"
            rel="noopener noreferrer"
            className="button-highlight button-shine flex items-center justify-center gap-2 p-4 bg-secondary hover:bg-opacity-80 rounded-lg transition-all relative z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span className="text-foreground font-medium">Instagram</span>
          </a>
          <a
            href="https://chat.whatsapp.com/Ira5D29Hc4HFQJz5GUSxK6"
            target="_blank"
            rel="noopener noreferrer"
            className="button-highlight button-shine flex items-center justify-center gap-2 p-4 bg-secondary hover:bg-opacity-80 rounded-lg transition-all relative z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span className="text-foreground font-medium">WhatsApp Group</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm opacity-70">
        <p>© {new Date().getFullYear()} Faztro. All rights reserved.</p>
      </footer>
    </div>
  );
}
