import { create } from "zustand"
import { persist } from "zustand/middleware"

// Create a theme store
const useThemeStore = create(
  persist(
    (set, get) => ({
      // Theme state - always light for this project
      theme: "light",

      // Section background colors
      sectionColors: {
        primary: "#F7F2EE", // First section color
        secondary: "#f0eaee", // Second section color
      },

      // Toggle theme function (does nothing in this case)
      toggleTheme: () => {
        console.log("Theme toggling is disabled")
      },

      // Function to get section color based on index (alternating)
      getSectionColor: (index) => {
        const { sectionColors } = get()
        return index % 2 === 0 ? sectionColors.primary : sectionColors.secondary
      },

      // Function to update section colors
      updateSectionColors: (primary, secondary) => {
        set((state) => ({
          sectionColors: {
            primary: primary || state.sectionColors.primary,
            secondary: secondary || state.sectionColors.secondary,
          },
        }))
      },
    }),
    {
      name: "theme-store",
    },
  ),
)

export default useThemeStore
