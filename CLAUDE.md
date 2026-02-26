# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Jerusalem Quest** - A gamified educational web app about Jerusalem for Israeli classrooms (ages 9-10). Students answer riddles, earn points and badges, and compete on a leaderboard. Full PRD is in `docs/prd.md`.

## Planned Tech Stack

- **Frontend:** React (client-side SPA, mobile-first)
- **Database:** PostgreSQL
- **Fallback:** LocalStorage for offline scenarios
- **Image Generation:** Ideogram API v3 (docs in `docs/ideogram.md`, API key via `Api-Key` header)

## Key Constraints

- **Language:** Full Hebrew with RTL support throughout
- **Audience:** 9-10 year old children - use simple vocabulary, large buttons, high contrast, minimal scrolling
- **Performance:** Must load under 2 seconds, handle 40 concurrent players
- **Safety:** No chat, no player-to-player interaction, profanity filter on names, teacher controls for reset/moderation
- **Scoring:** No negative scoring (wrong answer = 0 points). Correct = 10pts, optional speed bonus = +5pts
- **Leaderboard tiebreak:** Same score → shorter time wins

## Core Data Model

```json
{
  "id": "uuid",
  "name": "string (max 15 chars, duplicates get appended number)",
  "score": 60,
  "correctAnswers": 6,
  "timeSeconds": 85,
  "badges": ["Jerusalem Expert", "Fast Thinker"],
  "createdAt": "timestamp"
}
```

## Badge System

Badges are awarded independently of ranking:
- "Jerusalem Expert" - All answers correct
- "Fast Thinker" - Completed under defined time
- "History Star" - Correct answers on historical questions
- "Smart Explorer" - 5 correct answers
- "Participation Hero" - Finished the game

## Leaderboard Top 5 Styling

| Rank | Style |
|------|-------|
| 1 | Gold background |
| 2 | Silver background |
| 3 | Bronze background |
| 4 | Blue highlight |
| 5 | Green highlight |
| 6+ | Neutral background |

No flashing animations (avoid overstimulation for children).

## User Flow

1. **Start Screen** - Name input (validated: no empty, no special chars, profanity filter) + "Start Game" button
2. **Game Screen** - Riddle text + 3 answer buttons + progress bar + score counter + optional timer
3. **End Screen** - Total score, correct answers, earned badges, "View Leaderboard" button
4. **Leaderboard** - All players sorted by score, top 5 highlighted, badge icons shown

## Teacher Controls

- Reset leaderboard (daily reset option)
- Delete inappropriate names / remove players
- Export results
- Optional password-protected teacher mode
