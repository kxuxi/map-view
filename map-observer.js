(() => {
  const mapView = globalThis.CityMapView;

  function isDecoration(node) {
    return node.nodeType === 1 && node.matches('.cc-cell-label, .cc-cell-edge');
  }

  function containsMap(node) {
    return node.nodeType === 1 && (node.matches('.map_image') || node.querySelector('.map_image'));
  }

  function observeMap(renderMap) {
    let redrawPending = false;
    const observer = new MutationObserver(records => {
      const mapChanged = records.some(record => {
        const insideMap = record.target.nodeType === 1 && record.target.closest('.map_image');
        const changedNodes = [...record.addedNodes, ...record.removedNodes];
        const changedMap = changedNodes.some(containsMap);
        const changedPageContent = changedNodes.some(node => !isDecoration(node));
        return changedMap || (insideMap && changedPageContent);
      });

      if (!mapChanged || redrawPending) return;
      redrawPending = true;
      requestAnimationFrame(() => {
        redrawPending = false;
        renderMap();
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
  }

  mapView.observeMap = observeMap;
})();