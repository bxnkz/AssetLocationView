export function generateRowPattern(
  config: any,
  startX: number,
  startY: number,
  scale: number
) {
  const {
    deskWidth,
    deskHeight,
    spacingX,
    spacingY,
    totalDesks,
  } = config;

  const pattern = [2, 3, 2, 3];
  const desks: any[] = [];

  let count = 0;
  let y = startY;
  let row = 0;

  while (count < totalDesks) {
    const desksInRow = pattern[row % pattern.length];
    let x = startX;

    for (let i = 0; i < desksInRow; i++) {
      if (count >= totalDesks) break;

      desks.push({
        id: `desk-${count}`,
        name: `${count + 1}`,
        x,
        y,
        width: deskWidth * scale,
        height: deskHeight * scale,
      });

      x += (deskWidth + spacingX) * scale;
      count++;
    }

    y += (deskHeight + spacingY) * scale;
    row++;
  }

  return desks;
}