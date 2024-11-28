export const layoutStyles = {
  container: `
    flex
    flex-col
    h-screen
    overflow-hidden
    bg-[#1e1e1e]
    text-white
  `,
  threePanelLayout: `
    flex
    flex-1
    flex-col
    relative
    min-h-0
  `,
  topPanels: `
    flex
    relative
    min-h-0
  `,
  panel: `
    relative
    min-h-0
    bg-[#fff]
    overflow-auto
  `,
  resizer: `
    bg-gray-700
    hover:bg-blue-500
    transition-colors
    duration-200
    z-10
  `,
  verticalResizer: `
    w-1
    cursor-col-resize
    hover:w-1.5
    active:w-1.5
    active:bg-blue-500
  `,
  horizontalResizer: `
    h-1
    cursor-row-resize
    hover:h-1.5
    active:h-1.5
    active:bg-blue-500
  `,
}; 