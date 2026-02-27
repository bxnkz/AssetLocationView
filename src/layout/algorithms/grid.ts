export function generateGrid(
  config: any,
  startX: number,
  startY: number,
  scale: number
) {
  const {
    roomWidth,
    roomHeight,
    deskWidth,
    deskHeight,
    spacingX,
    spacingY,
    totalDesks,
  } = config;

  const maxCols = Math.floor(roomWidth / (deskWidth + spacingX));
  const maxRows = Math.floor(roomHeight / (deskHeight + spacingY));

  const desks: any[] = [];
  let count = 0;

  for (let r = 0; r < maxRows; r++) {
    for (let c = 0; c < maxCols; c++) {
      if (count >= totalDesks) break;

      desks.push({
        id: `desk-${count}`,
        name: `${count + 1}`,
        x: startX + c * (deskWidth + spacingX) * scale,
        y: startY + r * (deskHeight + spacingY) * scale,
        width: deskWidth * scale,
        height: deskHeight * scale,
      });

      count++;
    }
  }

  return desks;
}