Object.defineProperty(exports, "__esModule", { value: !0 });
class r {
  constructor(e) {
    Object.defineProperty(this, "mode", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: void 0
    }), this.mode = e || "framework", this._create();
  }
  _create() {
    console.log("hello");
  }
}
exports.default = r;
console.log(__dirname);
