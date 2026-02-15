import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
    mode: 'dark' | 'light';
}

const initialState: ThemeState = {
    // Check localStorage or default to dark
    mode: (localStorage.getItem('theme-mode') as 'dark' | 'light') || 'dark',
};

export const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setThemeMode: (state, action: PayloadAction<'dark' | 'light'>) => {
            state.mode = action.payload;
            localStorage.setItem('theme-mode', action.payload);

            // Side effect: update document class
            if (action.payload === 'light') {
                document.documentElement.classList.add('light-mode');
            } else {
                document.documentElement.classList.remove('light-mode');
            }
        },
        toggleTheme: (state) => {
            const nextMode = state.mode === 'dark' ? 'light' : 'dark';
            state.mode = nextMode;
            localStorage.setItem('theme-mode', nextMode);

            if (nextMode === 'light') {
                document.documentElement.classList.add('light-mode');
            } else {
                document.documentElement.classList.remove('light-mode');
            }
        },
    },
});

export const { setThemeMode, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
