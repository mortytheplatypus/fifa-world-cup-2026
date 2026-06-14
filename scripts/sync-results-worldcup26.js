const fs = require('fs');
const path = require('path');
const { syncResultsFromWorldCup26 } = require('../api/lib/worldcup26/sync');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
  };
}

async function main() {
  loadEnv();

  const { dryRun } = parseArgs(process.argv.slice(2));

  const outcome = await syncResultsFromWorldCup26({ dryRun });

  if (dryRun) {
    console.log('Dry run — no files or database updated.');
    console.log(JSON.stringify(outcome, null, 2));
    return;
  }

  console.log(`Synced ${outcome.synced} result(s) to MongoDB and results.json`);
  console.log(`Last updated: ${outcome.lastUpdated}`);
  console.log(`Fixtures: ${outcome.fixtureIds?.join(', ') || 'none'}`);
  console.log(
    `Skipped — unfinished: ${outcome.skipped.unfinished}, too early: ${outcome.skipped.too_early}, unmapped: ${outcome.skipped.unmapped}, not group: ${outcome.skipped.not_group}`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
