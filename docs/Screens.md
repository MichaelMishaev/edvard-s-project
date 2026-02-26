# Jerusalem Quest - Screens

**Total: 5 screens, 4 routes**
**MVP: No teacher mode**

---

## Screen 1: Welcome (`/`)

- Game title + Jerusalem-themed background
- One-line instruction in Hebrew
- Name input field (max 15 characters)
- Big "Start Game" button
- Small link to leaderboard at bottom

### Validations

- No empty name
- No special characters
- Basic Hebrew profanity filter
- Duplicate names get auto-number (e.g. "Noa" already exists → "Noa2")

---

## Screen 2: Countdown (`/game` - initial state)

- Full-screen animated countdown: "3... 2... 1... !יאללה"
- Player name displayed
- ~3 seconds duration, auto-advances to first riddle
- **Name is locked from this point** - no going back to edit

---

## Screen 3: Game (`/game` - playing state)

### Layout

- **Top bar:** Score counter (corner) + progress bar (e.g. "3/6")
- **Center:** Riddle text (max 2 lines)
- **Below:** 3 large rounded answer buttons
- **Timer:** Counts up in background (used for tiebreaking, not prominently displayed)

### Scoring

- Correct answer = 10 points
- Speed bonus = +5 points
- Wrong answer = 0 points (no negative scoring)

### Inline Feedback (after each answer)

- Correct → green highlight on button + short explanation text (~2s)
- Wrong → red highlight on button + hint text (~2s)
- Auto-advance to next question after feedback

---

## Screen 4: Results (`/results`)

- Total score (big animated number)
- Correct answers count (e.g. "5/6")
- Earned badges with icons + tooltip descriptions
- Positive encouraging message (always shown, regardless of score)
- Two buttons: **"View Leaderboard"** + **"Play Again"**

---

## Screen 5: Leaderboard (`/leaderboard`)

- Standalone public route (teacher can project on classroom screen)
- Auto-refreshes via polling
- Centered table

### Columns

1. Rank #
2. Player Name
3. Score
4. Badge icons (small, with tooltips)

### Top 5 Highlighting

| Rank | Style |
|------|-------|
| 1 | Gold background |
| 2 | Silver background |
| 3 | Bronze background |
| 4 | Blue highlight |
| 5 | Green highlight |
| 6+ | Neutral background |

- No flashing animations (avoid overstimulation)
