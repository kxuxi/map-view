(() => {
  const mapView = globalThis.CityMapView;
  const SIDES = ['top', 'right', 'bottom', 'left'];

  function clearMapDecorations() {
    document.querySelectorAll('.cc-cell-label, .cc-cell-edge').forEach(element => element.remove());
    document.querySelectorAll('.cc-cell').forEach(box => {
      box.classList.remove('cc-cell', 'cc-here');
      box.style.removeProperty('--cc-fill');
      box.style.removeProperty('--cc-ink');
      box.style.removeProperty('--cc-border-width');
    });
  }

  function ensureIconRow(box) {
    let iconRow = box.querySelector(':scope > .cc-cell-icons');
    if (!iconRow) {
      const cityIcon = box.querySelector('.MAP_CELL_CITY_GIF') || box.querySelector('img[src*="/image/m_"]');
      const kingIcon = box.querySelector('.MAP_CELL_KING_GIF');
      if (cityIcon || kingIcon) {
        iconRow = document.createElement('div');
        iconRow.className = 'cc-cell-icons';
        if (kingIcon) iconRow.append(kingIcon);
        if (cityIcon) iconRow.append(cityIcon);
        box.append(iconRow);
      }
    }

    box.querySelectorAll('.MAP_CELL_BORDER, .MAP_MY_POSITION_CELL_BORDER').forEach(frame => {
      if (!frame.children.length) frame.classList.add('cc-cell-frame-empty');
    });
  }

  function createCellDecorations(item, items, nationColor) {
    const { box, city } = item;
    const rgb = item.rgb || nationColor.get(city.nation) || [128, 128, 128];
    const label = document.createElement('div');
    label.className = 'cc-cell-label';
    label.textContent = city.name;

    const edge = document.createElement('div');
    edge.className = 'cc-cell-edge';
    edge.style.inset = `-${item.borderWidth}px`;

    const frontier = `3px solid rgb(${rgb.join(',')})`;
    const inner = '1px dotted #000';
    for (const side of SIDES) {
      const neighbor = mapView.findNeighbor(items, item, side);
      const sameNation = neighbor && city.nation && neighbor.city.nation === city.nation;
      edge.style[`border-${side}`] = !sameNation
        ? frontier
        : (side === 'right' || side === 'bottom') ? inner : 'none';
    }

    return { label, edge, rgb };
  }

  function renderMap() {
    clearMapDecorations();
    const { items, nationColor } = mapView.collectMapItems();

    for (const item of items) {
      const { box, isHere, city } = item;
      const { label, edge, rgb } = createCellDecorations(item, items, nationColor);
      ensureIconRow(box);
      box.append(label, edge);
      box.classList.add('cc-cell');
      box.classList.toggle('cc-here', isHere);
      box.style.setProperty('--cc-fill', mapView.mix(rgb, [255, 255, 255], .72));
      box.style.setProperty('--cc-ink', mapView.mix(rgb, [0, 0, 0], .6));
      box.style.setProperty('--cc-border-width', `${item.borderWidth}px`);
    }
  }

  mapView.renderMap = renderMap;
})();