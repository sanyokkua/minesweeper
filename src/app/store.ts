import { configureStore } from '@reduxjs/toolkit'
import appReducer from './appSlice'
import gameReducer from '../features/game/gameSlice'
import preferencesReducer from '../features/preferences/preferencesSlice'
import persistenceReducer from '../features/persistence/persistenceSlice'

export function createAppStore() {
    return configureStore({
        reducer: {
            app: appReducer,
            game: gameReducer,
            preferences: preferencesReducer,
            persistence: persistenceReducer,
        },
    })
}

export const appStore = createAppStore()
export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
