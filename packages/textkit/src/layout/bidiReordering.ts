import bidiFactory from 'bidi-js';
import stringLength from '../attributedString/length';
import { AttributedString, Paragraph } from '../types';

const bidi = bidiFactory();

/**
 * Partition an array of levels into segments where the level is uniform.
 * Each segment is an object { start, end, level } (both indices inclusive).
 */
const partitionLevels = (
  levels: number[],
): { start: number; end: number; level: number }[] => {
  const partitions = [];
  let start = 0;
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] !== levels[i - 1]) {
      partitions.push({ start, end: i - 1, level: levels[i - 1] });
      start = i;
    }
  }
  partitions.push({
    start,
    end: levels.length - 1,
    level: levels[levels.length - 1],
  });
  return partitions;
};

/**
 * Reorders a single line (AttributedString) using the bidi embedding levels.
 * The function:
 *   1. Computes the embedding levels for the entire line.
 *   2. Partitions the line into segments of uniform level.
 *   3. For each segment whose level exceeds the base level, reverses that segment.
 *   4. Flattens all glyphs and positions and then reassembles the original runs using a running offset.
 */
const reorderLine = (line: AttributedString): AttributedString => {
  // Determine base level from the first run's direction.
  const baseLevel = line.runs[0]?.attributes.direction === 'rtl' ? 1 : 0;
  // Compute embedding levels for the entire line.
  const { levels } = bidi.getEmbeddingLevels(line.string, baseLevel);

  // If the line is uniform, no reordering is needed.
  if (levels.every((l) => l === levels[0])) {
    return line;
  }

  // Partition the line into segments of uniform level.
  const partitions = partitionLevels(levels);

  // Flatten all glyphs and positions from all runs into global arrays.
  const globalGlyphs = line.runs.reduce(
    (acc, run) => acc.concat(run.glyphs || []),
    [],
  );
  const globalPositions = line.runs.reduce(
    (acc, run) => acc.concat(run.positions || []),
    [],
  );

  // Reassemble the string, glyphs, and positions by processing each partition.
  const reorderedGlyphs = [];
  const reorderedPositions = [];
  for (const part of partitions) {
    let segStr = line.string.slice(part.start, part.end + 1);
    let segGlyphs = globalGlyphs.slice(part.start, part.end + 1);
    let segPositions = globalPositions.slice(part.start, part.end + 1);
    // Reverse the segment if its level is greater than the base level.
    if (part.level > baseLevel) {
      segStr = segStr.split('').reverse().join('');
      segGlyphs = segGlyphs.reverse();
      segPositions = segPositions.reverse();
    }
    reorderedGlyphs.push(...segGlyphs);
    reorderedPositions.push(...segPositions);
  }

  // Get the updated string from bidi-js (this may include additional reordering corrections).
  const updatedString = bidi.getReorderedString(line.string, {
    paragraphs: [{ start: 0, end: stringLength(line) - 1, level: baseLevel }],
    levels,
  });

  // Reassemble the runs: assign chunks from the reordered global arrays to each run,
  // using the original run lengths (i.e. a running offset into the global arrays).
  let offset = 0;
  const updatedRuns = line.runs.map((run) => {
    const runLen = run.end - run.start;
    const newRunGlyphs = reorderedGlyphs.slice(offset, offset + runLen);
    const newRunPositions = reorderedPositions.slice(offset, offset + runLen);
    offset += runLen;
    return { ...run, glyphs: newRunGlyphs, positions: newRunPositions };
  });

  return { ...line, string: updatedString, runs: updatedRuns };
};

const reorderParagraph = (paragraph: Paragraph): Paragraph =>
  paragraph.map(reorderLine);

/**
 * Performs bidi reordering on an array of paragraphs.
 */
const bidiReordering = () => {
  return (paragraphs: Paragraph[]): Paragraph[] =>
    paragraphs.map(reorderParagraph);
};

export default bidiReordering;
