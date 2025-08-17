import React, { useMemo } from "react";

const formatBigInt = (n) => {
  const s = n.toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// attributes: array of { id, name, values: [...] }
const CombinationCounter = ({ attributes = [] }) => {
  const { total, perAttr, hasZero, selectedCount } = useMemo(() => {
    const per = attributes.map((a) => ({
      id: a.id,
      name: a.metadata?.Label || a.metadata?.Name || a.name,
      count: Array.isArray(a.values) ? a.values.length : 0,
    }));
    let product = 1n;
    for (const p of per) {
      product = product * BigInt(p.count);
    }
    return {
      total: product,
      perAttr: per,
      hasZero: per.some((p) => p.count === 0),
      selectedCount: per.length,
    };
  }, [attributes]);

  return (
    <section className="bg-white rounded-lg shadow-md border mt-6">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">📊 Combinations summary</h3>
        <p className="text-sm text-gray-600 mt-1">Simple cartesian product of selected attribute values.</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="text-3xl font-semibold text-gray-900">
          {selectedCount > 0 ? (
            <span>Total combinations: {formatBigInt(total)}</span>
          ) : (
            <span>Select attributes to compute combinations</span>
          )}
        </div>
        {hasZero && (
          <div className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded p-3">
            One or more selected attributes have 0 values – total combinations are 0.
          </div>
        )}
        {perAttr.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {perAttr.map((p) => (
              <div key={p.id} className="flex justify-between text-sm text-gray-700">
                <span className="truncate mr-2">{p.name}</span>
                <span className="font-medium">{p.count} values</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CombinationCounter;
