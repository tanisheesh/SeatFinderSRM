
"use client";

import { BookingClient } from "@/components/booking-client";
import { useAuth } from "@/components/providers/auth-provider";
import { db } from "@/lib/firebase";
import { Booking } from "@/types";
import { ref, onValue, off } from "firebase/database";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function BookSeatPage({ params }: { params: Promise<{ seatId: string }> }) {
    const { user, loading: authLoading } = useAuth();
    const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [seatId, setSeatId] = useState<string>("");
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        params.then(p => setSeatId(p.seatId));
    }, [params]);

    useEffect(() => {
        if (!user) {
            if(!authLoading) setLoading(false);
            return;
        }
        
        // Check for any active or pending bookings
        const bookingsRef = ref(db, `bookings/${user.uid}`);
        
        const listener = onValue(bookingsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Find any booking with status 'pending' or 'active'
                const activeBookingEntry = Object.entries(data).find(([_, bookingData]: [string, any]) => 
                    bookingData.status === 'pending' || bookingData.status === 'active'
                );
                
                if (activeBookingEntry) {
                    const [bookingId, bookingData] = activeBookingEntry;
                    const booking = { id: bookingId, ...(bookingData as any) };
                    setActiveBooking(booking);
                    
                    // If user tries to book a different seat, redirect them
                    if (seatId && booking.seatId !== seatId) {
                        toast({
                            variant: 'destructive',
                            title: 'Active Booking Exists',
                            description: `You already have an active booking for seat ${booking.seatId}. Cancel it first to book another seat.`,
                        });
                        router.push(`/book/${booking.seatId}`);
                    }
                } else {
                    setActiveBooking(null);
                }
            } else {
                setActiveBooking(null);
            }
            setLoading(false);
        });

        return () => off(bookingsRef, 'value', listener);

    }, [user, authLoading, seatId, router, toast]);

    if (authLoading || loading || !seatId) {
        return (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        );
    }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4">
      <BookingClient seatId={seatId} activeBooking={activeBooking} />
    </div>
  );
}
