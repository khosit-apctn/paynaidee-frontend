import { create } from 'zustand';

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Modal types
export type ModalType =
  | 'createGroup'
  | 'editGroup'
  | 'addMember'
  | 'createBill'
  | 'confirmDelete'
  | 'qrCode'
  | 'splitCalculator'
  | null;

export interface ModalData {
  groupId?: number;
  billId?: number;
  userId?: number;
  title?: string;
  message?: string;
  amount?: number;
  splitType?: 'equal' | 'custom';
  participants?: Array<{ user_id: number; amount?: number }>;
  onConfirm?: () => void;
  [key: string]: unknown;
}

interface UIState {
  // Sidebar state
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;

  // Dashboard active selection state
  activeGroupId: number | null;
  activeBillId: number | null;

  // Modal state
  activeModal: ModalType;
  modalData: ModalData | null;

  // Toast notifications
  toasts: Toast[];

  // Loading states
  isGlobalLoading: boolean;
  loadingMessage: string | null;

  // Sidebar actions
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Dashboard selection actions
  setActiveGroupId: (id: number | null) => void;
  setActiveBillId: (id: number | null) => void;

  // Modal actions
  openModal: (modal: ModalType, data?: ModalData) => void;
  closeModal: () => void;

  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Loading actions
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

// Generate unique ID for toasts
const generateId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Default toast duration (5 seconds)
const DEFAULT_TOAST_DURATION = 5000;

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  activeGroupId: null,
  activeBillId: null,
  activeModal: null,
  modalData: null,
  toasts: [],
  isGlobalLoading: false,
  loadingMessage: null,

  // Sidebar actions
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  // Dashboard selection actions
  setActiveGroupId: (id) => set({ activeGroupId: id, activeBillId: null }),
  setActiveBillId: (id) => set({ activeBillId: id }),

  // Modal actions
  openModal: (modal, data) =>
    set({
      activeModal: modal,
      modalData: data ?? null,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      modalData: null,
    }),

  // Toast actions
  addToast: (toast) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? DEFAULT_TOAST_DURATION,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  // Loading actions
  setGlobalLoading: (loading, message) =>
    set({
      isGlobalLoading: loading,
      loadingMessage: loading ? (message ?? null) : null,
    }),
}));

// Convenience helper functions for toasts
export const showSuccessToast = (title: string, message?: string): void => {
  useUIStore.getState().addToast({ type: 'success', title, message });
};

export const showErrorToast = (title: string, message?: string): void => {
  useUIStore.getState().addToast({ type: 'error', title, message });
};

export const showWarningToast = (title: string, message?: string): void => {
  useUIStore.getState().addToast({ type: 'warning', title, message });
};

export const showInfoToast = (title: string, message?: string): void => {
  useUIStore.getState().addToast({ type: 'info', title, message });
};
