const slides = Array.from(document.querySelectorAll(".slide"));
const dotsContainer = document.querySelector("#dots");
const currentSlideEl = document.querySelector("#current-slide");
const totalSlidesEl = document.querySelector("#total-slides");
const progressBar = document.querySelector("#progress-bar");
const quizQuestion = document.querySelector("#quiz-question");
const quizFeedback = document.querySelector("#quiz-feedback");
const quizCurrentEl = document.querySelector("#quiz-current");
const quizTotalEl = document.querySelector("#quiz-total");
const quizScoreEl = document.querySelector("#quiz-score");
const quizScoreTotalEl = document.querySelector("#quiz-score-total");
const quizProgressBar = document.querySelector("#quiz-progress-bar");
const quizOptionButtons = Array.from(document.querySelectorAll(".quiz-options button"));
const nextQuestionButton = document.querySelector("[data-action='next-question']");
const missionPanel = document.querySelector("#mission-panel");
const missionTitle = document.querySelector("#mission-title");
const missionPrompt = document.querySelector("#mission-prompt");
const missionOptions = document.querySelector("#mission-options");
const missionFeedback = document.querySelector("#mission-feedback");
const missionStatus = document.querySelector("#mission-status");
const missionScoreEl = document.querySelector("#mission-score");
const missionTotalEl = document.querySelector("#mission-total");

let activeIndex = 0;
let quizIndex = 0;
let isUpdatingHash = false;
let quizAnswers = [];
let missionAnswers = [];

const quizQuestions = [
  {
    question: "הודעה אומרת: \"לחצו עכשיו או שהחשבון ייסגר\". מה זה מזכיר?",
    answers: ["פישינג", "גיבוי", "עדכון תוכנה"],
    correct: 0,
    feedback: "נכון: הודעה מלחיצה עם קישור היא סימן אזהרה."
  },
  {
    question: "חבר מבקש קוד ואומר: \"אל תגיד לאף אחד\". מה עושים?",
    answers: ["שולחים מהר", "בודקים בדרך אחרת", "מפרסמים בקבוצה"],
    correct: 1,
    feedback: "נכון: קוד לא משתפים. בודקים בשיחה או עם מבוגר."
  },
  {
    question: "אותה סיסמה משמשת למשחק, לאימייל ולבית הספר. למה זה מסוכן?",
    answers: ["אין סיכון", "פריצה במקום אחד עוזרת להיכנס לאחרים", "המחשב נהיה איטי"],
    correct: 1,
    feedback: "נכון: אם מקום אחד נפרץ, אותה סיסמה יכולה לפתוח גם מקומות אחרים."
  },
  {
    question: "קיבלתם קובץ שלא ביקשתם. מה עושים?",
    answers: ["פותחים כדי לראות", "עוצרים ובודקים מי שלח", "מעבירים לחברים"],
    correct: 1,
    feedback: "נכון: קובץ לא צפוי בודקים לפני שפותחים."
  },
  {
    question: "אפליקציה מבקשת מיקום ומצלמה בלי סיבה ברורה. מה עושים?",
    answers: ["מאשרים תמיד", "בודקים הרשאות ופרטיות", "מוחקים את כל התמונות"],
    correct: 1,
    feedback: "נכון: הרשאה צריכה להתאים למה שהאפליקציה באמת צריכה."
  }
];

const slideMissions = [
  {
    title: "עצירת פתיחה",
    prompt: "הודעה אומרת: \"זכיתם בפרס, לחצו עכשיו\". מה עושים קודם?",
    options: ["ללחוץ מהר לפני שייגמר", "לעצור ולבדוק מי שלח", "להעביר לכל הכיתה"],
    correct: 1,
    feedback: "נכון. עצירה קצרה לפני קליק יכולה להציל חשבון."
  },
  {
    title: "מה שומרים?",
    prompt: "מה מתוך הרשימה הוא מידע שצריך לשמור בזהירות?",
    options: ["שם משתמש וקוד כניסה", "צבע אהוב", "מזג האוויר היום"],
    correct: 0,
    feedback: "נכון. פרטי כניסה הם כמו מפתח לחשבון."
  },
  {
    title: "סימן אזהרה",
    prompt: "מה הכי נראה כמו פישינג?",
    options: ["הודעה דחופה עם קישור לא מוכר", "מורה שולחת קובץ במערכת בית הספר", "חבר שולח תמונה שביקשתם"],
    correct: 0,
    feedback: "נכון. לחץ וקישור לא מוכר הם סימן לעצור."
  },
  {
    title: "סיסמה טובה",
    prompt: "מה הכי טוב לחשבון חשוב?",
    options: ["123456", "אותה סיסמה בכל מקום", "משפט ארוך וייחודי"],
    correct: 2,
    feedback: "נכון. סיסמה ארוכה ושונה קשה יותר לניחוש."
  },
  {
    title: "קובץ חשוד",
    prompt: "קיבלתם קובץ שלא ציפיתם לו. מה עושים?",
    options: ["פותחים כדי לראות", "עוצרים ובודקים מקור", "שולחים לחבר שיבדוק"],
    correct: 1,
    feedback: "נכון. קודם בודקים, אחר כך פותחים."
  },
  {
    title: "פרטיות בתמונה",
    prompt: "לפני שמעלים תמונה, מה חשוב לבדוק?",
    options: ["אם רואים כתובת, שם בית ספר או אנשים אחרים", "רק אם התמונה מצחיקה", "אם יש מספיק לייקים"],
    correct: 0,
    feedback: "נכון. תמונה יכולה לגלות מידע בלי שהתכוונו."
  },
  {
    title: "בודקים התחזות",
    prompt: "חבר מבקש קוד ואומר \"אל תגיד לאף אחד\". מה אומרים?",
    options: ["בטח, שולח עכשיו", "אני בודק בדרך אחרת לפני שאני שולח", "תשלח לי קודם כסף"],
    correct: 1,
    feedback: "נכון. חבר אמיתי יבין שבודקים לפני ששולחים קוד."
  },
  {
    title: "עוד שכבת הגנה",
    prompt: "מה מוסיף שכבת הגנה טובה?",
    options: ["סיסמה + קוד נוסף", "לסמוך על מזל", "לכבות את כל ההגנות"],
    correct: 0,
    feedback: "נכון. כמה שכבות קטנות מגנות טוב יותר משכבה אחת."
  },
  {
    title: "למה מחכים?",
    prompt: "למה אתר לפעמים אומר לחכות אחרי הרבה ניסיונות?",
    options: ["כדי להאט ניחושים חוזרים", "כדי לגלות לכולם את הסיסמה", "כדי למחוק את החשבון מיד"],
    correct: 0,
    feedback: "נכון. לפעמים האטה היא הגנה חזקה."
  },
  {
    title: "הפעולה שלי",
    prompt: "איזו פעולה אפשר לעשות השבוע?",
    options: ["להפעיל קוד נוסף בחשבון חשוב", "לשתף סיסמה עם חבר", "לא לעדכן אף פעם"],
    correct: 0,
    feedback: "נכון. שינוי קטן אחד כבר משפר הגנה."
  },
  {
    title: "חידון עם ניקוד",
    prompt: "איך הכי טוב לשחק בחידון?",
    options: ["לנחש מהר בלי לחשוב", "להסביר אחרי כל תשובה מה סימן האזהרה", "לדלג על התשובות"],
    correct: 1,
    feedback: "נכון. ההסבר אחרי התשובה הוא החלק הכי חשוב."
  },
  {
    title: "סיכום מהיר",
    prompt: "מה חוזר בכל ההגנות שלמדנו?",
    options: ["עצירה, בדיקה, פעולה בטוחה", "לחיצה מהירה", "שיתוף קודים"],
    correct: 0,
    feedback: "נכון. זה המשפט של כל השיעור."
  },
  {
    title: "שאלה טובה",
    prompt: "אם כבר לחצנו על קישור חשוד, מה עושים?",
    options: ["להסתיר את זה", "לספר למבוגר אחראי ולבדוק יחד", "להמשיך ללחוץ כדי להבין"],
    correct: 1,
    feedback: "נכון. מספרים מהר ומתקנים בלי בושה."
  }
];

function clampIndex(index) {
  return Math.max(0, Math.min(index, slides.length - 1));
}

function setSlide(index) {
  activeIndex = clampIndex(index);
  const isOverview = document.body.classList.contains("overview");
  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", isActive || isOverview ? "false" : "true");
    slide.inert = !isActive && !isOverview;
  });

  currentSlideEl.textContent = String(activeIndex + 1);
  progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  Array.from(dotsContainer.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeIndex);
    dot.setAttribute("aria-current", dotIndex === activeIndex ? "step" : "false");
  });

  const title = slides[activeIndex].dataset.title || `שקופית ${activeIndex + 1}`;
  document.title = `${activeIndex + 1}/${slides.length} · ${title} · מתקפות סייבר`;
  const nextHash = `#slide-${activeIndex + 1}`;
  if (location.hash !== nextHash) {
    isUpdatingHash = true;
    location.hash = nextHash;
    window.setTimeout(() => {
      isUpdatingHash = false;
    }, 0);
  }
  updateMissionView();
}

function nextSlide() {
  if (document.body.classList.contains("overview")) return;
  setSlide(activeIndex + 1);
}

function prevSlide() {
  if (document.body.classList.contains("overview")) return;
  setSlide(activeIndex - 1);
}

function renderDots() {
  totalSlidesEl.textContent = String(slides.length);
  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `מעבר אל שקופית ${index + 1}: ${slide.dataset.title || ""}`);
    button.addEventListener("click", () => {
      document.body.classList.remove("overview");
      setSlide(index);
    });
    dotsContainer.appendChild(button);
  });
}

function toggleOverview() {
  document.body.classList.toggle("overview");
  if (document.body.classList.contains("overview")) {
    slides.forEach((slide) => {
      slide.inert = false;
      slide.setAttribute("aria-hidden", "false");
    });
  } else {
    setSlide(activeIndex);
  }
}

function toggleNotes() {
  document.body.classList.toggle("show-notes");
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
}

function setQuizQuestion(index) {
  const current = quizQuestions[index];
  const savedAnswer = quizAnswers[index];
  const answeredCount = quizAnswers.filter((answer) => answer !== null).length;
  const score = quizAnswers.filter((answer) => answer?.isCorrect).length;

  quizCurrentEl.textContent = String(index + 1);
  quizTotalEl.textContent = String(quizQuestions.length);
  quizScoreEl.textContent = String(score);
  quizScoreTotalEl.textContent = String(quizQuestions.length);
  quizProgressBar.style.width = `${((index + 1) / quizQuestions.length) * 100}%`;
  quizQuestion.textContent = current.question;
  quizFeedback.textContent =
    savedAnswer === null
      ? `בחרו תשובה. ניקוד נוכחי: ${score}/${quizQuestions.length}.`
      : buildQuizFeedback(savedAnswer.isCorrect, answeredCount === quizQuestions.length);
  quizOptionButtons.forEach((button, answerIndex) => {
    button.textContent = current.answers[answerIndex];
    button.dataset.answer = String(answerIndex === current.correct);
    button.classList.remove("is-correct", "is-wrong");
    if (savedAnswer !== null) {
      if (answerIndex === current.correct) button.classList.add("is-correct");
      if (!savedAnswer.isCorrect && answerIndex === savedAnswer.selectedIndex) button.classList.add("is-wrong");
    }
    button.disabled = savedAnswer !== null;
  });
  nextQuestionButton.textContent = index === quizQuestions.length - 1 ? "חזרה להתחלה" : "שאלה הבאה";
  nextQuestionButton.disabled = false;
}

function buildQuizFeedback(isCorrect, isComplete) {
  const score = quizAnswers.filter((answer) => answer?.isCorrect).length;
  const base = isCorrect ? quizQuestions[quizIndex].feedback : `כמעט. ${quizQuestions[quizIndex].feedback}`;
  if (!isComplete) return `${base} ניקוד: ${score}/${quizQuestions.length}.`;
  if (score === quizQuestions.length) return `${base} סיימתם עם ${score}/${quizQuestions.length}! כל הכבוד - זיהיתם את כל הסימנים.`;
  return `${base} סיימתם עם ${score}/${quizQuestions.length}. עכשיו אפשר לשחק שוב ולשפר.`;
}

function answerQuiz(button) {
  if (quizAnswers[quizIndex] !== null) return;
  const selectedIndex = quizOptionButtons.indexOf(button);
  const isCorrect = button.dataset.answer === "true";
  quizAnswers[quizIndex] = { isCorrect, selectedIndex };
  const isComplete = quizAnswers.every((answer) => answer !== null);
  quizOptionButtons.forEach((option) => {
    option.disabled = true;
    if (option.dataset.answer === "true") option.classList.add("is-correct");
  });
  if (!isCorrect) button.classList.add("is-wrong");
  setQuizQuestion(quizIndex);
  quizFeedback.textContent = buildQuizFeedback(isCorrect, isComplete);
}

function nextQuizQuestion() {
  quizIndex = (quizIndex + 1) % quizQuestions.length;
  setQuizQuestion(quizIndex);
}

function resetQuiz() {
  quizIndex = 0;
  quizAnswers = Array(quizQuestions.length).fill(null);
  setQuizQuestion(quizIndex);
}

function updateMissionScore() {
  const score = missionAnswers.filter((answer) => answer?.isCorrect).length;
  missionScoreEl.textContent = String(score);
  missionTotalEl.textContent = String(slideMissions.length);
}

function updateMissionView() {
  updateMissionScore();
  if (missionPanel.hidden) return;

  const mission = slideMissions[activeIndex];
  const savedAnswer = missionAnswers[activeIndex];
  missionTitle.textContent = mission.title;
  missionPrompt.textContent = mission.prompt;
  missionOptions.innerHTML = "";
  mission.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.dataset.missionOption = String(optionIndex);
    if (savedAnswer) {
      if (optionIndex === mission.correct) button.classList.add("is-correct");
      if (!savedAnswer.isCorrect && optionIndex === savedAnswer.selectedIndex) button.classList.add("is-wrong");
    }
    button.disabled = savedAnswer?.isCorrect === true;
    missionOptions.appendChild(button);
  });
  if (!savedAnswer) {
    missionFeedback.textContent = "בחרו תשובה כדי להשלים את משימת השקופית.";
    missionStatus.textContent = "לא הושלמה";
  } else if (savedAnswer.isCorrect) {
    missionFeedback.textContent = mission.feedback;
    missionStatus.textContent = "הושלמה";
  } else {
    missionFeedback.textContent = "כמעט. נסו שוב וחפשו את הפעולה הכי בטוחה.";
    missionStatus.textContent = "נסו שוב";
  }
}

function openMission() {
  missionPanel.hidden = false;
  missionPanel.setAttribute("aria-hidden", "false");
  updateMissionView();
  missionPanel.querySelector(".mission-close").focus();
}

function closeMission() {
  missionPanel.hidden = true;
  missionPanel.setAttribute("aria-hidden", "true");
}

function answerMission(button) {
  const selectedIndex = Number(button.dataset.missionOption);
  const mission = slideMissions[activeIndex];
  missionAnswers[activeIndex] = {
    selectedIndex,
    isCorrect: selectedIndex === mission.correct
  };
  updateMissionView();
}

function resetMissions() {
  missionAnswers = Array(slideMissions.length).fill(null);
  updateMissionView();
}

document.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const action = actionTarget.dataset.action;
  if (action === "next") nextSlide();
  if (action === "prev") prevSlide();
  if (action === "notes") toggleNotes();
  if (action === "overview") toggleOverview();
  if (action === "fullscreen") toggleFullscreen();
  if (action === "print") window.print();
  if (action === "mission") openMission();
  if (action === "close-mission") closeMission();
  if (action === "reset-missions") resetMissions();
  if (action === "next-question") nextQuizQuestion();
  if (action === "reset-quiz") resetQuiz();
});

missionOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mission-option]");
  if (button) answerMission(button);
});

slides.forEach((slide, index) => {
  slide.addEventListener("click", () => {
    if (document.body.classList.contains("overview")) {
      document.body.classList.remove("overview");
      setSlide(index);
    }
  });
});

quizOptionButtons.forEach((button) => {
  button.addEventListener("click", () => answerQuiz(button));
});

function isInteractiveTarget(target) {
  return Boolean(target.closest("button, a, input, textarea, select, summary, [contenteditable='true']"));
}

function slideIndexFromHash() {
  const hashMatch = location.hash.match(/slide-(\d+)/);
  return hashMatch ? Number(hashMatch[1]) - 1 : 0;
}

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === " " && isInteractiveTarget(event.target)) return;
  if (key === "ArrowLeft" || key === " " || key === "PageDown") {
    event.preventDefault();
    nextSlide();
  }
  if (key === "ArrowRight" || key === "PageUp") {
    event.preventDefault();
    prevSlide();
  }
  if (key === "Home") setSlide(0);
  if (key === "End") setSlide(slides.length - 1);
  if (key.toLowerCase() === "n") toggleNotes();
  if (key.toLowerCase() === "o") toggleOverview();
  if (key.toLowerCase() === "f") toggleFullscreen();
  if (key.toLowerCase() === "m") openMission();
  if (key === "Escape") {
    closeMission();
    document.body.classList.remove("overview");
  }
});

window.addEventListener("hashchange", () => {
  if (!isUpdatingHash) {
    document.body.classList.remove("overview");
    setSlide(slideIndexFromHash());
  }
});

renderDots();
resetQuiz();
resetMissions();
setSlide(slideIndexFromHash());
