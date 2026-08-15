import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type Route = 'home' | 'game'
export type BlockingSheet =
    'help' | 'settings' | 'confirm-reset-game' | 'confirm-reset-data' | 'confirm-replace' | 'win' | 'loss' | null
export type Notice = { id: string; message: string; action?: string }
export type AppState = {
    route: Route
    blockingSheet: BlockingSheet
    documentVisible: boolean
    notices: Notice[]
}
const initialState: AppState = {
    route: 'home',
    blockingSheet: null,
    documentVisible: true,
    notices: [],
}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        navigate: (state, action: PayloadAction<Route>) => {
            state.route = action.payload
        },
        openSheet: (state, action: PayloadAction<Exclude<BlockingSheet, null>>) => {
            state.blockingSheet = action.payload
        },
        closeSheet: (state) => {
            state.blockingSheet = null
        },
        setDocumentVisible: (state, action: PayloadAction<boolean>) => {
            state.documentVisible = action.payload
        },
        addNotice: (state, action: PayloadAction<Notice>) => {
            if (!state.notices.some((notice) => notice.id === action.payload.id)) state.notices.push(action.payload)
        },
        dismissNotice: (state, action: PayloadAction<string>) => {
            state.notices = state.notices.filter((notice) => notice.id !== action.payload)
        },
    },
})

export const { navigate, openSheet, closeSheet, setDocumentVisible, addNotice, dismissNotice } = appSlice.actions
export default appSlice.reducer
