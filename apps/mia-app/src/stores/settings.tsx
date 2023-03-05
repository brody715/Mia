import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface OpenAiProfile {
  name: string
  endpoint: string
  apiKey?: string
  desc?: string
}

interface Settings {
  ui: {
    mainDrawerOpened: boolean
  }

  apiClient: {
    usedOpenaiProfile: OpenAiProfile
  }

  openaiProfiles: OpenAiProfile[]
}

interface SettingsActions {
  addOpenAiProfile(profile: OpenAiProfile): void
  setOpenaiProfile(profile: OpenAiProfile): void
  openMainDrawer(): void
  closeMainDrawer(): void
  toggleMainDrawer(): void
}

const defaultOpenaiProfiles: OpenAiProfile[] = [
  {
    name: 'openai-offical',
    endpoint: 'https://api.openai.com',
    apiKey: '',
  },
]

export type SettingsStore = SettingsActions & Settings

const settingsStoreCreator = immer<SettingsStore>((set, get) => ({
  ui: {
    mainDrawerOpened: false,
  },
  apiClient: {
    usedOpenaiProfile: defaultOpenaiProfiles[0],
  },
  openaiProfiles: defaultOpenaiProfiles,

  addOpenAiProfile(profile: OpenAiProfile) {
    set((s) => {
      s.openaiProfiles.push(profile)
    })
  },

  setOpenaiProfile(profile: OpenAiProfile) {
    set((s) => {
      s.apiClient.usedOpenaiProfile = profile
    })
  },

  openMainDrawer() {
    set((s) => {
      s.ui.mainDrawerOpened = true
    })
  },

  closeMainDrawer() {
    set((s) => {
      s.ui.mainDrawerOpened = false
    })
  },

  toggleMainDrawer() {
    set((s) => {
      s.ui.mainDrawerOpened = !s.ui.mainDrawerOpened
    })
  },
}))

export const useSettingsStore = create(
  devtools(
    persist(settingsStoreCreator, {
      name: 'mia-settings',
    }),
    {
      name: 'mia-settings',
    }
  )
)
