import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Folder, FolderOpen, ChevronsLeft, Search, PanelLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { filesApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";

const ExplorerPanel = () => {
  const { selectedFolderId, setSelectedFolderId, setExplorerOpen } = useStore();
  const [expanded, setExpanded] = useState(new Set(["f-root"]));
  const [filter, setFilter] = useState("");

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ["folders"],
    queryFn: filesApi.folders,
  });

  const childrenMap = useMemo(() => {
    const map = {};
    for (const f of folders) {
      const key = f.parent_id || "__root__";
      (map[key] = map[key] || []).push(f);
    }
    return map;
  }, [folders]);

  // Build a flat visible list iteratively (avoids recursive JSX which breaks
  // certain Babel plugins like visual-edits).
  const visibleRows = useMemo(() => {
    const roots = childrenMap.__root__ || [];
    const term = filter.trim().toLowerCase();
    const rows = [];
    const stack = roots.map((r) => ({ folder: r, depth: 0 }));
    while (stack.length) {
      const { folder, depth } = stack.shift();
      const kids = childrenMap[folder.id] || [];
      const matches = !term || folder.name.toLowerCase().includes(term);
      // when filtering, always expand so children are visible
      const isExpanded = expanded.has(folder.id) || (term && matches);
      if (matches || !term) {
        rows.push({
          folder,
          depth,
          hasChildren: kids.length > 0,
          expanded: isExpanded,
        });
      }
      if (isExpanded && kids.length) {
        // unshift kids to preserve tree order
        stack.unshift(...kids.map((k) => ({ folder: k, depth: depth + 1 })));
      }
    }
    return rows;
  }, [childrenMap, expanded, filter]);

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col bg-panel border-r border-app" data-testid="explorer-panel">
      <div className="flex h-9 items-center justify-between border-b border-app px-2">
        <div className="flex items-center gap-1.5">
          <PanelLeft className="h-3.5 w-3.5 text-muted" />
          <span className="font-heading text-[11px] font-semibold uppercase tracking-widest text-2nd">
            Explorer
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExplorerOpen(false)}
          data-testid="explorer-collapse-btn"
          title="Collapse"
          className="rounded-[3px] p-1 text-muted hover:bg-surface-hover hover:text-app transition-fast"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="border-b border-app p-2">
        <div className="flex items-center gap-1.5 rounded-[4px] bg-surface px-2 py-1.5 border border-app">
          <Search className="h-3 w-3 text-muted" />
          <input
            data-testid="explorer-search-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter folders…"
            className="w-full bg-transparent text-xs text-app placeholder:text-muted outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {isLoading ? (
          <div className="p-3 text-xs text-muted font-mono">Loading…</div>
        ) : (
          visibleRows.map(({ folder, depth, hasChildren, expanded: isExpanded }) => {
            const selected = selectedFolderId === folder.id;
            return (
              <button
                key={folder.id}
                type="button"
                data-testid={`folder-node-${folder.id}`}
                onClick={() => {
                  setSelectedFolderId(folder.id);
                  if (hasChildren) toggle(folder.id);
                }}
                className={cx(
                  "group flex w-full items-center gap-1 rounded-[4px] py-1 pr-2 text-left text-xs transition-fast",
                  selected
                    ? "bg-surface text-app"
                    : "text-2nd hover:bg-surface-hover hover:text-app"
                )}
                style={{ paddingLeft: 6 + depth * 12 }}
              >
                <span className="w-3 flex-shrink-0 text-muted">
                  {hasChildren ? (
                    <ChevronRight
                      className={cx(
                        "h-3 w-3 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  ) : null}
                </span>
                {isExpanded && hasChildren ? (
                  <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 accent-text" />
                ) : (
                  <Folder className="h-3.5 w-3.5 flex-shrink-0 text-muted" />
                )}
                <span className="truncate flex-1">{folder.name}</span>
                <span className="font-mono text-[10px] text-muted">
                  {folder.video_count || ""}
                </span>
              </button>
            );
          })
        )}
      </div>
      <div className="border-t border-app px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted">
        {folders.length} folders
      </div>
    </div>
  );
};

export default ExplorerPanel;
