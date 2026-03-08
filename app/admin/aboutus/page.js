"use client";

import { useEffect, useState } from "react";

export default function AboutPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    const res = await fetch("/api/about");
    const data = await res.json();

    if (data.data) {
      setTitle(data.data.title);
      setDescription(data.data.description);
    }
  };

  const updateAbout = async () => {
    const res = await fetch("/api/about", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Content Updated Successfully");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>About Us Content</h2>

      <div>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Description</label>
        <textarea
          rows="6"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <button
        onClick={updateAbout}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "black",
          color: "white",
        }}
      >
        Update Content
      </button>
    </div>
  );
}