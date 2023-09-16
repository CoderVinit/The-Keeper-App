import { useState } from "react";
import NoteContext from "./noteContext";

const NoteState = (props) => {
    const host = "http://localhost:5000";
    const notesInitial = []
    const [Notes, setNotes] = useState(notesInitial)

    //get all notes

    const getNotes = async () => {

        // TODO api call
        // API call
        const response = await fetch(`${host}/api/notes/fetchallnotes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
        });
        const json = await response.json();
        setNotes(json)
    }

    // Add Note

    const addNote = async (title, description, tag) => {

        // TODO api call
        // API call
        const response = await fetch(`${host}/api/notes/addnotes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify({ title, description, tag }),
        });
        const serverNote = await response.json();
        setNotes(Notes.concat(serverNote));
    }
    // delete a Note
    const deleteNote = async (id) => {
        // API call
        const response = await fetch(`${host}/api/notes/deletenotes/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
        });
        // eslint-disable-next-line
        const json = await response.json();

        const newNotes = Notes.filter((note) => { return note._id !== id })
        setNotes(newNotes);

    }
    // edit Note

    const editNote = async (id, title, description, tag) => {
        // API call
        const response = await fetch(`${host}/api/notes/updatenotes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify({ title, description, tag }),
        });
        // eslint-disable-next-line
        const json = await response.json();
        let newNotes = JSON.parse(JSON.stringify(Notes))
        // logic to edit in client
        for (let index = 0; index < newNotes.length; index++) {
            const element = newNotes[index];
            if (element._id === id) {
                newNotes[index].title = title;
                newNotes[index].description = description;
                newNotes[index].tag = tag;
                break;
            }
        }
        setNotes(newNotes)
    }


    return (
        <NoteContext.Provider value={{ Notes, addNote, deleteNote, editNote, getNotes }}>
            {props.children}
        </NoteContext.Provider >
    )
}

export default NoteState;