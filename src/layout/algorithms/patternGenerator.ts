// patternGenerator.ts

export function generatePatterns(
  totalDesks: number,
  columns: number
): number[][] {
  const results: number[][] = [];

  function helper(
    remaining: number,
    colsLeft: number,
    current: number[]
  ) {
    if (colsLeft === 0) {
      if (remaining === 0) {
        results.push([...current]);
      }
      return;
    }

    for (let i = 1; i <= remaining; i++) {
      current.push(i);

      helper(
        remaining - i,
        colsLeft - 1,
        current
      );

      current.pop();
    }
  }

  helper(totalDesks, columns, []);

  return results;
}