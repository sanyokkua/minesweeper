import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { PRESETS } from '../../domain/config'
import type { GameConfig } from '../../domain/gameTypes'
import type { Appearance, InputMode } from '../persistence/recordCodec'
import type { Locale } from '../../i18n/catalog'

export type PreferencesState = {
  locale: Locale
  appearance: Appearance
  inputMode: InputMode
  selectedConfig: GameConfig
}
const initialState: PreferencesState = {
  locale: 'en',
  appearance: 'system',
  inputMode: 'reveal-first',
  selectedConfig: PRESETS.beginner,
}
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<Locale>) => {
      state.locale = action.payload
    },
    setAppearance: (state, action: PayloadAction<Appearance>) => {
      state.appearance = action.payload
    },
    setInputMode: (state, action: PayloadAction<InputMode>) => {
      state.inputMode = action.payload
    },
    setSelectedConfig: (state, action: PayloadAction<GameConfig>) => {
      state.selectedConfig = action.payload
    },
  },
})
export const { setLocale, setAppearance, setInputMode, setSelectedConfig } =
  preferencesSlice.actions
export default preferencesSlice.reducer
