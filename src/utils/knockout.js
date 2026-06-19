/**
 * Knockout stage bracket definition (M73–M104).
 *
 * Future extensions:
 * - Annex C 495-scenario matrix to assign specific 3rd-place teams to slots
 * - Knockout results data to replace Wxx placeholders with advancing winners
 */

export const KNOCKOUT_ROUND_LABELS = {
  r32: "Round of 32",
  r16: "Round of 16",
  finals: "Finals",
  qf: "Quarter-finals",
  sf: "Semi-finals",
  third: "Third-place play-off",
  final: "Final",
};

export const KNOCKOUT_ROUND_VIEWS = ["r32", "r16", "finals"];

function runnerUp(group) {
  return { type: "runnerUp", group };
}

function winner(group) {
  return { type: "winner", group };
}

function bestThird(groups) {
  return { type: "bestThird", groups };
}

function winnerOf(matchId) {
  return { type: "winnerOf", matchId };
}

function loserOf(matchId) {
  return { type: "loserOf", matchId };
}

/** All knockout matches keyed by id (M73–M104). */
export const KNOCKOUT_MATCHES = {
  M73: { id: "M73", round: "r32", teamA: runnerUp("A"), teamB: runnerUp("B") },
  M74: {
    id: "M74",
    round: "r32",
    teamA: winner("E"),
    teamB: bestThird(["A", "B", "C", "D", "F"]),
  },
  M75: { id: "M75", round: "r32", teamA: winner("F"), teamB: runnerUp("C") },
  M76: { id: "M76", round: "r32", teamA: winner("C"), teamB: runnerUp("F") },
  M77: {
    id: "M77",
    round: "r32",
    teamA: winner("I"),
    teamB: bestThird(["C", "D", "F", "G", "H"]),
  },
  M78: { id: "M78", round: "r32", teamA: runnerUp("E"), teamB: runnerUp("I") },
  M79: {
    id: "M79",
    round: "r32",
    teamA: winner("A"),
    teamB: bestThird(["C", "E", "F", "H", "I"]),
  },
  M80: {
    id: "M80",
    round: "r32",
    teamA: winner("L"),
    teamB: bestThird(["E", "H", "I", "J", "K"]),
  },
  M81: {
    id: "M81",
    round: "r32",
    teamA: winner("D"),
    teamB: bestThird(["B", "E", "F", "I", "J"]),
  },
  M82: {
    id: "M82",
    round: "r32",
    teamA: winner("G"),
    teamB: bestThird(["A", "E", "H", "I", "J"]),
  },
  M83: { id: "M83", round: "r32", teamA: runnerUp("K"), teamB: runnerUp("L") },
  M84: { id: "M84", round: "r32", teamA: winner("H"), teamB: runnerUp("J") },
  M85: {
    id: "M85",
    round: "r32",
    teamA: winner("B"),
    teamB: bestThird(["E", "F", "G", "I", "J"]),
  },
  M86: { id: "M86", round: "r32", teamA: winner("J"), teamB: runnerUp("H") },
  M87: {
    id: "M87",
    round: "r32",
    teamA: winner("K"),
    teamB: bestThird(["D", "E", "I", "J", "L"]),
  },
  M88: { id: "M88", round: "r32", teamA: runnerUp("D"), teamB: runnerUp("G") },
  M89: {
    id: "M89",
    round: "r16",
    teamA: winnerOf("M74"),
    teamB: winnerOf("M77"),
  },
  M90: {
    id: "M90",
    round: "r16",
    teamA: winnerOf("M73"),
    teamB: winnerOf("M75"),
  },
  M91: {
    id: "M91",
    round: "r16",
    teamA: winnerOf("M76"),
    teamB: winnerOf("M78"),
  },
  M92: {
    id: "M92",
    round: "r16",
    teamA: winnerOf("M79"),
    teamB: winnerOf("M80"),
  },
  M93: {
    id: "M93",
    round: "r16",
    teamA: winnerOf("M83"),
    teamB: winnerOf("M84"),
  },
  M94: {
    id: "M94",
    round: "r16",
    teamA: winnerOf("M81"),
    teamB: winnerOf("M82"),
  },
  M95: {
    id: "M95",
    round: "r16",
    teamA: winnerOf("M86"),
    teamB: winnerOf("M88"),
  },
  M96: {
    id: "M96",
    round: "r16",
    teamA: winnerOf("M85"),
    teamB: winnerOf("M87"),
  },
  M97: {
    id: "M97",
    round: "qf",
    teamA: winnerOf("M89"),
    teamB: winnerOf("M90"),
  },
  M98: {
    id: "M98",
    round: "qf",
    teamA: winnerOf("M93"),
    teamB: winnerOf("M94"),
  },
  M99: {
    id: "M99",
    round: "qf",
    teamA: winnerOf("M91"),
    teamB: winnerOf("M92"),
  },
  M100: {
    id: "M100",
    round: "qf",
    teamA: winnerOf("M95"),
    teamB: winnerOf("M96"),
  },
  M101: {
    id: "M101",
    round: "sf",
    teamA: winnerOf("M97"),
    teamB: winnerOf("M98"),
  },
  M102: {
    id: "M102",
    round: "sf",
    teamA: winnerOf("M99"),
    teamB: winnerOf("M100"),
  },
  M103: {
    id: "M103",
    round: "third",
    teamA: loserOf("M101"),
    teamB: loserOf("M102"),
  },
  M104: {
    id: "M104",
    round: "final",
    teamA: winnerOf("M101"),
    teamB: winnerOf("M102"),
  },
};

export const KNOCKOUT_MATCH_IDS = Object.keys(KNOCKOUT_MATCHES);

/** Official schedule dates (YYYY-MM-DD) for knockout matches M73–M104. */
export const KNOCKOUT_MATCH_DATES = {
  M73: "2026-06-28",
  M74: "2026-06-29",
  M75: "2026-06-29",
  M76: "2026-06-29",
  M77: "2026-06-30",
  M78: "2026-06-30",
  M79: "2026-06-30",
  M80: "2026-07-01",
  M81: "2026-07-01",
  M82: "2026-07-01",
  M83: "2026-07-02",
  M84: "2026-07-02",
  M85: "2026-07-02",
  M86: "2026-07-03",
  M87: "2026-07-03",
  M88: "2026-07-03",
  M89: "2026-07-04",
  M90: "2026-07-04",
  M91: "2026-07-05",
  M92: "2026-07-05",
  M93: "2026-07-06",
  M94: "2026-07-06",
  M95: "2026-07-07",
  M96: "2026-07-07",
  M97: "2026-07-09",
  M98: "2026-07-10",
  M99: "2026-07-11",
  M100: "2026-07-11",
  M101: "2026-07-14",
  M102: "2026-07-15",
  M103: "2026-07-18",
  M104: "2026-07-19",
};

const R32_MATCH_ORDER = [
  "M73",
  "M74",
  "M75",
  "M76",
  "M77",
  "M78",
  "M79",
  "M80",
  "M81",
  "M82",
  "M83",
  "M84",
  "M85",
  "M86",
  "M87",
  "M88",
];
const R16_MATCH_ORDER = [
  "M89",
  "M90",
  "M91",
  "M92",
  "M93",
  "M94",
  "M95",
  "M96",
];
const QF_MATCH_ORDER = ["M97", "M98", "M99", "M100"];
const SF_MATCH_ORDER = ["M101", "M102"];

/** Short slot tags shown beside match ids (e.g. M90 → R16-2, M97 → QF1). */
export const KNOCKOUT_MATCH_TAGS = Object.fromEntries([
  ...R32_MATCH_ORDER.map((id, i) => [id, `R32-${i + 1}`]),
  ...R16_MATCH_ORDER.map((id, i) => [id, `R16-${i + 1}`]),
  ...QF_MATCH_ORDER.map((id, i) => [id, `QF${i + 1}`]),
  ...SF_MATCH_ORDER.map((id, i) => [id, `SF${i + 1}`]),
  ["M103", "3rd"],
  ["M104", "Final"],
]);

export function getKnockoutMatchTag(matchId) {
  return KNOCKOUT_MATCH_TAGS[matchId] ?? null;
}

/** FIFA match id to display label (e.g. M73 → Match 73). */
export function formatKnockoutMatchNumber(matchId) {
  if (!matchId) {
    return null;
  }

  const number = matchId.replace(/^M/, "");
  if (!number) {
    return null;
  }

  return `Match ${number}`;
}

/**
 * Parse a knockout slot tag (e.g. R32-11) into round + readable label.
 * @returns {{ round: string | null, label: string } | null}
 */
export function parseKnockoutMatchTag(tag) {
  if (!tag) {
    return null;
  }

  if (tag === "Final") {
    return { round: null, label: "Final" };
  }

  if (tag === "3rd") {
    return { round: null, label: "3rd place" };
  }

  const dashMatch = tag.match(/^(R32|R16)-(\d+)$/);
  if (dashMatch) {
    return { round: dashMatch[1], label: `Match ${dashMatch[2]}` };
  }

  const compactMatch = tag.match(/^(QF|SF)(\d+)$/);
  if (compactMatch) {
    return { round: compactMatch[1], label: `Match ${compactMatch[2]}` };
  }

  return { round: null, label: tag };
}

/** Single-line display label (e.g. "R32 · Match 83"). */
export function formatKnockoutMatchTag(tag, matchId) {
  const parsed = parseKnockoutMatchTag(tag);
  const label = matchId ? formatKnockoutMatchNumber(matchId) : parsed?.label;

  if (!label) {
    return null;
  }

  if (parsed?.round) {
    return `${parsed.round} · ${label}`;
  }

  return label;
}

export function formatKnockoutMatchDate(dateKey) {
  if (!dateKey) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayPart = String(day).padStart(2, "0");
  const monthPart = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
  })
    .format(date)
    .toUpperCase();

  return `${dayPart} ${monthPart}`;
}

/**
 * Bracket tree for visual rendering.
 * Each leaf is an R32 match id; inner nodes are later-round match ids.
 */
export const BRACKET_TREE = {
  left: {
    quarter1: {
      r16: "M97",
      pair1: { r16: "M90", r32: ["M73", "M75"] },
      pair2: { r16: "M89", r32: ["M74", "M77"] },
    },
    quarter2: {
      r16: "M99",
      pair1: { r16: "M91", r32: ["M76", "M78"] },
      pair2: { r16: "M92", r32: ["M79", "M80"] },
    },
    sf: "M101",
  },
  right: {
    quarter1: {
      r16: "M98",
      pair1: { r16: "M93", r32: ["M83", "M84"] },
      pair2: { r16: "M94", r32: ["M81", "M82"] },
    },
    quarter2: {
      r16: "M100",
      pair1: { r16: "M95", r32: ["M86", "M88"] },
      pair2: { r16: "M96", r32: ["M85", "M87"] },
    },
    sf: "M102",
  },
  center: {
    final: "M104",
    third: "M103",
  },
};

function formatBestThirdLabel(groups) {
  return `Best 3rd (${groups.join(", ")})`;
}

function formatMatchRefLabel(matchId, prefix) {
  const num = matchId.replace("M", "");
  return `${prefix}${num}`;
}

export function formatWinnerLabel(group) {
  return `Winner ${group} (1${group})`;
}

export function formatRunnerUpLabel(group) {
  return `Runner-up ${group} (2${group})`;
}

export function formatThirdPlaceLabel(group) {
  return `3rd Group ${group}`;
}

function withSlotScore(resolved, score) {
  if (score == null || resolved.type !== "team" || !resolved.team) {
    return resolved;
  }

  return { ...resolved, score };
}

function getKnockoutResultSides(result) {
  if (result?.homeScore == null || result?.awayScore == null) {
    return null;
  }

  if (result.homeScore > result.awayScore) {
    return { winner: "A", loser: "B" };
  }

  if (result.awayScore > result.homeScore) {
    return { winner: "B", loser: "A" };
  }

  return null;
}

/**
 * Resolve a knockout slot to a team or placeholder.
 * @returns {{ type: 'team', team: object, score?: number } | { type: 'third', label: string } | { type: 'placeholder', label: string }}
 */
export function resolveKnockoutSlot(slot, standingsByGroup, options = {}) {
  const { revealTeams = false, knockoutResults = {} } = options;

  if (slot.type === "winner") {
    if (revealTeams) {
      const standing = standingsByGroup[slot.group]?.[0];
      if (standing?.team) {
        return { type: "team", team: standing.team, code: `1${slot.group}` };
      }
    }
    return { type: "placeholder", label: formatWinnerLabel(slot.group) };
  }

  if (slot.type === "runnerUp") {
    if (revealTeams) {
      const standing = standingsByGroup[slot.group]?.[1];
      if (standing?.team) {
        return { type: "team", team: standing.team, code: `2${slot.group}` };
      }
    }
    return { type: "placeholder", label: formatRunnerUpLabel(slot.group) };
  }

  if (slot.type === "bestThird") {
    return { type: "third", label: formatBestThirdLabel(slot.groups) };
  }

  if (slot.type === "winnerOf" || slot.type === "loserOf") {
    const feederMatch = resolveKnockoutMatch(
      slot.matchId,
      standingsByGroup,
      options,
    );
    const sides = getKnockoutResultSides(knockoutResults[slot.matchId]);
    const sideKey = slot.type === "winnerOf" ? sides?.winner : sides?.loser;

    if (feederMatch && sideKey) {
      const resolvedSlot =
        sideKey === "A" ? feederMatch.resolvedA : feederMatch.resolvedB;
      const score =
        sideKey === "A"
          ? knockoutResults[slot.matchId].homeScore
          : knockoutResults[slot.matchId].awayScore;

      if (resolvedSlot.type === "team" && resolvedSlot.team) {
        return withSlotScore(resolvedSlot, score);
      }
    }

    const prefix = slot.type === "winnerOf" ? "W" : "L";
    return {
      type: "placeholder",
      label: formatMatchRefLabel(slot.matchId, prefix),
    };
  }

  return { type: "placeholder", label: "TBD" };
}

export function resolveKnockoutMatch(matchId, standingsByGroup, options = {}) {
  const { knockoutResults = {} } = options;
  const match = KNOCKOUT_MATCHES[matchId];
  if (!match) return null;

  const result = knockoutResults[matchId];
  const resolvedA = resolveKnockoutSlot(match.teamA, standingsByGroup, options);
  const resolvedB = resolveKnockoutSlot(match.teamB, standingsByGroup, options);

  return {
    ...match,
    date: KNOCKOUT_MATCH_DATES[matchId] ?? null,
    resolvedA: withSlotScore(resolvedA, result?.homeScore),
    resolvedB: withSlotScore(resolvedB, result?.awayScore),
  };
}
