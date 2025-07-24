import React, { useState } from "react";
import {
  createNote,
  updateNote,
  deleteNote,
} from "../api";

// PUBLIC_INTERFACE
export function Header({ user, onLogout }) {
  /** Top navigation/header bar. */
  return (
    <header className="header">
      <div className="header-title">🗒️ NoteMaster</div>
      <div className="header-actions">
        {user && (
          <>
            <span className="user-info">Hello, {user.username}</span>
            <button className="btn btn-small" onClick={onLogout}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
}

// PUBLIC_INTERFACE
export function Sidebar({
  notes,
  selectedId,
  onSelect,
  onNew,
  onSearchChange,
  search,
  sort,
  setSort,
}) {
  /** Sidebar: notes list, search/sort controls, new note button. */
  return (
    <aside className="sidebar">
      <div className="sidebar-toolbar">
        <input
          className="sidebar-search"
          placeholder="Search notes..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
        <select
          className="sidebar-sort"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="created">Sort: Newest</option>
          <option value="-created">Sort: Oldest</option>
          <option value="title">Sort: A-Z</option>
          <option value="-title">Sort: Z-A</option>
        </select>
        <button className="btn btn-accent btn-block" onClick={onNew}>+ New Note</button>
      </div>
      <ul className="notes-list">
        {notes.length === 0 && <li className="notes-empty">No notes found.</li>}
        {notes.map(n => (
          <li
            key={n.id}
            className={"note-list-item" + (n.id === selectedId ? " selected" : "")}
            onClick={() => onSelect(n.id)}
          >
            <div className="note-title">{n.title}</div>
            <div className="note-meta">
              <span>{new Date(n.updated_at).toLocaleDateString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// PUBLIC_INTERFACE
export function NoteEditorDialog({ open, note, onSave, onClose, saving }) {
  /** Modal for creating/editing a note (title and content). */
  const [values, setValues] = useState(
    note ? { title: note.title, content: note.content || "" } : { title: "", content: "" }
  );
  React.useEffect(() => {
    setValues(note ? { title: note.title, content: note.content || "" } : { title: "", content: "" });
  }, [note, open]);
  function handleSubmit(e) {
    e.preventDefault();
    onSave(values);
  }
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal note-editor-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{note ? "Edit Note" : "New Note"}</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={values.title}
            onChange={e => setValues(v => ({ ...v, title: e.target.value }))}
            required
            minLength={1}
            maxLength={200}
          />
          <textarea
            rows={8}
            placeholder="Type your note here..."
            value={values.content}
            onChange={e => setValues(v => ({ ...v, content: e.target.value }))}
          />
          <div className="modal-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function NoteView({
  note,
  canEdit,
  onEdit,
  onDelete,
  loading,
}) {
  /** Shows a selected note's content. */
  if (loading) return <div className="note-view loading">Loading...</div>;
  if (!note) return <div className="note-view empty">Select a note to view</div>;
  return (
    <div className="note-view">
      <h2 className="note-view-title">{note.title}</h2>
      <div className="note-view-content">{note.content || <span className="note-empty">No content</span>}</div>
      <div className="note-view-meta">
        <span>Last updated: {new Date(note.updated_at).toLocaleString()}</span>
      </div>
      {canEdit && (
        <div className="note-view-actions">
          <button className="btn btn-primary" onClick={onEdit}>Edit</button>
          <button className="btn btn-danger" onClick={onDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}
