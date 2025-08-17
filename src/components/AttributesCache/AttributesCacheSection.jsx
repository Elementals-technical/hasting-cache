import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedForCache } from '../../store/store';

// Helper to show labels
const getAttrLabel = (attr) => attr?.metadata?.Label || attr?.metadata?.Name || attr?.name || "Unnamed";
const getValueLabel = (v) => v?.metadata?.Label || v?.metadata?.label || v?.name || "Unnamed";

const AttributesCacheSection = ({ onChange }) => {
  const dispatch = useDispatch();
  const allAttributes = useSelector((s) => s.allAttributes) || [];
  const displayAttributes = useSelector((s) => s.displayAttributes) || [];
  const assetId = useSelector((s) => s.asset?.assetId) || '';

  // Minimal selection: checkbox per attribute to include the whole attribute (all values)
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  // Per-attribute selected values (by name)
  const [valueSelections, setValueSelections] = useState(() => new Map());
  // Expanded rows
  const [openIds, setOpenIds] = useState(() => new Set());
  // Per-attribute search text
  const [valueSearch, setValueSearch] = useState(() => ({}));

  // If displayAttributes provided, show only those; else show all
  const list = useMemo(() => {
    if (Array.isArray(displayAttributes) && displayAttributes.length) {
      const ids = new Set(displayAttributes.map((a) => a.id));
      return (allAttributes || []).filter((a) => ids.has(a.id));
    }
    return allAttributes;
  }, [allAttributes, displayAttributes]);

  const toggle = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const toggleOpen = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const setSearchFor = (id, val) => setValueSearch((prev) => ({ ...prev, [id]: val }));

  const toggleValue = (attrId, valueName, checked) => {
    setValueSelections((prev) => {
      const next = new Map(prev);
      const current = new Set(next.get(attrId) || []);
      if (checked) current.add(valueName); else current.delete(valueName);
      if (current.size === 0) next.delete(attrId); else next.set(attrId, current);
      return next;
    });
  };

  // Build output in the SAME format: include whole attribute when selected
  const selectedAttributes = useMemo(() => {
    const fullAttrSet = new Set(selectedIds);
    return (allAttributes || []).reduce((acc, a) => {
      const selectedVals = valueSelections.get(a.id);
      if (selectedVals && selectedVals.size > 0) {
        const set = new Set(selectedVals);
        const values = (a.values || []).filter((v) => set.has(v.name));
        if (values.length) acc.push({ id: a.id, name: a.name, values, metadata: a.metadata });
        return acc;
      }
      if (fullAttrSet.has(a.id)) {
        acc.push({ id: a.id, name: a.name, values: a.values || [], metadata: a.metadata });
      }
      return acc;
    }, []);
  }, [selectedIds, valueSelections, allAttributes]);

  useEffect(() => {
    if (onChange) onChange(selectedAttributes);
    dispatch(setSelectedForCache(selectedAttributes));
  }, [selectedAttributes, onChange, dispatch]);

  // cache/run controls
  const [stageId, setStageId] = useState("");
  const [assetIdsText, setAssetIdsText] = useState("");
  useEffect(() => {
    // Seed defaults from store once
    if (!assetIdsText && assetId) setAssetIdsText(assetId);
  }, [assetId, assetIdsText]);

  const runCache = async () => {
    const ids = assetIdsText.split(',').map((s) => s.trim()).filter(Boolean);
    const assets = ids.length ? ids : (assetId ? [assetId] : []);
    const stage = stageId.trim();
    if (!assets.length || !stage) {
      alert('Вкажіть Stage ID та хоча б один Asset ID.');
      return;
    }
    try {
      const res = await fetch('/cache/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ASSET_IDS: assets, STAGE_ID: stage, ATTRIBUTES_Array: selectedAttributes }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      alert(`Запущено кешування. jobId: ${json.jobId || 'n/a'}`);
    } catch (e) {
      console.error('cache/run error', e);
      alert(`Помилка запуску: ${e.message || e}`);
    }
  };

  return (
    <section className="bg-gray-50 rounded-lg shadow-md border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">🧩 Attributes to cache</h2>
        <p className="text-xs text-gray-600 mt-1">Виберіть атрибути для кешування (повністю).</p>
      </div>

      <div className="p-4">
        {list.length === 0 && (
          <div className="text-gray-500 text-sm">Немає атрибутів для відображення.</div>
        )}
        {list.map((attr) => {
          const isOpen = openIds.has(attr.id);
          const selValues = valueSelections.get(attr.id) || new Set();
          const search = valueSearch[attr.id] || "";
          const total = attr.values?.length || 0;
          const filteredValues = (attr.values || []).filter((v) =>
            getValueLabel(v).toLowerCase().includes(search.toLowerCase())
          );
          return (
            <div key={attr.id} className="border-b last:border-b-0 py-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedIds.has(attr.id)}
                  onChange={(e) => toggle(attr.id, e.target.checked)}
                />
                <span className="text-gray-900">{getAttrLabel(attr)}</span>
                <span className="ml-auto text-xs text-gray-500">
                  {selValues.size > 0 ? `${selValues.size}/${total} обрано` : `${total} значень`}
                </span>
                <button
                  type="button"
                  onClick={() => toggleOpen(attr.id)}
                  className="ml-3 px-2 py-1 text-xs border rounded text-gray-700"
                >
                  {isOpen ? 'Згорнути' : 'Значення'}
                </button>
              </div>

              {isOpen && (
                <div className="mt-3 pl-7">
                  <input
                    value={search}
                    onChange={(e) => setSearchFor(attr.id, e.target.value)}
                    placeholder="Пошук значень…"
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <div className="max-h-44 overflow-auto pr-1 space-y-1">
                    {filteredValues.length === 0 && (
                      <div className="text-xs text-gray-500">Нічого не знайдено</div>
                    )}
                    {filteredValues.map((v) => (
                      <label key={v.assetId || v.name} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selValues.has(v.name)}
                          onChange={(e) => toggleValue(attr.id, v.name, e.target.checked)}
                        />
                        <span className="text-gray-800">{getValueLabel(v)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t bg-gray-50 text-sm text-gray-700">Обрано атрибутів: {selectedAttributes.length}</div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="text-sm font-medium text-gray-800 mb-2">cache/run</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={stageId}
            onChange={(e) => setStageId(e.target.value)}
            placeholder="Stage ID"
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <input
            value={assetIdsText}
            onChange={(e) => setAssetIdsText(e.target.value)}
            placeholder="Asset IDs (через кому)"
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <button onClick={runCache} className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm whitespace-nowrap">Запустити</button>
        </div>
        <div className="text-xs text-gray-500 mt-1">Використовуються обрані атрибути вище. Якщо значення не обрані — кешується весь атрибут.</div>
      </div>
    </section>
  );
};

export default AttributesCacheSection;
