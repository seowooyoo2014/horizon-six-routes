'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createCanvas, Image: CanvasImage, loadImage } = require('@napi-rs/canvas');

const root = path.resolve(__dirname, '..');

function makeElement() {
  return {
    innerHTML: '', textContent: '', style: {},
    classList: { add() {}, remove() {} },
    addEventListener() {}, insertAdjacentHTML() {},
    querySelectorAll() { return []; }, querySelector() { return null; },
    firstElementChild: null
  };
}

function nativeReady(image, filename, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const poll = () => {
      if (image.width > 0 && image.height > 0) return resolve();
      if (Date.now() - started > timeoutMs) return reject(Error(`native image timeout ${filename}`));
      setTimeout(poll, 5);
    };
    poll();
  });
}

function createLocalImageClass({ delaySource, errorSource } = {}) {
  const pending = [];
  class LocalImage extends CanvasImage {
    set src(value) {
      this._src = value;
      const clean = String(value).split('?')[0];
      const filename = path.resolve(root, clean);
      const onload = this.onload;
      const onerror = this.onerror;
      this.onload = null;
      this.onerror = null;
      try {
        if (!fs.existsSync(filename)) throw Error(`missing image ${filename}`);
        super.src = filename;
        const boundedLoad = Promise.race([loadImage(filename), new Promise((resolve, reject) => setTimeout(() => reject(Error(`image decode timeout ${filename}`)), 1500))]);
        const native = Promise.all([boundedLoad, nativeReady(this, filename)]).then(([decoded]) => {
          this._decoded = decoded;
          return decoded;
        });
        if (errorSource && clean.endsWith(errorSource)) {
          this._decodePromise = native.then(() => {
            onload?.();
            throw Error(`simulated decode rejection ${clean}`);
          });
          this._decodePromise.catch(() => {});
          return;
        }
        if (delaySource && clean.endsWith(delaySource)) {
          let release;
          const released = new Promise(resolve => { release = resolve; });
          pending.push({ image: this, release });
          this._decodePromise = Promise.all([native, released]).then(([decoded]) => {
            onload?.();
            return decoded;
          });
          this._decodePromise.catch(() => {});
          return;
        }
        this._decodePromise = native.then(decoded => { onload?.(); return decoded; }, error => {
          onerror?.(error);
          throw error;
        });
        this._decodePromise.catch(() => {});
      } catch (error) {
        this._decodePromise = Promise.reject(error);
        this._decodePromise.catch(() => {});
        onerror?.(error);
      }
    }
    get src() { return this._src; }
    get naturalWidth() { return this.width; }
    get naturalHeight() { return this.height; }
    get complete() { return this.width > 0 && this.height > 0; }
    decode() { return this._decodePromise || Promise.reject(Error('image source not assigned')); }
  }
  LocalImage.pending = pending;
  LocalImage.release = source => {
    const item = pending.find(candidate => candidate.image._src?.split('?')[0].endsWith(source));
    if (!item) throw Error(`no delayed image ${source}`);
    item.release();
  };
  return LocalImage;
}

function bootHtmlOrder({ ImageClass = createLocalImageClass(), canvasWidth = 960, canvasHeight = 540 } = {}) {
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scriptFiles = [...index.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)]
    .map(match => match[1].split('?')[0]);
  assert(!scriptFiles.includes('interior_kit_v21.js'), 'legacy interior kit is not in index execution');

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const elements = {
    '#world': canvas, '#hud': makeElement(), '#overlay': makeElement(),
    '#toast': makeElement(), '#help': makeElement()
  };
  global.window = global;
  global.HL = {};
  global.document = {
    querySelector: selector => elements[selector] || null,
    getElementById: () => null,
    createElement: type => type === 'canvas' ? createCanvas(48, 72) : makeElement(),
    activeElement: null
  };
  global.addEventListener = () => {};
  Object.defineProperty(global, 'navigator', { value: { getGamepads: () => [] }, configurable: true });
  global.requestAnimationFrame = () => 1;
  global.confirm = () => false;
  global.prompt = () => null;
  global.performance = { now: () => 4200 };
  global.localStorage = {
    data: new Map(),
    getItem(key) { return this.data.get(key) ?? null; },
    setItem(key, value) { this.data.set(key, value); },
    removeItem(key) { this.data.delete(key); }
  };
  global.indexedDB = { open() { return {}; } };
  global.Audio = class { addEventListener() {} load() {} play() { return Promise.resolve(); } pause() {} };
  global.Image = ImageClass;
  for (const file of scriptFiles) {
    vm.runInThisContext(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
  }
  return { root, index, scriptFiles, canvas, elements, ImageClass, CanvasImage, loadImage };
}

module.exports = { bootHtmlOrder, createLocalImageClass, nativeReady, root };
