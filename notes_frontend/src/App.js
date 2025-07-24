import React, { useState, useEffect } from "react";
import "./App.css";
import {
  fetchProfile,
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
} from "./api";
import { AuthModal } from "./components/AuthModals";
import { Header, Sidebar, NoteEditorDialog, NoteView } from "./components/NotesUI";

// PUBLIC_INTERFACE
function App() {
  // State
  const [theme, setTheme] = useState("light");
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search/filter/sort
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created");

  // Editing note
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorNote, setEditorNote] = useState(null);
  const [saving, setSaving] = useState(false);

  // Notifications/message
  const [error, setError] = useState("");

  // ---- Theme effect ----
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // ---- Auth/Token Bootstrap ----
  useEffect(() => {
    // Attempt auto-login with token
    if (token) {
      fetchProfile(token)
        .then((u) => setUser(u))
        .catch(() => {
          setUser(null);
          setToken(null);
        });
    }
  }, [token]);

  // ---- Fetch notes every time user, search, or sort changes ----
  useEffect(() => {
    if (!token) {
      setNotes([]);
      setSelectedId(null);
      return;
    }
    setLoading(true);
    fetchNotes(token, { q: search, sort })
      .then((data) => {
        setNotes(data);
        if (data.length === 0) setSelectedId(null);
        else if (!selectedId || !data.some((n) => n.id === selectedId))
          setSelectedId(data[0].id);
      })
      .catch((e) => setError(e.message || "Could not load notes"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [token, search, sort]);

  // ---- Handlers ----
  const handleAuth = (data) => {
    setToken(data.access_token);
    localStorage.setItem("access_token", data.access_token);
    setAuthModal(false);
    setError("");
  };
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("access_token");
    setUser(null);
    setNotes([]);
    setSelectedId(null);
  };
  const handleSelectNote = (id) => setSelectedId(id);
  const handleNewNote = () => {
    setEditorNote(null);
    setEditorOpen(true);
  };
  const handleEditNote = () => {
    const n = notes.find((n) => n.id === selectedId);
    setEditorNote(n);
    setEditorOpen(true);
  };
  const handleDeleteNote = async () => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteNote(token, selectedId);
      setNotes((ns) => ns.filter((n) => n.id !== selectedId));
      setSelectedId((sid) =>
        notes.length > 1
          ? notes.find((n) => n.id !== sid)?.id
          : null
      );
      setError("");
    } catch (e) {
      setError(e.message || "Delete failed");
    }
  };
  const handleSaveNote = async (values) => {
    setSaving(true);
    try {
      let newNote;
      if (editorNote) {
        newNote = await updateNote(token, editorNote.id, values);
      } else {
        newNote = await createNote(token, values);
      }
      // Refetch notes after save
      const newNotes = await fetchNotes(token, { q: search, sort });
      setNotes(newNotes);
      setSelectedId(newNote.id);
      setEditorOpen(false);
      setEditorNote(null);
      setError("");
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ---- UI ----
  // Show auth modal if not logged in/user null
  if (!token || !user) {
    return (
      <div className="App">
        <Header user={null} onLogout={() => {}} />
        <main style={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="welcome">
            <h1>Welcome to NoteMaster</h1>
            <button className="btn btn-primary" onClick={() => setAuthModal({ mode: "login" })}>
              Log In
            </button>
            <span>or</span>
            <button className="btn btn-secondary" onClick={() => setAuthModal({ mode: "register" })}>
              Register
            </button>
          </div>
        </main>
        {authModal && (
          <AuthModal
            mode={authModal.mode}
            onClose={() => setAuthModal(false)}
            onAuth={handleAuth}
          />
        )}
      </div>
    );
  }

  // Selected note logic
  const selectedNote = notes.find((n) => n.id === selectedId);

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={() =>
          setTheme((theme) => (theme === "light" ? "dark" : "light"))
        }
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      <Header user={user} onLogout={handleLogout} />
      <div className="main-layout">
        <Sidebar
          notes={notes}
          selectedId={selectedId}
          onSelect={handleSelectNote}
          onNew={handleNewNote}
          onSearchChange={setSearch}
          search={search}
          sort={sort}
          setSort={setSort}
        />
        <main className="main-content">
          {error && <div className="error-banner">{error}</div>}
          <NoteView
            note={selectedNote}
            canEdit={!!selectedNote}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            loading={loading}
          />
        </main>
      </div>
      <NoteEditorDialog
        open={editorOpen}
        note={editorNote}
        onSave={handleSaveNote}
        onClose={() => setEditorOpen(false)}
        saving={saving}
      />
    </div>
  );
}

export default App;
