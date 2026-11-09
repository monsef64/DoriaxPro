# DoriaxPro — LuaDocs

Modern, responsive HTML documentation for the Doriax Lua scripting API.

- **Entry:** `LuaDocs/index.html` (landing + hero)
- **Guides:** `getting-started.html` (5-min quick start, lifecycle, scene flow)
- **Reference:** `api.html` (18 modules, 200+ classes & 70+ enums, searchable)
- **Examples:** `examples.html` (10 copy-paste cookbooks)
- **Assets:** `assets/css/style.css` + `assets/js/app.js` — mobile-first, dark/light/auto, offline-ready

## Local preview

```bash
# any static server
python3 -m http.server -d LuaDocs 8000
# -> http://localhost:8000
```

## How the API docs are built

The reference is hand-curated from the real bindings:

```
engine/core/script/binding/*.cpp
  ├─ ActionClassesLua.cpp  → Action, Ease, Animation, Particles…
  ├─ CoreClassesLua.cpp    → Engine, SceneManager, BundleManager…
  ├─ ECSClassesLua.cpp     → Entity, Transform, Physics, UI…
  ├─ MathClassesLua.cpp    → Vector2/3/4, Matrix, Quaternion, Ray…
  ├─ ObjectClassesLua.cpp  → Object, Camera, Light, Mesh, Model…
  └─ IO/Thread/Util…       → ResourceProgress, ThreadPool, Color…
```

Completion data comes from the same files via `generate_api_suggestions.py` → `engine_api_suggestions.h`.

To regenerate a JSON index (used for search) you can run:

```bash
python3 tools/gen_luadocs.py --bindings engine/core/script/binding --out LuaDocs/api/data.json
```

## CI

- **Build:** `.github/workflows/build-windows-linux.yml` — builds Windows x64 (MSVC) + Linux x64 (GCC) on every push, with `LuaDocs` lint.
- **Release:** `.github/workflows/release.yml` — on `v*` tags or published releases, builds x64 release artifacts and attaches `DoriaxPro-*-windows-x64.zip`, `…-linux-x64.tar.gz`, `…AppImage` + `SHA256SUMS.txt` to the GitHub Release, plus deploys `LuaDocs` to Pages.

Both workflows enforce `x86_64` (`-A x64` on MSVC, `-m64` check on GCC, `uname -m`).
