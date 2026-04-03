import { useWindowDimensions, Platform } from "react-native";

export type LayoutMode = "mobile" | "tablet" | "desktop";

export function useLayout() {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isDesktop = width >= 1100;
  const isLandscape = width > height;

  const mode: LayoutMode = isDesktop ? "desktop" : isTablet ? "tablet" : "mobile";
  const sidebarWidth = isDesktop ? 220 : 72;
  const useSidebar = (isTablet || isDesktop) && Platform.OS === "web";
  const contentMaxWidth = isDesktop ? 900 : isTablet ? 680 : undefined;

  return { width, height, isTablet, isDesktop, isLandscape, mode, sidebarWidth, useSidebar, contentMaxWidth };
}
