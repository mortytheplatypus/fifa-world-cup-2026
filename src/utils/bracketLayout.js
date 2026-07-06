/** 1-indexed CSS grid row for a match in a tournament column layout. */
export function getBracketGridRow(roundIndex, matchIndex) {
  return matchIndex * 2 ** (roundIndex + 1) + 2 ** roundIndex;
}

export function getBracketTotalRows(firstRoundMatchCount) {
  return 2 * firstRoundMatchCount - 1;
}

export function getBracketMatchColumn(roundIndex) {
  return roundIndex * 2 + 1;
}

export function getBracketGutterColumn(roundIndex) {
  return (roundIndex + 1) * 2;
}

export function buildHorizontalConnectorPath(from, to) {
  return `M ${from.x} ${from.y} H ${to.x}`;
}

export function buildBracketConnectorPaths(sourceA, sourceB, target) {
  const midX = (sourceA.x + target.x) / 2;
  const midY = (sourceA.y + sourceB.y) / 2;

  return [
    `M ${sourceA.x} ${sourceA.y} H ${midX}`,
    `M ${sourceB.x} ${sourceB.y} H ${midX}`,
    `M ${midX} ${sourceA.y} V ${sourceB.y}`,
    `M ${midX} ${midY} H ${target.x}`,
  ];
}

export function getMatchAnchor(element, side, containerRect) {
  const rect = element.getBoundingClientRect();

  return {
    x:
      side === "right"
        ? rect.right - containerRect.left
        : rect.left - containerRect.left,
    y: rect.top + rect.height / 2 - containerRect.top,
  };
}
