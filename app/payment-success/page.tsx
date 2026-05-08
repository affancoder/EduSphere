"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import GoldButton from "@/components/ui/GoldButton";

type VerifyState = "verifying" | "success" | "error";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const startedRef = useRef(false);
  const [state, setState] = useState<VerifyState>("verifying");
  const [message, setMessage] = useState("Verifying payment with Stripe...");
  const [courseId, setCourseId] = useState<string>("");

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const verifyPayment = async () => {
      if (!sessionId) {
        setState("error");
        setMessage("Missing Stripe session id in the success URL.");
        return;
      }

      try {
        console.log("Payment success page: verifying Stripe session", { sessionId });
        const res = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Payment verification failed");
        }

        setCourseId(String(data.courseId || ""));
        setState("success");
        setMessage("Payment verified and course unlocked successfully.");
      } catch (error: unknown) {
        console.error("Payment success page: verification failed", error);
        setState("error");
        setMessage(error instanceof Error ? error.message : "Unable to verify payment");
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 pt-32 pb-20 flex items-center justify-center">
        <Card className="w-full max-w-xl p-10 bg-surface border-border-gold">
          <h1 className="font-display text-4xl text-text-primary mb-3">
            Payment <span className="text-gold italic">Status</span>
          </h1>
          <p className="text-text-muted mb-8">{message}</p>

          <div className="flex flex-wrap items-center gap-3">
            {state === "verifying" && (
              <GoldButton variant="ghost" disabled>
                Verifying...
              </GoldButton>
            )}

            {state === "success" && (
              <GoldButton
                variant="filled"
                onClick={() => router.push(courseId ? `/course/${courseId}` : "/courses")}
              >
                Go to Unlocked Course
              </GoldButton>
            )}

            {state === "error" && (
              <>
                <GoldButton variant="filled" onClick={() => router.push("/courses")}>
                  Back to Courses
                </GoldButton>
                <GoldButton variant="ghost" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </GoldButton>
              </>
            )}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1 container mx-auto px-6 pt-32 pb-20 flex items-center justify-center">
            <Card className="w-full max-w-xl p-10 bg-surface border-border-gold">
              <h1 className="font-display text-4xl text-text-primary mb-3">
                Payment <span className="text-gold italic">Status</span>
              </h1>
              <p className="text-text-muted mb-8">Loading payment details...</p>
              <GoldButton variant="ghost" disabled>
                Loading...
              </GoldButton>
            </Card>
          </main>
          <Footer />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
