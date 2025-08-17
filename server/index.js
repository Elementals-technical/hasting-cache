const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 8080;
const uiBuildPath = path.join(__dirname, "../dist");

// Налаштування multer для обробки FormData
const upload = multer({ memory: true });

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Збільшуємо ліміт для base64 зображень

// Simple health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Minimal API used by frontend during development
app.post("/cache-attributes", (req, res) => {
  try {
    const { attributes, assetId } = req.body || {};
    if (!Array.isArray(attributes)) {
      return res
        .status(400)
        .json({ ok: false, error: "attributes must be an array" });
    }
    const jobId = `job_${Date.now()}`;
    console.log("Received cache-attributes", {
      count: attributes.length,
      assetId,
      jobId,
    });
    return res.json({ ok: true, jobId });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/placeholder.svg", (req, res) => {
  const svgPath = path.join(__dirname, "../public/placeholder.svg");
  if (fs.existsSync(svgPath)) {
    return res.sendFile(svgPath);
  }
  res.status(404).type("text/plain").send("placeholder.svg not found");
});

// Serve static files from the React app build directory (prod preview)
app.use(express.static(uiBuildPath));

// ------- Minimal caching runner (params from frontend) -------
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 10_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retryUntilSuccess(fn, label = "request") {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      console.warn(`[${label}] Attempt ${attempt} failed. Retrying in 2s...`);
      console.warn(err?.message || err);
      await sleep(2000);
    }
  }
}

// Stub of the actual Threekit request; keep it simple and non-blocking
async function requestCaching({ assetId, stageId, configuration }) {
  // Here you could call Threekit Fast Compositor API with node-fetch if envs are set
  // For now we simulate a quick success to keep server minimal
  await sleep(50);
  return { ok: true, assetId, stageId };
}

async function processBatch(assetId, batch, stageId, batchNumber, counter) {
  console.log(`🚀 Starting batch #${batchNumber} (${batch.length} configs)`);
  await Promise.all(
    batch.map((config, index) =>
      retryUntilSuccess(
        async () => {
          await requestCaching({ assetId, stageId, configuration: config });
          counter.count += 1;
          console.log(
            `[Asset ${assetId} | Batch ${batchNumber} - ${index + 1}] ✅ Processed. Total: ${counter.count}`
          );
        },
        `Asset ${assetId} | Batch ${batchNumber} - ${index + 1}`
      )
    )
  );
  console.log(`✅ Batch #${batchNumber} completed. Waiting ${BATCH_DELAY_MS / 1000}s...\n`);
  await sleep(BATCH_DELAY_MS);
}

// Normalize frontend attributes (objects) → simple generator shape
function normalizeAttributes(attrs) {
  return (Array.isArray(attrs) ? attrs : []).map((a) => {
    const values = Array.isArray(a.values)
      ? a.values.map((v) => (typeof v === 'string' ? v : v?.name)).filter(Boolean)
      : [];
    return {
      id: a.id || a.name,
      type: a.type || 'string',
      name: a.name,
      values,
      defaultValue: a.defaultValue || values[0] || '',
      enabled: a.enabled !== false,
      visible: a.visible !== false,
      hiddenValues: Array.isArray(a.hiddenValues) ? a.hiddenValues : [],
      disabledValues: Array.isArray(a.disabledValues) ? a.disabledValues : [],
    };
  });
}

function* cartesianProductGenerator(arrays) {
  if (!arrays.length) {
    yield [];
    return;
  }
  const [first, ...rest] = arrays;
  for (const v of first) {
    for (const tail of cartesianProductGenerator(rest)) {
      yield [v, ...tail];
    }
  }
}

function* generateConfigurations(attributes) {
  const validAttributes = (attributes || []).filter(
    (attr) => attr.enabled && Array.isArray(attr.values) && attr.values.length > 0 &&
      attr.name !== 'stage' && attr.name !== 'accessories' && attr.name !== 'versattachAccessories'
  );

  if (!validAttributes.length) {
    const cameraAttr = (attributes || []).find((a) => a.name === 'Camera' && a.enabled);
    const stageAttr = (attributes || []).find((a) => a.name === 'stage' && a.enabled);
    yield {
      Camera: (cameraAttr?.values?.[0]) || cameraAttr?.defaultValue || 'Main Camera',
      stage: (stageAttr?.values?.[0]) || 'WhiteRoom',
      accessories: '',
      versattachAccessories: '',
    };
    return;
  }

  const optionValues = validAttributes.map((attr) =>
    (attr.values || []).filter((val) => !attr.hiddenValues?.includes(val) && !attr.disabledValues?.includes(val))
  );

  const stageAttr = (attributes || []).find((a) => a.name === 'stage' && a.enabled);
  const stage = (stageAttr?.values?.[0]) || 'WhiteRoom';
  const cameraAttr = (attributes || []).find((a) => a.name === 'Camera' && a.enabled);
  const defaultCamera = (cameraAttr?.values?.[0]) || cameraAttr?.defaultValue || 'Main Camera';

  for (const combination of cartesianProductGenerator(optionValues)) {
    const conf = { Camera: defaultCamera, stage, accessories: '', versattachAccessories: '' };
    validAttributes.forEach((attr, idx) => { conf[attr.name] = combination[idx]; });
    yield conf;
  }
}

// POST /cache/run — запускає процес кешування з параметрами від фронту
app.get('/cache/run', (_req, res) => {
  return res.json({ ok: true, hint: 'Use POST with { ASSET_IDS: string[], STAGE_ID: string, ATTRIBUTES_Array: Attribute[] }' });
});

app.post('/cache/run', async (req, res) => {
  try {
    const { ASSET_IDS, STAGE_ID, ATTRIBUTES_Array } = req.body || {};
    if (!Array.isArray(ASSET_IDS) || !ASSET_IDS.every((x) => typeof x === 'string')) {
      return res.status(400).json({ ok: false, error: 'ASSET_IDS must be an array of strings' });
    }
    if (typeof STAGE_ID !== 'string' || !STAGE_ID) {
      return res.status(400).json({ ok: false, error: 'STAGE_ID must be a non-empty string' });
    }
    if (!Array.isArray(ATTRIBUTES_Array)) {
      return res.status(400).json({ ok: false, error: 'ATTRIBUTES_Array must be an array' });
    }

    const jobId = `job_${Date.now()}`;
    res.status(202).json({ ok: true, jobId });

    // run in background
    (async () => {
      const attrs = normalizeAttributes(ATTRIBUTES_Array);
      const counter = { count: 0 };

      for (const assetId of ASSET_IDS) {
        const allConfigurations = Array.from(generateConfigurations(attrs));
  console.log(`Total configurations for asset ${assetId}: ${allConfigurations.length}`);

        let batchNumber = 1;
        for (let i = 0; i < allConfigurations.length; i += BATCH_SIZE) {
          const batch = allConfigurations.slice(i, i + BATCH_SIZE);
      await processBatch(assetId, batch, STAGE_ID, batchNumber, counter);
          batchNumber++;
        }
      }

    console.log(`🎉 Job ${jobId} finished. Total processed: ${counter.count}`);
    })().catch((e) => console.error(`Background job ${jobId} failed`, e));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// SPA fallback - serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(uiBuildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
