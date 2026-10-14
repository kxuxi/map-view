// ページを読んで表示を足すだけ。送信・自動操作は一切しない。
(() => {
  const mapView = globalThis.CityMapView;
  mapView.renderMap();
  mapView.observeMap(mapView.renderMap);
})();