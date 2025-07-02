import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LocationType = {
  latitude: number;
  longitude: number;
};

type UserStoreType = {
  location: LocationType | null;
  setLocation: (loc: LocationType) => void;
  clear: () => void;
};

export const useUserStore = create<UserStoreType>()(
  persist(
    set => ({
      location: null,
      setLocation: loc => set({location: loc}),
      clear: () => set({location: null}),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage), // <--- THIS!
    },
  ),
);
