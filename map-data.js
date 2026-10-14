(() => {
  const mapView = globalThis.CityMapView = globalThis.CityMapView || {};

  function parseCity(cell) {
    const match = (cell.getAttribute('onmouseover') || '').match(/popup_title\('([^<【']+)(?:【([^】]*)】)?/);
    return match ? { name: match[1].trim(), nation: (match[2] || '').trim() } : null;
  }

  function rgbOf(color) {
    const match = String(color).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match ? match.slice(1).map(Number) : null;
  }

  function mix(rgb, target, amount) {
    return `rgb(${rgb.map((value, index) => Math.round(value + (target[index] - value) * amount)).join(',')})`;
  }

  function getCellContainer(cell) {
    if (!cell.matches('td')) return cell;

    const table = cell.closest('table');
    if (!table || table.classList.contains('map_image')) return cell;

    const cellRect = cell.getBoundingClientRect();
    const tableRect = table.getBoundingClientRect();
    return tableRect.width > cellRect.width * 2 || tableRect.height > cellRect.height * 2
      ? cell
      : table;
  }

  function collectMapItems() {
    const items = [];
    const nationColor = new Map();

    for (const cell of document.querySelectorAll('.map_image_cell, .map_image td[onmouseover]')) {
      const borderBox = cell.querySelector('.MAP_CELL_BORDER, .MAP_MY_POSITION_CELL_BORDER');
      const cellBox = getCellContainer(cell);
      const styleBox = borderBox || cellBox;
      const city = parseCity(cell);
      if (!city || !styleBox) continue;

      const style = getComputedStyle(styleBox);
      const boxStyle = getComputedStyle(cellBox);
      const rgb = rgbOf(style.borderTopColor);
      const isHere = style.borderTopStyle !== 'solid' || !rgb || Math.min(...rgb) > 200;
      if (!isHere && city.nation && !nationColor.has(city.nation)) nationColor.set(city.nation, rgb);
      items.push({
        box: cellBox,
        city,
        isHere,
        rgb: isHere ? null : rgb,
        borderWidth: parseFloat(boxStyle.borderTopWidth) || 0,
        rect: cellBox.getBoundingClientRect()
      });
    }

    return { items, nationColor };
  }

  function findNeighbor(items, item, side) {
    const near = (first, second, tolerance) => Math.abs(first - second) < tolerance;
    return items.find(other => other !== item && (
      side === 'right' ? near(other.rect.top, item.rect.top, 6) && near(other.rect.left, item.rect.right, item.rect.width * .3) :
      side === 'left' ? near(other.rect.top, item.rect.top, 6) && near(other.rect.right, item.rect.left, item.rect.width * .3) :
      side === 'bottom' ? near(other.rect.left, item.rect.left, 6) && near(other.rect.top, item.rect.bottom, item.rect.height * .3) :
      near(other.rect.left, item.rect.left, 6) && near(other.rect.bottom, item.rect.top, item.rect.height * .3)
    ));
  }

  Object.assign(mapView, { collectMapItems, findNeighbor, mix });
})();