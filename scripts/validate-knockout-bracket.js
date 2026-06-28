/**
 * Validates BRACKET_TREE feeder structure against KNOCKOUT_MATCHES winnerOf/loserOf chain.
 *
 * Usage: node scripts/validate-knockout-bracket.js
 */

const fs = require('fs');
const path = require('path');

const KNOCKOUT_JS = path.join(__dirname, '..', 'src', 'utils', 'knockout.js');

function readKnockoutSource() {
  return fs.readFileSync(KNOCKOUT_JS, 'utf8');
}

function extractObjectLiteral(source, exportName) {
  const marker = `export const ${exportName} = `;
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error(`${exportName} not found in knockout.js`);
  }

  const braceStart = source.indexOf('{', start);
  let depth = 0;

  for (let i = braceStart; i < source.length; i += 1) {
    if (source[i] === '{') {
      depth += 1;
    }
    if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        return Function(`"use strict"; return (${source.slice(braceStart, i + 1)});`)();
      }
    }
  }

  throw new Error(`Could not parse ${exportName}`);
}

function extractWinnerFeeds(source) {
  const feeds = {};
  const re =
    /(M(?:89|9\d|10[0-4])):[\s\S]*?teamA:\s*(?:winnerOf|loserOf)\("(M\d+)"\),\s*teamB:\s*(?:winnerOf|loserOf)\("(M\d+)"\)/g;
  let match;

  while ((match = re.exec(source)) !== null) {
    feeds[match[1]] = [match[2], match[3]];
  }

  return feeds;
}

function feederSet(feeders) {
  return [...feeders].sort().join(',');
}

function validatePair(pair, winnerFeeds, errors, label) {
  const r16Feeders = winnerFeeds[pair.r16];
  if (!r16Feeders) {
    errors.push(`${label}: missing KNOCKOUT_MATCHES entry for ${pair.r16}`);
    return;
  }

  const expected = feederSet(r16Feeders);
  const actual = feederSet(pair.r32);

  if (expected !== actual) {
    errors.push(
      `${label}: ${pair.r16} expects feeders [${r16Feeders.join(', ')}] but tree has [${pair.r32.join(', ')}]`,
    );
  }
}

function validateQuarter(quarter, winnerFeeds, errors, label) {
  validatePair(quarter.pair1, winnerFeeds, errors, `${label} pair1`);
  validatePair(quarter.pair2, winnerFeeds, errors, `${label} pair2`);

  const qfFeeders = winnerFeeds[quarter.r16];
  if (!qfFeeders) {
    errors.push(`${label}: missing KNOCKOUT_MATCHES entry for QF ${quarter.r16}`);
    return;
  }

  const expected = feederSet(qfFeeders);
  const actual = feederSet([quarter.pair1.r16, quarter.pair2.r16]);

  if (expected !== actual) {
    errors.push(
      `${label}: QF ${quarter.r16} expects R16 feeders [${qfFeeders.join(', ')}] but tree has [${quarter.pair1.r16}, ${quarter.pair2.r16}]`,
    );
  }
}

function validatePath(pathHalf, pathKey, winnerFeeds, errors) {
  validateQuarter(
    pathHalf.quarter1,
    winnerFeeds,
    errors,
    `${pathKey} quarter1`,
  );
  validateQuarter(
    pathHalf.quarter2,
    winnerFeeds,
    errors,
    `${pathKey} quarter2`,
  );

  const sfFeeders = winnerFeeds[pathHalf.sf];
  if (!sfFeeders) {
    errors.push(`${pathKey}: missing KNOCKOUT_MATCHES entry for SF ${pathHalf.sf}`);
    return;
  }

  const expected = feederSet(sfFeeders);
  const actual = feederSet([pathHalf.quarter1.r16, pathHalf.quarter2.r16]);

  if (expected !== actual) {
    errors.push(
      `${pathKey}: SF ${pathHalf.sf} expects QF feeders [${sfFeeders.join(', ')}] but tree has [${pathHalf.quarter1.r16}, ${pathHalf.quarter2.r16}]`,
    );
  }
}

function validate() {
  const source = readKnockoutSource();
  const tree = extractObjectLiteral(source, 'BRACKET_TREE');
  const winnerFeeds = extractWinnerFeeds(source);
  const errors = [];

  if (!tree.left || !tree.right) {
    errors.push('BRACKET_TREE must define left and right paths');
  }

  if (tree.upper || tree.lower) {
    errors.push('BRACKET_TREE still uses upper/lower paths (expected left/right)');
  }

  if (tree.left) {
    validatePath(tree.left, 'left', winnerFeeds, errors);
  }

  if (tree.right) {
    validatePath(tree.right, 'right', winnerFeeds, errors);
  }

  if (feederSet(winnerFeeds.M101) !== feederSet(['M97', 'M98'])) {
    errors.push('M101 must be W97 vs W98 (FIFA/ESPN)');
  }

  if (feederSet(winnerFeeds.M102) !== feederSet(['M99', 'M100'])) {
    errors.push('M102 must be W99 vs W100 (FIFA/ESPN)');
  }

  return errors;
}

function main() {
  const errors = validate();

  if (errors.length > 0) {
    console.error('Knockout bracket validation failed:\n');
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log('Knockout bracket validation passed.');
}

main();
