import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Note {
    id: string;
    title: string;
    content: string;
    timestamp: string;
    projectId?: string;
    referenceContext?: string;
}

interface NotesState {
    isWidgetOpen: boolean;
    notes: Note[];
}

const initialState: NotesState = {
    isWidgetOpen: false,
    notes: [],
};

const notesSlice = createSlice({
    name: 'notes',
    initialState,
    reducers: {
        toggleNotesWidget: (state) => {
            state.isWidgetOpen = !state.isWidgetOpen;
        },
        addNote: (state, action: PayloadAction<Omit<Note, 'id' | 'timestamp'>>) => {
            const newNote: Note = {
                ...action.payload,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
            };
            state.notes.push(newNote);
            state.isWidgetOpen = true; // Auto-open widget when note is added
        },
        updateNote: (state, action: PayloadAction<Note>) => {
            const index = state.notes.findIndex(n => n.id === action.payload.id);
            if (index !== -1) {
                state.notes[index] = action.payload;
            }
        },
        deleteNote: (state, action: PayloadAction<string>) => {
            state.notes = state.notes.filter(n => n.id !== action.payload);
        }
    }
});

export const { toggleNotesWidget, addNote, updateNote, deleteNote } = notesSlice.actions;
export default notesSlice.reducer;
