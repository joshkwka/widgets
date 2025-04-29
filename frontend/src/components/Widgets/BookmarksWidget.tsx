import { useEffect, useState } from "react";
import BaseWidget from "../BaseWidget";
import DragHandle from "./Helper/DragHandle";
import { fetchWidgetPreferences, saveWidgetPreferences } from "../../api/auth";
import ReactGridLayout from "react-grid-layout";

interface BookmarkItem {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
}

export default function BookmarksWidget({ id }: { id: string }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [inputName, setInputName] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [title, setTitle] = useState("Bookmarks");
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await fetchWidgetPreferences(id);
      setBookmarks(prefs.settings?.bookmarks || []);
      setTitle(prefs.settings?.title || "Bookmarks");
    };
    loadPreferences();
  }, [id]);

  const saveBookmarks = (updated: BookmarkItem[]) => {
    setBookmarks(updated);
    saveWidgetPreferences(id, "bookmarks", { bookmarks: updated, title });
  };

  const saveTitle = (newTitle: string) => {
    setTitle(newTitle);
    saveWidgetPreferences(id, "bookmarks", { bookmarks, title: newTitle });
  };

  const handleAddBookmark = () => {
    if (!inputName.trim() || !inputUrl.trim()) return;

    const newBookmark: BookmarkItem = {
      id: crypto.randomUUID(),
      name: inputName,
      url: normalizeUrl(inputUrl), // Normalize the URL before saving
      iconUrl: `https://www.google.com/s2/favicons?domain=${inputUrl}`,
    };
    saveBookmarks([...bookmarks, newBookmark]);
    setInputName("");
    setInputUrl("");
  };

  const handleDeleteBookmark = (itemId: string) => {
    const updated = bookmarks.filter((item) => item.id !== itemId);
    saveBookmarks(updated);
  };

  // Function to ensure the URL is absolute
  const normalizeUrl = (url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url; // Prepend 'https://' if missing
    }
    return url;
  };

  return (
    <BaseWidget id={id} defaultSettings={{ bookmarks: [], title: "Bookmarks" }}>
      <div className="w-full h-full flex flex-col gap-2">
        {/* Header */}
        <div className="relative px-3 py-2 border-b border-[var(--border)]">
          {editingTitle ? (
            <input
              className="text-md font-semibold bg-transparent border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                saveTitle(title);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingTitle(false);
                  saveTitle(title);
                }
              }}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-left text-md font-semibold text-[var(--foreground)] cursor-pointer bg-transparent border-none focus:outline-none"
            >
              {title}
            </button>
          )}
          <DragHandle />
        </div>

        {/* Add Bookmark Input */}
        <div className="flex px-3 gap-2">
          <input
            className="flex-1 rounded border border-[var(--border)] bg-transparent text-[var(--foreground)] px-2 py-1 text-sm"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Bookmark name..."
          />
          <input
            className="flex-1 rounded border border-[var(--border)] bg-transparent text-[var(--foreground)] px-2 py-1 text-sm"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddBookmark()}
            placeholder="Bookmark URL..."
          />
          <button
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={handleAddBookmark}
          >
            Add
          </button>
        </div>

        {/* Bookmarks Grid Layout */}
        <div className="px-2 py-2 overflow-auto">
          <ReactGridLayout
            className="layout"
            layout={bookmarks.map((b, index) => ({
              i: b.id,
              x: index % 3,
              y: Math.floor(index / 3),
              w: 1,
              h: 2, // Adjust height to fit the bookmark properly
            }))}
            cols={9}
            rowHeight={40} // Adjust row height to better fit bookmarks
            width={1000}
            isResizable={false} // Disable resizing
            draggableHandle=".bookmark-drag-handle"
          >
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bookmark-item p-1 relative w-20 h-20 group">
                {/* Drag Handle */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-[var(--border)] rounded-full cursor-move bookmark-drag-handle"></div>

                {/* Delete Button (Appears on Hover over the entire item) */}
                <button
                  onClick={() => handleDeleteBookmark(bookmark.id)}
                  className="absolute bottom-2 right-2 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50"
                >
                  ✕
                </button>

                {/* Bookmark Link */}
                <a
                  href={normalizeUrl(bookmark.url)} // Normalize the URL before rendering
                  target="_blank"
                  rel="noopener noreferrer" // Security improvement when opening a new tab
                  className="flex flex-col items-center justify-center text-center w-full h-full rounded-md shadow-md"
                >
                  {/* Bookmark Icon or Initial */}
                  {bookmark.iconUrl ? (
                    <img
                      src={bookmark.iconUrl}
                      alt={bookmark.name}
                      className="w-8 h-8 object-contain mb-2"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 flex items-center justify-center rounded-md mb-2">
                      <span className="text-white text-xl">{bookmark.name[0]}</span>
                    </div>
                  )}
                  {/* Bookmark Name */}
                  <span className="text-xs text-gray-500">{bookmark.name}</span>
                </a>
              </div>
            ))}
          </ReactGridLayout>
        </div>
      </div>
    </BaseWidget>
  );
}
