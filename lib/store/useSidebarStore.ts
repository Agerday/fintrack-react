import { create } from 'zustand';

type SidebarState = {
    // Desktop: sidebar reduced to icons
    isCollapsed: boolean;
    toggle: () => void;
    // Mobile / tablet: sidebar shown as a drawer over the page
    isMobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
};

export const useSidebarStore = create<SidebarState>((set) => ({
    isCollapsed: false,
    toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    isMobileOpen: false,
    setMobileOpen: (open) => set({ isMobileOpen: open }),
}));
