import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "startScreen",
    "quizHeader",
    "card",
    "question",
    "answers",
    "progress",
    "feedback",
    "nextButton",
    "score",
    "timer",
    "familyLabel"
  ]

  static values = {
    questionsByFamily: Object,
    durationSeconds: Number,
    finishUrl: String
  }

  connect() {
    this.currentIndex = 0
    this.correctCount = 0
    this.completedCount = 0
    this.score = 0
    this.answered = false
    this.selectedQuestions = []
    this.activeFamily = null
    this.remainingSeconds = this.durationSecondsValue || 300
    this.timerInterval = null
    this.quizFinished = false

    this.startScreenTarget.hidden = false
    this.quizHeaderTarget.hidden = true
    this.cardTarget.hidden = true
    this.nextButtonTarget.hidden = true
    this.nextButtonTarget.disabled = true

    this.dispatchControlsChanged()
  }

  disconnect() {
    this.clearTimer()
  }

  chooseFamily(event) {
    const family = event.currentTarget.dataset.family
    const pool = this.questionsByFamilyValue[family] || []

    if (pool.length === 0) return

    this.activeFamily = family
    this.selectedQuestions = this.shuffle(pool)

    this.startQuiz()
  }

  startQuiz() {
    this.currentIndex = 0
    this.correctCount = 0
    this.completedCount = 0
    this.score = 0
    this.answered = false
    this.quizFinished = false
    this.remainingSeconds = this.durationSecondsValue || 300

    this.startScreenTarget.hidden = true
    this.quizHeaderTarget.hidden = false
    this.cardTarget.hidden = false
    this.nextButtonTarget.hidden = true
    this.nextButtonTarget.disabled = true

    if (this.hasFamilyLabelTarget) {
      this.familyLabelTarget.textContent = this.activeFamily
    }

    this.updateTimer()
    this.startTimer()
    this.showQuestion()
    this.dispatchControlsChanged()
  }

  startTimer() {
    this.clearTimer()

    this.timerInterval = setInterval(() => {
      this.remainingSeconds -= 1
      this.updateTimer()

      if (this.remainingSeconds <= 0) {
        this.clearTimer()
        this.showResult()
      }
    }, 1000)
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  updateTimer() {
    if (!this.hasTimerTarget) return

    const safeSeconds = Math.max(0, this.remainingSeconds)
    const minutes = Math.floor(safeSeconds / 60)
    const seconds = safeSeconds % 60

    this.timerTarget.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  showQuestion() {
    if (this.quizFinished) return

    if (this.remainingSeconds <= 0) {
      this.showResult()
      return
    }

    if (this.currentIndex >= this.selectedQuestions.length) {
      const pool = this.questionsByFamilyValue[this.activeFamily] || []
      this.selectedQuestions = this.shuffle(pool)
      this.currentIndex = 0
    }

    const currentQuestion = this.selectedQuestions[this.currentIndex]

    if (!currentQuestion) {
      this.showResult()
      return
    }

    this.answered = false

    this.cardTarget.classList.remove("quiz-card-correct", "quiz-card-wrong")
    this.questionTarget.textContent = currentQuestion.question
    this.feedbackTarget.textContent = ""
    this.scoreTarget.textContent = ""
    this.feedbackTarget.classList.remove("is-correct", "is-wrong")

    this.updateProgress()

    this.answersTarget.innerHTML = ""

    this.shuffle(currentQuestion.answers).forEach((answer) => {
      const button = document.createElement("button")

      button.type = "button"
      button.classList.add("quiz-answer")
      button.textContent = answer
      button.dataset.answer = answer
      button.dataset.action = "click->code-quiz#selectAnswer"

      this.answersTarget.appendChild(button)
    })

    this.nextButtonTarget.textContent = "Question suivante"
    this.nextButtonTarget.hidden = true
    this.nextButtonTarget.disabled = true

    this.dispatchControlsChanged()
  }

  selectAnswer(event) {
    if (this.answered || this.quizFinished) return

    if (this.remainingSeconds <= 0) {
      this.showResult()
      return
    }

    this.answered = true
    this.completedCount += 1

    const selectedButton = event.currentTarget
    const selectedAnswer = selectedButton.dataset.answer
    const currentQuestion = this.selectedQuestions[this.currentIndex]
    const correctAnswer = currentQuestion.correct_answer

    const answerButtons = this.answersTarget.querySelectorAll(".quiz-answer")

    answerButtons.forEach((button) => {
      button.disabled = true

      if (button.dataset.answer === correctAnswer) {
        button.classList.add("quiz-answer-correct")
      }
    })

    if (selectedAnswer === correctAnswer) {
      const points = this.pointsFor(currentQuestion.difficulty)

      this.correctCount += 1
      this.score += points

      this.cardTarget.classList.add("quiz-card-correct")
      selectedButton.classList.add("quiz-answer-correct")
      this.feedbackTarget.textContent = `Bonne réponse. +${points} pts`
      this.feedbackTarget.classList.add("is-correct")
    } else {
      this.cardTarget.classList.add("quiz-card-wrong")
      selectedButton.classList.add("quiz-answer-wrong")
      this.feedbackTarget.textContent = `Mauvaise réponse. La bonne réponse était : ${correctAnswer}`
      this.feedbackTarget.classList.add("is-wrong")
    }

    this.updateProgress()

    this.nextButtonTarget.textContent = "Question suivante"
    this.nextButtonTarget.hidden = false
    this.nextButtonTarget.disabled = false

    this.dispatchControlsChanged()
  }

  nextQuestion() {
    if (!this.answered || this.quizFinished) return

    if (this.remainingSeconds <= 0) {
      this.showResult()
      return
    }

    this.currentIndex += 1
    this.showQuestion()
  }

  showResult() {
    if (this.quizFinished) return

    this.quizFinished = true
    this.clearTimer()
    this.updateTimer()

    this.cardTarget.hidden = false
    this.cardTarget.classList.remove("quiz-card-correct", "quiz-card-wrong")

    this.questionTarget.textContent = "Temps écoulé"
    this.answersTarget.innerHTML = ""
    this.feedbackTarget.textContent = ""

    this.progressTarget.textContent = `${this.score} pts`

    if (this.completedCount === 0) {
      this.scoreTarget.textContent = "Tu n’as pas encore répondu à une question."
    } else {
      this.scoreTarget.textContent = `${this.score} points · ${this.correctCount} bonne(s) sur ${this.completedCount}.`
    }

    this.nextButtonTarget.hidden = true
    this.nextButtonTarget.disabled = true

    this.element.dispatchEvent(
      new CustomEvent("activity:finished", {
        bubbles: true
      })
    )
  }

  finishActivity() {
    if (!this.hasFinishUrlValue) return

    this.nextButtonTarget.disabled = true
    this.nextButtonTarget.textContent = "Validation..."

    const form = document.createElement("form")
    form.method = "post"
    form.action = this.finishUrlValue
    form.style.display = "none"

    const methodInput = document.createElement("input")
    methodInput.type = "hidden"
    methodInput.name = "_method"
    methodInput.value = "patch"

    const csrfInput = document.createElement("input")
    csrfInput.type = "hidden"
    csrfInput.name = "authenticity_token"
    csrfInput.value = this.csrfToken()

    form.appendChild(methodInput)
    form.appendChild(csrfInput)

    document.body.appendChild(form)
    form.submit()
  }

  pointsFor(difficulty) {
    return {
      easy: 1,
      medium: 2,
      hard: 3
    }[difficulty] || 1
  }

  updateProgress() {
    if (!this.hasProgressTarget) return

    this.progressTarget.textContent = `${this.score} pts · ${this.correctCount}/${this.completedCount}`
  }

  dispatchControlsChanged() {
    this.element.dispatchEvent(
      new CustomEvent("activity:controls-changed", {
        bubbles: true
      })
    )
  }

  shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5)
  }

  csrfToken() {
    const token = document.querySelector("meta[name='csrf-token']")
    return token ? token.content : ""
  }
}
