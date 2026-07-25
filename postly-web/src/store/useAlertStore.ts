import { create } from 'zustand';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

export interface AlertMessage {
  id: string;
  title: string;
  message: string;
  type: AlertType;
}

interface AlertState {
  alert: AlertMessage | null;
  showAlert: (title: string, message: string, type?: AlertType) => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alert: null,
  showAlert: (title, message, type = 'error') => {
    set({
      alert: {
        id: Math.random().toString(36).substring(2, 9),
        title,
        message,
        type,
      },
    });
  },
  closeAlert: () => set({ alert: null }),
}));
