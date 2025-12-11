// store/groundStore.js
import { create } from "zustand";

type Ground = any; // Replace 'any' with your actual Ground type
type TimeSlot = any; // Replace 'any' with your actual TimeSlot type

interface GroundStoreState {
  availableGrounds: Ground[];
  timeSlot: TimeSlot;
  selectedGround: Ground | null;
  setAvailableGrounds: (grounds: Ground[]) => void;
  setTimeSlot: (slot: TimeSlot) => void;
  setSelectedGround: (ground: Ground | null) => void;
  resetStore: () => void;
}

export const useGroundStore = create<GroundStoreState>((set) => ({
  availableGrounds: [],
  timeSlot: {},
  selectedGround: null,

  setAvailableGrounds: (grounds: Ground[]) =>
    set({ availableGrounds: grounds }),
  setTimeSlot: (slot: TimeSlot) => set({ timeSlot: slot }),
  setSelectedGround: (ground: Ground | null) => set({ selectedGround: ground }),
  
  resetStore: () => {
    console.log("[GroundTStore] Resetting store");
    set({
      availableGrounds: [],
      timeSlot: {},
      selectedGround: null,
    });
  },
}));
