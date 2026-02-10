import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/contexts/AuthContext'
import { BarChart3, Users, Trophy, Clock, TrendingUp, PieChart, BarChart, LineChart } from 'lucide-react'
import FeedbackModal from '../lib/components/FeedbackModal'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface QuizResponse {
  id: string
  score: number
  timeSpent: number
  completedAt: string
  user: {
    email: string
    department: string
  }
}

interface QuizSession {
  id: string
  name: string
  date: string
  questions: any[]
  responses: QuizResponse[]
}

interface DepartmentStats {
  department: string
  participants: number
  averageScore: number
  scores: number[]
  gradeDistribution: {
    distinction: number
    merit: number
    pass: number
    warning: number
    fail: number
  }
}

function ResultsPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const sessionId = searchParams.get('session')
  const [session, setSession] = useState<QuizSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'overview' | 'department' | 'grade'>('overview')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])

  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  useEffect(() => {
    if (sessionId) {
      fetchSessionResults(sessionId)
    } else {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (session?.responses) {
      calculateDepartmentStats()

      // Check if current user just completed this quiz and show feedback modal
      if (user) {
        const userResponse = session.responses.find(r => r.user.email === user.email)
        if (userResponse && !feedbackSubmitted) {
          // Check if feedback was already submitted
          checkFeedbackStatus()
        }
      }
    }
  }, [session, user])

  const checkFeedbackStatus = async () => {
    if (!user || !sessionId) return

    try {
      const response = await fetch(`http://localhost:3001/api/feedback/check/${user.email}/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (!data.hasFeedback) {
          // Show feedback modal after a short delay
          setTimeout(() => {
            setShowFeedbackModal(true)
          }, 2000)
        } else {
          setFeedbackSubmitted(true)
        }
      }
    } catch (error) {
      console.error('Failed to check feedback status:', error)
    }
  }

  const handleFeedbackSubmit = async (rating: number, comments: string) => {
    if (!user || !session) return

    setSubmittingFeedback(true)

    try {
      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          sessionId: session.id,
          rating: rating,
          comments: comments
        })
      })

      if (response.ok) {
        setFeedbackSubmitted(true)
        setShowFeedbackModal(false)
      } else {
        alert('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      alert('Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const fetchSessionResults = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/sessions/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error('Failed to fetch session results:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDepartmentStats = () => {
    if (!session?.responses) return

    const departments = [...new Set(session.responses.map(r => r.user.department))]
    const stats: DepartmentStats[] = departments.map(dept => {
      const deptResponses = session.responses.filter(r => r.user.department === dept)
      const scores = deptResponses.map(r => r.score)
      const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)

      const gradeDistribution = {
        distinction: scores.filter(s => s >= 70).length,
        merit: scores.filter(s => s >= 60 && s < 70).length,
        pass: scores.filter(s => s >= 45 && s < 60).length,
        warning: scores.filter(s => s >= 30 && s < 45).length,
        fail: scores.filter(s => s < 30).length
      }

      return {
        department: dept,
        participants: deptResponses.length,
        averageScore,
        scores,
        gradeDistribution
      }
    })

    setDepartmentStats(stats)
  }

  const getGradeFromScore = (score: number): string => {
    if (score >= 70) return 'Distinction'
    if (score >= 60) return 'Merit'
    if (score >= 45) return 'Pass'
    if (score >= 30) return 'Warning'
    return 'Fail'
  }

  const getFilteredResponses = () => {
    if (!session?.responses) return []

    let filtered = session.responses

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(r => r.user.department === selectedDepartment)
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(r => getGradeFromScore(r.score) === selectedGrade)
    }

    return filtered.sort((a, b) => b.score - a.score)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bdo-red"></div>
      </div>
    )
  }

  if (!sessionId || !session) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
        <p className="text-gray-600">Please select a session to view results.</p>
      </div>
    )
  }

  const totalQuestions = session.questions?.length || 0
  const totalResponses = session.responses?.length || 0
  const averageScore = totalResponses > 0
    ? Math.round(session.responses.reduce((sum, r) => sum + r.score, 0) / totalResponses)
    : 0
  const averageTime = totalResponses > 0
    ? Math.round(session.responses.reduce((sum, r) => sum + r.timeSpent, 0) / totalResponses)
    : 0

  // Chart data preparation
  const getChartData = () => {
    const filteredResponses = getFilteredResponses()

    switch (viewMode) {
      case 'department':
        return {
          labels: departmentStats.map(stat => stat.department),
          datasets: [{
            label: 'Average Score by Department',
            data: departmentStats.map(stat => stat.averageScore),
            backgroundColor: 'rgba(220, 38, 38, 0.6)',
            borderColor: 'rgba(220, 38, 38, 1)',
            borderWidth: 1,
          }]
        }

      case 'grade':
        const currentDept = departmentStats.find(stat => stat.department === selectedDepartment)
        if (!currentDept) return { labels: [], datasets: [] }

        return {
          labels: ['Distinction', 'Merit', 'Pass', 'Warning', 'Fail'],
          datasets: [{
            label: 'Grade Distribution',
            data: [
              currentDept.gradeDistribution.distinction,
              currentDept.gradeDistribution.merit,
              currentDept.gradeDistribution.pass,
              currentDept.gradeDistribution.warning,
              currentDept.gradeDistribution.fail
            ],
            backgroundColor: [
              'rgba(34, 197, 94, 0.6)',
              'rgba(59, 130, 246, 0.6)',
              'rgba(245, 158, 11, 0.6)',
              'rgba(251, 146, 60, 0.6)',
              'rgba(239, 68, 68, 0.6)'
            ],
            borderColor: [
              'rgba(34, 197, 94, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(251, 146, 60, 1)',
              'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 1,
          }]
        }

      default: // overview
        return {
          labels: filteredResponses.map((_, index) => `Rank ${index + 1}`),
          datasets: [{
            label: 'Individual Scores',
            data: filteredResponses.map(r => r.score),
            backgroundColor: 'rgba(220, 38, 38, 0.6)',
            borderColor: 'rgba(220, 38, 38, 1)',
            borderWidth: 1,
          }]
        }
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: viewMode === 'department' ? 'Performance by Department' :
              viewMode === 'grade' ? 'Grade Distribution' : 'Individual Performance'
      },
    },
    scales: viewMode !== 'grade' ? {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)'
        }
      }
    } : undefined
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bdo-navy">Quiz Results</h1>
          <h2 className="text-xl text-gray-600">{session.name}</h2>
          <p className="text-gray-500">
            {new Date(session.date).toLocaleDateString()} • {totalQuestions} questions
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-bdo-blue mr-3" />
            <div>
              <p className="text-2xl font-bold text-bdo-navy">{totalResponses}</p>
              <p className="text-gray-600">Total Participants</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-bdo-red mr-3" />
            <div>
              <p className="text-2xl font-bold text-bdo-navy">{averageScore}%</p>
              <p className="text-gray-600">Average Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-bdo-navy">{totalQuestions}</p>
              <p className="text-gray-600">Total Questions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-bdo-navy">{Math.floor(averageTime / 60)}:{(averageTime % 60).toString().padStart(2, '0')}</p>
              <p className="text-gray-600">Avg. Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="font-medium text-gray-700 mr-2">View:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'overview' | 'department' | 'grade')}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="overview">Overview</option>
              <option value="department">By Department</option>
              <option value="grade">Grade Distribution</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-gray-700 mr-2">Department:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Departments</option>
              {departmentStats.map(stat => (
                <option key={stat.department} value={stat.department}>{stat.department}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-gray-700 mr-2">Grade:</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Grades</option>
              <option value="Distinction">Distinction (70-100)</option>
              <option value="Merit">Merit (60-69)</option>
              <option value="Pass">Pass (45-59)</option>
              <option value="Warning">Warning (30-44)</option>
              <option value="Fail">Fail (0-29)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-bdo-navy">Performance Analytics</h3>
        </div>
        <div className="h-80">
          {viewMode === 'grade' ? (
            <Pie data={getChartData()} options={chartOptions} />
          ) : (
            <Bar data={getChartData()} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Department Stats Table */}
      {viewMode === 'department' && departmentStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-bdo-navy">Department Performance Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Distribution</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentStats.map((stat) => (
                  <tr key={stat.department} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stat.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stat.participants}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stat.averageScore}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        <span className="mr-2">D:{stat.gradeDistribution.distinction}</span>
                        <span className="mr-2">M:{stat.gradeDistribution.merit}</span>
                        <span className="mr-2">P:{stat.gradeDistribution.pass}</span>
                        <span className="mr-2">W:{stat.gradeDistribution.warning}</span>
                        <span>F:{stat.gradeDistribution.fail}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filtered Results */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-bdo-navy">
            Individual Results
            {(selectedDepartment !== 'all' || selectedGrade !== 'all') &&
              ` - Filtered (${getFilteredResponses().length} results)`}
          </h3>
        </div>

        <div className="p-6">
          {getFilteredResponses().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No results match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredResponses().map((response, index) => (
                <div key={response.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-600' :
                            'bg-bdo-blue'
                      }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-bdo-navy">{response.user.email}</p>
                      <p className="text-sm text-gray-600">{response.user.department} Department</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-bdo-navy">{response.score}%</p>
                    <p className="text-sm text-gray-600">
                      Grade: <span className={`font-medium ${getGradeFromScore(response.score) === 'Distinction' ? 'text-green-600' :
                        getGradeFromScore(response.score) === 'Merit' ? 'text-blue-600' :
                        getGradeFromScore(response.score) === 'Pass' ? 'text-yellow-600' :
                        getGradeFromScore(response.score) === 'Warning' ? 'text-orange-600' : 'text-red-600'}`}>
                        {getGradeFromScore(response.score)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(response.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        quizName={session?.name || ''}
        loading={submittingFeedback}
      />
    </div>
  )
}

export default ResultsPage
