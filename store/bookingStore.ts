import { create } from "zustand";

interface Booking {
  ground: any;
  bookings: any[];
}

interface BookingStore {
  grounds: Booking[];
  selectedGround: Booking | null;
  setGrounds: (grounds: Booking[]) => void;
  setSelectedGround: (ground: Booking) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  grounds: [],
  selectedGround: null,
  setGrounds: (grounds: Booking[]) => set({ grounds }),
  setSelectedGround: (ground: Booking) => set({ selectedGround: ground }),
}));
