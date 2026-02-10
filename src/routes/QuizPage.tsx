import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/contexts/AuthContext'
import QuizTimer from '../lib/components/QuizTimer'
import Button from '../lib/components/Button'

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  type: string
}

interface QuizSession {
  id: string
  name: string
  questions: Question[]
  time?: number
}

function QuizPage() {
  const { sessionId } = useParams()
  const [searchParams] = useSearchParams()
  const isRetake = searchParams.get('retake') === 'true'
  const navigate = useNavigate()
  const { user } = useAuth()

  const [session, setSession] = useState<QuizSession | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [savedProgress, setSavedProgress] = useState<any>(null)

  // Timer state
  const [quizStartTime] = useState(Date.now())
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes

  useEffect(() => {
    if (sessionId && user) {
      loadQuiz()
      loadSavedProgress()
    }
  }, [sessionId, user])

  const loadQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/sessions/${sessionId}`)
      if (response.ok) {
        const sessionData = await response.json()
        setSession(sessionData)
      } else {
        alert('Failed to load quiz')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Failed to load quiz:', error)
      alert('Failed to load quiz')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadSavedProgress = async () => {
    if (!user || !sessionId) return

    try {
      const response = await fetch(`http://localhost:3001/api/quiz-progress/${user.email}/${sessionId}`)
      if (response.ok) {
        const progress = await response.json()
        if (progress) {
          setSavedProgress(progress)
          setAnswers(progress.answers || {})
          setTimeRemaining(progress.timeRemaining || 300)
        }
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error)
    }
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleAutoSave = async (currentAnswers: any, remainingTime: number) => {
    if (!user || !sessionId) return

    try {
      await fetch('http://localhost:3001/api/quiz-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          sessionId: sessionId,
          answers: currentAnswers,
          timeRemaining: remainingTime
        })
      })
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  const handleTimeUp = async () => {
    await submitQuiz(true)
  }

  const calculateScore = () => {
    if (!session) return 0

    let correct = 0
    session.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++
      }
    })

    return Math.round((correct / session.questions.length) * 100)
  }

  const submitQuiz = async (timeUp = false) => {
    if (!session || !user) return

    setSubmitting(true)

    const score = calculateScore()
    const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000)

    try {
      const response = await fetch('http://localhost:3001/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          sessionId: sessionId,
          answers: answers,
          score: score,
          timeSpent: totalTimeSpent,
          completedAt: new Date().toISOString(),
          timeUp: timeUp
        })
      })

      if (response.ok) {
        // Mark retake as completed if this was a retake
        if (isRetake) {
          await fetch(`http://localhost:3001/api/user/${user.email}/session/${sessionId}/complete-retake`, {
            method: 'POST'
          })
        }

        // Navigate to results
        navigate(`/results/${sessionId}`)
      } else {
        alert('Failed to submit quiz')
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      alert('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const goToNext = () => {
    if (currentQuestionIndex < (session?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const canSubmit = () => {
    return session && Object.keys(answers).length === session.questions.length
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Quiz not found</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const currentQuestion = session.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Timer */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
            <p className="text-gray-600">
              Question {currentQuestionIndex + 1} of {session.questions.length}
            </p>
          </div>

          <QuizTimer
            duration={timeRemaining}
            onTimeUp={handleTimeUp}
            onAutoSave={handleAutoSave}
            sessionId={sessionId}
            userEmail={user?.email}
          />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.text}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                answers[currentQuestion.id] === index
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={index}
                checked={answers[currentQuestion.id] === index}
                onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="ml-3 text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={goToPrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {/* Question Navigation Dots */}
          {session.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestionIndex
                  ? 'bg-red-500'
                  : answers[session.questions[index].id] !== undefined
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
              title={`Question ${index + 1}`}
            />
          ))}
        </div>

        {currentQuestionIndex === session.questions.length - 1 ? (
          <Button
            onClick={() => submitQuiz()}
            disabled={!canSubmit() || submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        ) : (
          <Button onClick={goToNext}>
            Next
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Quiz Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You have 5 minutes to complete the quiz</li>
          <li>• Your progress is automatically saved every 30 seconds</li>
          <li>• Answer all questions to submit</li>
          <li>• You can navigate between questions using the dots or buttons</li>
          {isRetake && <li>• This is a retake attempt</li>}
        </ul>
      </div>
    </div>
  )
}

export default QuizPage
