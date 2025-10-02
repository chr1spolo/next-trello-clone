import { create } from "zustand";

type ModalType = "team" | "project" | "new-task" | null;

interface ModalPayload {
  teamId?: string | null;
  projectId?: string | null;
}

interface ModalStoreProps {
  type: ModalType;
  isOpen: boolean;
  payload?: ModalPayload;
  openModal: (type: ModalType, payload: ModalPayload) => Promise<void>;
  closeModal: () => void;
}

export const useModalStore = create<ModalStoreProps>((set) => ({
  type: null,
  isOpen: false,
  openModal: async (type, payload) => {
    set({ isOpen: false });
    set({ type, isOpen: true, payload });
  },
  closeModal: () => set({ type: null, isOpen: false }),
}));
