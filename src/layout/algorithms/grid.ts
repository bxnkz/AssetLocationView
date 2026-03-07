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

  const margin = 1; // เว้นผนัง 1 เมตร

  // พื้นที่ที่ใช้วางโต๊ะจริง
  const usableWidth = roomWidth - margin * 2;
  const usableHeight = roomHeight - margin * 2;

  // จำนวนคอลัมน์ / แถวที่วางได้
  const maxCols = Math.floor(usableWidth / (deskWidth + spacingX));
  const maxRows = Math.floor(usableHeight / (deskHeight + spacingY));

  // ความกว้าง grid โต๊ะจริง
  const gridWidth =
    maxCols * deskWidth + (maxCols - 1) * spacingX;

  const gridHeight =
    maxRows * deskHeight + (maxRows - 1) * spacingY;

  // offset เพื่อให้โต๊ะอยู่กลางห้อง
  const offsetX = (usableWidth - gridWidth) / 2;
  const offsetY = (usableHeight - gridHeight) / 2;

  const desks: any[] = [];
  let count = 0;

  for (let r = 0; r < maxRows; r++) {
    for (let c = 0; c < maxCols; c++) {
      if (count >= totalDesks) break;

      desks.push({
        id: `desk-${count}`,
        name: `${count + 1}`,

        x:
          startX +
          (margin + offsetX + c * (deskWidth + spacingX)) * scale,

        y:
          startY +
          (margin + offsetY + r * (deskHeight + spacingY)) * scale,

        width: deskWidth * scale,
        height: deskHeight * scale,
      });

      count++;
    }

    if (count >= totalDesks) break;
  }

  return desks;
}