import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from 'react-redux';

// Try to load the giant attributes file via Vite's raw import, with a fetch fallback in dev
async function loadAttributesData() {
  try {
    const mod = await import("../../../JsonAttributeThreekit.js?raw");
    return JSON.parse(mod.default);
  } catch (e) {
    const resp = await fetch("/JsonAttributeThreekit.js");
    const txt = await resp.text();
    return JSON.parse(txt);
  }
}

// Small helper to show attribute title with nice label fallback
const getAttrLabel = (attr) => attr?.metadata?.Label || attr?.metadata?.Name || attr?.name || "Unnamed";
const getValueLabel = (v) => v?.metadata?.Label || v?.metadata?.label || v?.name || "Unnamed";

// Shape of selection for each attribute:
// { mode: 'all' | 'limit' | 'exclude' | 'none', include: Set<string>, exclude: Set<string> }

const AttributeRow = ({ attr, state, onChange }) => {
  const [open, setOpen] = useState(false);
  const total = attr.values?.length || 0;
  const selectedCount = state.mode === "all" ? total : state.mode === "limit" ? state.include.size : state.mode === "exclude" ? state.exclude.size : 0;

  const toggleMode = (mode) => {
    onChange({ ...state, mode });
    if (!open) setOpen(true);
  };

  const handleMultiSelect = (mode, e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    if (mode === "limit") onChange({ ...state, mode: "limit", include: new Set(options), exclude: new Set() });
    if (mode === "exclude") onChange({ ...state, mode: "exclude", exclude: new Set(options), include: new Set() });
  };

  const clear = () => onChange({ mode: "none", include: new Set(), exclude: new Set() });

  return (
    <div className="border rounded-lg mb-4 bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <input
            aria-label="Select attribute"
            type="checkbox"
            className="h-4 w-4"
            checked={state.mode !== "none"}
            onChange={(e) =>
              e.target.checked
                ? onChange({ ...state, mode: state.mode === "none" ? "all" : state.mode })
                : onChange({ mode: "none", include: new Set(), exclude: new Set() })
            }
          />
          <div>
            <div className="font-medium text-gray-900">{getAttrLabel(attr)}</div>
            <div className="text-xs text-gray-500">
              {selectedCount}/{total} {state.mode === "limit" ? "selected" : state.mode === "exclude" ? "excluded" : state.mode === "all" ? "cached (all)" : ""}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toggleMode("limit")} className={`px-3 py-1 rounded text-sm border ${state.mode === "limit" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-300"}`}>Limit to…</button>
          <button onClick={() => toggleMode("exclude")} className={`px-3 py-1 rounded text-sm border ${state.mode === "exclude" ? "bg-orange-600 text-white border-orange-600" : "bg-white text-orange-700 border-orange-300"}`}>Exclude…</button>
          <button onClick={() => toggleMode("all")} className={`px-3 py-1 rounded text-sm border ${state.mode === "all" ? "bg-green-600 text-white border-green-600" : "bg-white text-green-700 border-green-300"}`}>Cache all</button>
          <button onClick={clear} className="px-3 py-1 rounded text-sm border bg-white text-gray-700 border-gray-300">Clear</button>
          <button onClick={() => setOpen((v) => !v)} className="px-3 py-1 rounded text-sm border bg-white text-gray-700 border-gray-300">{open ? "Hide" : "Show"}</button>
        </div>
      </div>

      {open && state.mode !== "all" && (
        <div className="p-4">
          {state.mode === "limit" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select values to include</label>
              <select multiple value={Array.from(state.include)} onChange={(e) => handleMultiSelect("limit", e)} className="w-full h-40 border rounded p-2">
                {attr.values?.map((v) => (
                  <option key={v.assetId || v.name} value={v.name}>
                    {getValueLabel(v)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {state.mode === "exclude" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select values to exclude</label>
              <select multiple value={Array.from(state.exclude)} onChange={(e) => handleMultiSelect("exclude", e)} className="w-full h-40 border rounded p-2">
                {attr.values?.map((v) => (
                  <option key={v.assetId || v.name} value={v.name}>
                    {getValueLabel(v)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AttributesCacheSection = ({ onChange }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [attrs, setAttrs] = useState([]);
  const [selection, setSelection] = useState(() => new Map());
  const displayAttributes = useSelector((state) => state.displayAttributes);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await loadAttributesData();
        if (!mounted) return;
        setAttrs(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Failed to load attributes");
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let base = attrs;
    if (Array.isArray(displayAttributes) && displayAttributes.length) {
      const ids = new Set(displayAttributes.map((a) => a.id));
      base = attrs.filter((a) => ids.has(a.id));
    }
    return base.filter((a) => getAttrLabel(a).toLowerCase().includes(q));
  }, [attrs, search, displayAttributes]);

  const getStateFor = (attr) => selection.get(attr.id) || { mode: "none", include: new Set(), exclude: new Set() };
  const updateStateFor = (attr, newState) => {
    const m = new Map(selection);
    m.set(attr.id, newState);
    setSelection(m);
  };

  // Build output in the SAME format as the source JSON: array of attribute objects with filtered values
  const selectedAttributes = useMemo(() => {
    const result = [];
    selection.forEach((st, attrId) => {
      if (st.mode === "none") return;
      const attr = attrs.find((a) => a.id === attrId);
      if (!attr) return;

      let values = attr.values || [];
      if (st.mode === "limit") {
        const includeSet = new Set(Array.from(st.include));
        values = values.filter((v) => includeSet.has(v.name));
      } else if (st.mode === "exclude") {
        const excludeSet = new Set(Array.from(st.exclude));
        values = values.filter((v) => !excludeSet.has(v.name));
      } // mode "all" keeps original values

      result.push({ id: attr.id, name: attr.name, values, metadata: attr.metadata });
    });
    return result;
  }, [selection, attrs]);

  useEffect(() => {
    if (onChange) onChange(selectedAttributes);
  }, [selectedAttributes, onChange]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedAttributes, null, 2));
    } catch {}
  };

  return (
    <section className="bg-gray-50 rounded-lg shadow-md border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">🧩 Attributes to cache</h2>
        <p className="text-sm text-gray-600 mt-1">Select entire attributes or specific values to include/exclude for caching.</p>
        <div className="mt-4 flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search attributes…" className="flex-1 px-3 py-2 border rounded-md" />
          <button onClick={copyToClipboard} className="px-4 py-2 rounded-md bg-gray-800 text-white text-sm">Copy JSON</button>
        </div>
      </div>

      <div className="p-6">
        {loading && <div className="text-gray-600">Loading attributes…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && filtered.map((attr) => (
          <AttributeRow key={attr.id} attr={attr} state={getStateFor(attr)} onChange={(st) => updateStateFor(attr, st)} />
        ))}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-gray-500">No attributes match your search.</div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="text-sm text-gray-600">Selected {selectedAttributes.length} attributes.</div>
      </div>
    </section>
  );
};

export default AttributesCacheSection;
