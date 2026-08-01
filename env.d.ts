/// <reference types="vite/client" />

import { ComponentCustomProperties } from 'vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $reortGaEvent: (action: string, category: string, label?: string) => void
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $reortGaEvent: (action: string, category: string, label?: string) => void
  }
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export {}
