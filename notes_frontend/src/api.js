//
// API client for NoteMaster frontend.
//
// Provides all REST API calls to notes_backend /auth and /notes (using JWT tokens).
//

const API_BASE_URL = "http://localhost:3001";

// PUBLIC_INTERFACE
export async function registerUser({ username, email, password }) {
  /** Register a new user. Returns {id, username, email, created_at} if success or throws error */
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (res.ok) return await res.json();
  const data = await res.json();
  throw new Error(data.detail || "Registration failed");
}

// PUBLIC_INTERFACE
export async function loginUser({ username, password }) {
  /** Log in with username and password. Returns {access_token, token_type} on success, throws error on failure */
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  params.append("grant_type", "password");
  const res = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (res.ok) return await res.json();
  const data = await res.json();
  throw new Error(data.detail || "Login failed");
}

// PUBLIC_INTERFACE
export async function fetchProfile(token) {
  /** Get current user's profile data. */
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) return await res.json();
  throw new Error("Unauthorized");
}

// PUBLIC_INTERFACE
export async function fetchNotes(token, { q, sort, limit } = {}) {
  /** Get list of notes for user, with optional search/filter/sort. */
  let url = `${API_BASE_URL}/notes/`;
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (sort) params.append("sort", sort);
  if (limit) params.append("limit", limit);
  if ([...params].length > 0) url += "?" + params.toString();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) return await res.json();
  throw new Error("Failed to fetch notes");
}

// PUBLIC_INTERFACE
export async function createNote(token, { title, content }) {
  /** Create a new note. */
  const res = await fetch(`${API_BASE_URL}/notes/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  });
  if (res.ok) return await res.json();
  const data = await res.json();
  throw new Error(data.detail || "Failed to create note");
}

// PUBLIC_INTERFACE
export async function updateNote(token, note_id, { title, content }) {
  /** Update a note by ID. */
  const res = await fetch(`${API_BASE_URL}/notes/${note_id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  });
  if (res.ok) return await res.json();
  const data = await res.json();
  throw new Error(data.detail || "Failed to update note");
}

// PUBLIC_INTERFACE
export async function deleteNote(token, note_id) {
  /** Delete a note by ID. */
  const res = await fetch(`${API_BASE_URL}/notes/${note_id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) return await res.json();
  throw new Error("Failed to delete note");
}
