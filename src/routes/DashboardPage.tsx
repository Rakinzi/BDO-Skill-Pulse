import { useState, useEffect } from 'react'
import { useAuth } from '../lib/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Button from '../lib/components/Button'

function CountdownTimer({ targetTime, onComplete }: { targetTime: number, onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = targetTime - Date.now()
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(timer)
        onComplete()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetTime, onComplete])

  const minutes = Math.floor(timeLeft / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  if (timeLeft <= 0) return null

  return (
    <div className="text-center">
      <div className="text-sm font-medium text-orange-600">
        Retake available in:
      </div>
      <div className="text-lg font-bold text-orange-700">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  )
}

interface Session {
  id: string
  name: string
  date: string
  time: string
  isActive: boolean
  questions: any[]
  _count: { responses: number }
  userHasCompleted?: boolean
  userLowestScore?: number
  userCanRetake?: boolean
  retakeCooldownUntil?: number
  retakeAttempts?: number
}

function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sessions')
      if (response.ok) {
        const data = await response.json()

        // Check completion status, scores, and retake eligibility for each session
        if (user) {
          const sessionsWithStatus = await Promise.all(
            data.map(async (session: Session) => {
              try {
                // Get user's submissions for this session
                const submissionsResponse = await fetch(`http://localhost:3001/api/user/${user.email}/submissions`)
                const retakeResponse = await fetch(`http://localhost:3001/api/user/${user.email}/session/${session.id}/retake-status`)

                if (submissionsResponse.ok) {
                  const submissions = await submissionsResponse.json()
                  const sessionSubmissions = submissions.filter((sub: any) => sub.sessionId === session.id)

                  if (sessionSubmissions.length > 0) {
                    // Find the lowest score for retake eligibility (score < 45)
                    const lowestScore = Math.min(...sessionSubmissions.map((sub: any) => sub.score))

                    // Get retake status
                    let retakeStatus = { canRetake: false, cooldownUntil: null, attempts: 0 }
                    if (retakeResponse.ok) {
                      retakeStatus = await retakeResponse.json()
                    }

                    const now = Date.now()
                    const cooldownEnd = retakeStatus.cooldownUntil ? new Date(retakeStatus.cooldownUntil).getTime() : 0
                    const isOnCooldown = cooldownEnd > now

                    return {
                      ...session,
                      userHasCompleted: true,
                      userLowestScore: lowestScore,
                      userCanRetake: retakeStatus.canRetake && !isOnCooldown,
                      retakeCooldownUntil: isOnCooldown ? cooldownEnd : null,
                      retakeAttempts: retakeStatus.attempts
                    }
                  }
                }
              } catch (err) {
                console.error('Error checking submission status:', err)
              }
              return { ...session, userHasCompleted: false }
            })
          )
          setSessions(sessionsWithStatus)
        } else {
          setSessions(data)
        }
      } else {
        setError('Failed to load quiz sessions')
      }
    } catch (err) {
      setError('Failed to load quiz sessions')
      console.error('Error fetching sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading quiz sessions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchSessions}>Try Again</Button>
      </div>
    )
  }

  const handleRetakeQuiz = async (sessionId: string) => {
    if (!user) return

    try {
      // Get the user's lowest score for this session
      const submissionsResponse = await fetch(`http://localhost:3001/api/user/${user.email}/submissions`)
      if (submissionsResponse.ok) {
        const submissions = await submissionsResponse.json()
        const sessionSubmissions = submissions.filter((sub: any) => sub.sessionId === sessionId)
        const lowestScore = Math.min(...sessionSubmissions.map((sub: any) => sub.score))

        // Start the retake cooldown
        const response = await fetch(`http://localhost:3001/api/user/${user.email}/session/${sessionId}/start-retake`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ score: lowestScore })
        })

        if (response.ok) {
          // Navigate to quiz with retake flag
          navigate(`/quiz/${sessionId}?retake=true`)
        } else {
          alert('Failed to start retake')
        }
      }
    } catch (error) {
      console.error('Error starting retake:', error)
      alert('Error starting retake')
    }
  }

  const activeSessions = sessions.filter(session => session.isActive)
  const inactiveSessions = sessions.filter(session => !session.isActive)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BDO Skills Pulse - Quiz Sessions</h1>
        <p className="text-gray-600">Available competency validation sessions for professional development</p>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Sessions</h2>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className={`bg-white rounded-lg shadow-md p-6 border ${session.userHasCompleted ? 'border-gray-200 opacity-75' : 'border-green-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${session.userHasCompleted ? 'text-gray-500' : 'text-gray-900'}`}>{session.name}</h3>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                    {session.userHasCompleted && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
                <div className={`space-y-1 mb-4 ${session.userHasCompleted ? 'text-gray-500' : 'text-gray-600'}`}>
                  <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {session.time}</p>
                  <p><strong>Questions:</strong> {session.questions.length}</p>
                  <p><strong>Participants:</strong> {session._count.responses}</p>
                </div>
                <div className="flex gap-4">
                  {session.userHasCompleted ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/admin/results?session=${session.id}`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View Results
                      </Button>
                      {session.userLowestScore && session.userLowestScore < 45 && (
                        session.retakeCooldownUntil ? (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <CountdownTimer
                              targetTime={session.retakeCooldownUntil}
                              onComplete={() => fetchSessions()}
                            />
                          </div>
                        ) : session.retakeAttempts === 0 ? (
                          <Button
                            onClick={() => handleRetakeQuiz(session.id)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Retake Quiz
                          </Button>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Retake completed
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => navigate(`/quiz/${session.id}`)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Start Quiz
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => navigate('/history')}
                  >
                    View My History
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Sessions */}
      {inactiveSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            {inactiveSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{session.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                </div>
                <div className="text-gray-600 space-y-1 mb-4">
                  <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {session.time}</p>
                  <p><strong>Questions:</strong> {session.questions.length}</p>
                </div>
                <div className="text-gray-500 text-sm">
                  This session is not yet active. Check back later or contact your administrator.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Sessions */}
      {sessions.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz Sessions</h3>
          <p className="text-gray-600">There are currently no quiz sessions available. Check back later or contact your administrator.</p>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
