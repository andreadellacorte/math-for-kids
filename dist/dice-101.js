"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // js/games/dice-101.ts
  var THREE = __toESM(__require("https://esm.sh/three@0.152.2"));
  var OIMO = __toESM(__require("https://esm.sh/oimo"));
  var import_OrbitControls = __require("https://esm.sh/three@0.152.2/examples/jsm/controls/OrbitControls.js");
  var import_RoundedBoxGeometry = __require("https://esm.sh/three@0.152.2/examples/jsm/geometries/RoundedBoxGeometry.js");
  (function() {
    const diceContainer = document.getElementById("dice3d");
    const hud = document.getElementById("hud");
    const rollBtn = document.getElementById("rollBtn");
    const stopBtn = document.getElementById("stopBtn");
    const resetBtn = document.getElementById("resetBtn");
    const statusToast = document.getElementById("statusToast");
    const amountLabel = document.getElementById("amountLabel");
    const totalLabel = document.getElementById("totalLabel");
    const turnLabel = document.getElementById("turnLabel");
    const playerDot = document.getElementById("playerDot");
    const prescreen = document.getElementById("prescreen");
    const onePlayerBtn = document.getElementById("onePlayer");
    const twoPlayersBtn = document.getElementById("twoPlayers");
    const TARGET = 101;
    const COLORS = { pink: "#ffd1dc", blue: "#cce5ff" };
    const state = {
      numPlayers: 0,
      currentPlayerIdx: 0,
      players: [
        { name: "Player 1", color: COLORS.blue, total: 0 },
        { name: "Player 2", color: COLORS.pink, total: 0 }
      ],
      rolling: false,
      diceEntities: [],
      world: null,
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      settleTimer: 0
    };
    function setStatus(text) {
      statusToast.textContent = text;
    }
    function init3D() {
      const width = diceContainer.clientWidth;
      const height = diceContainer.clientHeight;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.shadowMap.enabled = true;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      diceContainer.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1e3);
      camera.position.set(-10, 14, 14);
      camera.lookAt(0, 0, 0);
      const controls = new import_OrbitControls.OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.minPolarAngle = 0.2;
      controls.maxPolarAngle = Math.PI / 2 - 0.1;
      const ambient = new THREE.AmbientLight(16777215, 0.9);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(16777215, 1.2);
      dir.position.set(-12, 18, 8);
      dir.castShadow = true;
      dir.shadow.mapSize.set(1024, 1024);
      scene.add(dir);
      const planeGeo = new THREE.PlaneGeometry(80, 80);
      const planeMat = new THREE.MeshStandardMaterial({ color: 3114330, metalness: 0.2, roughness: 0.8 });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -1;
      plane.receiveShadow = true;
      scene.add(plane);
      const world = new OIMO.World({
        timestep: 1 / 60,
        iterations: 8,
        broadphase: 2,
        worldscale: 1,
        random: true,
        info: false,
        gravity: [0, -9.8 * 3, 0]
      });
      world.add({ type: "box", size: [160, 2, 160], pos: [0, -2, 0], rot: [0, 0, 0], move: false, density: 1 });
      const BOUND_X = 20;
      world.add({ type: "box", size: [1, 30, 160], pos: [-BOUND_X, 15, 0], rot: [0, 0, 0], move: false, density: 1 });
      world.add({ type: "box", size: [1, 30, 160], pos: [BOUND_X, 15, 0], rot: [0, 0, 0], move: false, density: 1 });
      state.scene = scene;
      state.camera = camera;
      state.renderer = renderer;
      state.controls = controls;
      state.world = world;
      function animate() {
        requestAnimationFrame(animate);
        if (state.world) {
          state.world.step(1 / 60);
        }
        for (const d of state.diceEntities) {
          const p = d.body.getPosition();
          const q = d.body.getQuaternion();
          d.mesh.position.set(p.x, p.y, p.z);
          d.mesh.quaternion.set(q.x, q.y, q.z, q.w);
        }
        controls.update();
        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);
      window.addEventListener("resize", onResize);
      function onResize() {
        const w = diceContainer.clientWidth;
        const h = diceContainer.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h || 1;
        camera.updateProjectionMatrix();
      }
    }
    function createDieFaceTexture(value, size = 256, bgColor = "#ffffff") {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return new THREE.CanvasTexture(canvas);
      }
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = size * 0.06;
      ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth);
      const pipRadius = size * 0.08;
      ctx.fillStyle = "#111827";
      function pip(ix, iy) {
        const gx = [0.2, 0.5, 0.8][ix - 1];
        const gy = [0.2, 0.5, 0.8][iy - 1];
        ctx.beginPath();
        ctx.arc(gx * size, gy * size, pipRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      const map = {
        1: [[2, 2]],
        2: [[1, 1], [3, 3]],
        3: [[1, 1], [2, 2], [3, 3]],
        4: [[1, 1], [3, 1], [1, 3], [3, 3]],
        5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]],
        6: [[1, 1], [1, 2], [1, 3], [3, 1], [3, 2], [3, 3]]
      };
      for (const pair of map[value] || map[1]) {
        pip(pair[0], pair[1]);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8;
      texture.needsUpdate = true;
      return texture;
    }
    function createDiceMesh(bgColor) {
      const tex = {
        1: createDieFaceTexture(1, 256, bgColor),
        2: createDieFaceTexture(2, 256, bgColor),
        3: createDieFaceTexture(3, 256, bgColor),
        4: createDieFaceTexture(4, 256, bgColor),
        5: createDieFaceTexture(5, 256, bgColor),
        6: createDieFaceTexture(6, 256, bgColor)
      };
      const mopts = (t) => ({ map: t, roughness: 0.45, metalness: 0.05 });
      const materials = [
        new THREE.MeshStandardMaterial(mopts(tex[3])),
        new THREE.MeshStandardMaterial(mopts(tex[4])),
        new THREE.MeshStandardMaterial(mopts(tex[1])),
        new THREE.MeshStandardMaterial(mopts(tex[6])),
        new THREE.MeshStandardMaterial(mopts(tex[2])),
        new THREE.MeshStandardMaterial(mopts(tex[5]))
      ];
      const geometry = new import_RoundedBoxGeometry.RoundedBoxGeometry(2, 2, 2, 6, 0.24);
      const mesh = new THREE.Mesh(geometry, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = false;
      return mesh;
    }
    function spawnDicePair(color) {
      for (const d of state.diceEntities) {
        state.scene.remove(d.mesh);
      }
      state.diceEntities = [];
      const positions = [{ x: -1.4, y: 14, z: 0 }, { x: 1.4, y: 15, z: 0 }];
      for (let i = 0; i < 2; i++) {
        const mesh = createDiceMesh(color);
        mesh.position.set(positions[i].x, positions[i].y, positions[i].z);
        state.scene.add(mesh);
        const body = state.world.add({
          type: "box",
          size: [2, 2, 2],
          pos: [positions[i].x, positions[i].y, positions[i].z],
          rot: [Math.random() * 360, Math.random() * 360, Math.random() * 360],
          move: true,
          density: 2,
          friction: 0.5,
          restitution: 0.75
        });
        state.diceEntities.push({ mesh, body, color });
      }
    }
    function quaternionToTopValue(q) {
      const up = new THREE.Vector3(0, 1, 0);
      const normals = [
        { n: new THREE.Vector3(1, 0, 0), v: 3 },
        { n: new THREE.Vector3(-1, 0, 0), v: 4 },
        { n: new THREE.Vector3(0, 1, 0), v: 1 },
        { n: new THREE.Vector3(0, -1, 0), v: 6 },
        { n: new THREE.Vector3(0, 0, 1), v: 2 },
        { n: new THREE.Vector3(0, 0, -1), v: 5 }
      ];
      let best = { dot: -Infinity, value: 1 };
      for (const f of normals) {
        const n = f.n.clone().applyQuaternion(q);
        const d = n.dot(up);
        if (d > best.dot) {
          best = { dot: d, value: f.v };
        }
      }
      return best.value;
    }
    function getDiceValues() {
      return state.diceEntities.map((d) => {
        const q = d.body.getQuaternion();
        const qt = new THREE.Quaternion(q.x, q.y, q.z, q.w);
        return quaternionToTopValue(qt);
      });
    }
    function updateHUD(amount) {
      amountLabel.textContent = `Amount: ${amount || "-"}`;
      const player = state.players[state.currentPlayerIdx];
      totalLabel.textContent = `Total: ${player.total}`;
      turnLabel.textContent = state.numPlayers === 2 ? state.currentPlayerIdx === 0 ? "Player 1" : "Player 2" : "Player";
      playerDot.className = "chip-dot " + (state.currentPlayerIdx === 0 ? "blue" : "pink");
    }
    function mostFrequentValue(arr) {
      const counts = /* @__PURE__ */ new Map();
      for (const v of arr) {
        counts.set(v, (counts.get(v) || 0) + 1);
      }
      let bestVal = arr[0], bestCount = -1;
      for (const [v, c] of counts) {
        if (c > bestCount) {
          bestVal = v;
          bestCount = c;
        }
      }
      return bestVal;
    }
    async function readStableValues(samples = 7, gapMs = 50) {
      const readings = Array.from({ length: state.diceEntities.length }, () => []);
      for (let i = 0; i < samples; i++) {
        const vals = getDiceValues();
        for (let d = 0; d < vals.length; d++) {
          readings[d].push(vals[d]);
        }
        await new Promise((r) => setTimeout(r, gapMs));
      }
      return readings.map((list) => mostFrequentValue(list));
    }
    function getBodySpeed(body) {
      const lv = body && body.getLinearVelocity ? body.getLinearVelocity() : { x: 0, y: 0, z: 0 };
      const av = body && body.getAngularVelocity ? body.getAngularVelocity() : { x: 0, y: 0, z: 0 };
      const lin = Math.sqrt((lv.x || 0) * (lv.x || 0) + (lv.y || 0) * (lv.y || 0) + (lv.z || 0) * (lv.z || 0));
      const ang = Math.sqrt((av.x || 0) * (av.x || 0) + (av.y || 0) * (av.y || 0) + (av.z || 0) * (av.z || 0));
      return { lin, ang };
    }
    function waitForSettle(timeoutMs = 7e3, linThresh = 0.1, angThresh = 0.1, consecutiveFrames = 30, minActiveMs = 900, graceMs = 300) {
      return new Promise((resolve) => {
        let settledCount = 0;
        const start = performance.now();
        function tick() {
          const now = performance.now();
          const allSettled = state.diceEntities.length > 0 && state.diceEntities.every((d) => {
            const s = getBodySpeed(d.body);
            return s.lin < linThresh && s.ang < angThresh;
          });
          if (now - start >= minActiveMs) {
            if (allSettled) settledCount++;
            else settledCount = 0;
          }
          const timedOut = now - start > timeoutMs;
          if (settledCount >= consecutiveFrames || timedOut) {
            setTimeout(() => {
              const finallySettled = state.diceEntities.length > 0 && state.diceEntities.every((d) => {
                const s = getBodySpeed(d.body);
                return s.lin < linThresh && s.ang < angThresh;
              });
              resolve(finallySettled);
            }, graceMs);
          } else {
            requestAnimationFrame(tick);
          }
        }
        requestAnimationFrame(tick);
      });
    }
    function nextPlayer() {
      if (state.numPlayers === 2) {
        state.currentPlayerIdx = (state.currentPlayerIdx + 1) % 2;
        setStatus(`Turn: ${state.currentPlayerIdx === 0 ? "Player 1" : "Player 2"}`);
        updateHUD(0);
      }
    }
    function endGameIfNeeded() {
      const p1 = state.players[0];
      const p2 = state.players[1];
      if (state.numPlayers === 1) {
        if (p1.total > TARGET) {
          setStatus(`Bust! Over by ${p1.total - TARGET}.`);
        }
        return;
      }
      if (state.currentPlayerIdx === 1 && p2.total >= 0) {
        const s1 = p1.total <= TARGET ? p1.total : -Infinity;
        const s2 = p2.total <= TARGET ? p2.total : -Infinity;
        if (s1 === s2) {
          setStatus("Tie!");
        } else if (s1 > s2) {
          setStatus("Player 1 wins!");
        } else {
          setStatus("Player 2 wins!");
        }
      }
    }
    async function startRoll() {
      if (state.rolling) return;
      state.rolling = true;
      rollBtn.disabled = true;
      stopBtn.disabled = true;
      const player = state.players[state.currentPlayerIdx];
      setStatus("Rolling...");
      spawnDicePair(player.color);
      await waitForSettle(7e3, 0.08, 0.08, 36, 1100, 350);
      const values = await readStableValues(9, 45);
      const amount = (values[0] || 0) + (values[1] || 0);
      player.total += amount;
      updateHUD(amount);
      if (player.total === TARGET) {
        setStatus("Exact 101! You win!");
        state.rolling = false;
        rollBtn.disabled = true;
        stopBtn.disabled = true;
        return;
      }
      if (player.total > TARGET) {
        setStatus(`Bust! Over by ${player.total - TARGET}.`);
        state.rolling = false;
        if (state.numPlayers === 2) {
          if (state.currentPlayerIdx === 0) {
            nextPlayer();
            rollBtn.disabled = false;
            stopBtn.disabled = false;
          } else {
            endGameIfNeeded();
            rollBtn.disabled = true;
            stopBtn.disabled = true;
          }
        } else {
          rollBtn.disabled = true;
          stopBtn.disabled = true;
        }
        return;
      }
      setStatus("Choose: Roll again or Stop.");
      state.rolling = false;
      rollBtn.disabled = false;
      stopBtn.disabled = false;
    }
    function stopTurn() {
      if (state.rolling) return;
      if (state.numPlayers === 2) {
        if (state.currentPlayerIdx === 0) {
          nextPlayer();
          rollBtn.disabled = false;
          stopBtn.disabled = false;
        } else {
          endGameIfNeeded();
          rollBtn.disabled = true;
          stopBtn.disabled = true;
        }
      } else {
        setStatus("Stopped.");
        rollBtn.disabled = true;
        stopBtn.disabled = true;
      }
    }
    function resetGame() {
      for (const d of state.diceEntities) {
        state.scene.remove(d.mesh);
      }
      state.diceEntities = [];
      state.players[0].total = 0;
      state.players[1].total = 0;
      state.currentPlayerIdx = 0;
      state.rolling = false;
      updateHUD(0);
      setStatus("Press Start");
      rollBtn.disabled = false;
      stopBtn.disabled = false;
      prescreen.style.display = "";
    }
    function startMode(players) {
      state.numPlayers = players;
      prescreen.style.display = "none";
      setStatus(`Turn: ${players === 2 ? "Player 1" : "Player"}`);
      updateHUD(0);
    }
    onePlayerBtn.addEventListener("click", () => startMode(1));
    twoPlayersBtn.addEventListener("click", () => startMode(2));
    rollBtn.addEventListener("click", startRoll);
    stopBtn.addEventListener("click", stopTurn);
    resetBtn.addEventListener("click", resetGame);
    init3D();
    updateHUD(0);
  })();
  if (typeof window !== "undefined") {
  }
})();
//# sourceMappingURL=dice-101.js.map
