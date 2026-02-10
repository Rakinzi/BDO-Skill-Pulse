import { useState, useEffect } from 'react'
import { Users, Award, TrendingUp, TrendingDown, Minus, Download, AlertTriangle, Eye, UserX, User } from 'lucide-react'
import Button from '../lib/components/Button'
import { useAuth } from '../lib/contexts/AuthContext'

interface UserPerformance {
  email: string
  department: string
  quizzesTaken: number
  averageScore: number
  totalScore: number
  grade: 'Distinction' | 'Merit' | 'Pass' | 'Warning' | 'Fail'
  trend: 'improving' | 'stable' | 'declining'
  lastQuizDate: string
  submissions: Array<{
    sessionId: string
    sessionName: string
    score: number
    completedAt: string
  }>
}

function ParticipantsPage() {
  const [participants, setParticipants] = useState<UserPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserPerformance | null>(null)
  const [filterGrade, setFilterGrade] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const { accessToken } = useAuth()

  useEffect(() => {
    fetchParticipants()
  }, [accessToken])

  const fetchParticipants = async () => {
    try {
      // Get all users and their submissions
      const usersResponse = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      const sessionsResponse = await fetch('http://localhost:3001/api/sessions', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (usersResponse.ok && sessionsResponse.ok) {
        const users = await usersResponse.json()
        const sessions = await sessionsResponse.json()

        // Calculate performance for each user
        const participantsData = await Promise.all(
          users.map(async (user: any) => {
            const submissionsResponse = await fetch(`http://localhost:3001/api/user/${user.email}/submissions`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            })
            if (submissionsResponse.ok) {
              const submissions = await submissionsResponse.json()

              // Group submissions by session and use highest score per session
              const sessionScores = new Map()
              submissions.forEach((sub: any) => {
                const currentHighest = sessionScores.get(sub.sessionId) || 0
                if (sub.score > currentHighest) {
                  sessionScores.set(sub.sessionId, sub.score)
                }
              })

              // Calculate performance metrics using highest scores
              const highestScores = Array.from(sessionScores.values())
              const totalScore = highestScores.reduce((sum: number, score: number) => sum + score, 0)
              const averageScore = highestScores.length > 0 ? Math.round(totalScore / highestScores.length) : 0

              // Determine grade based on average score
              let grade: UserPerformance['grade']
              if (averageScore >= 70) grade = 'Distinction'
              else if (averageScore >= 60) grade = 'Merit'
              else if (averageScore >= 45) grade = 'Pass'
              else if (averageScore >= 30) grade = 'Warning'
              else grade = 'Fail'

              // Calculate trend (simplified - could be more sophisticated)
              const trend: UserPerformance['trend'] = submissions.length >= 2 ?
                (submissions[submissions.length - 1].score > submissions[submissions.length - 2].score ? 'improving' :
                 submissions[submissions.length - 1].score < submissions[submissions.length - 2].score ? 'declining' : 'stable') : 'stable'

              // Add session names to submissions
              const submissionsWithNames = submissions.map((sub: any) => {
                const session = sessions.find((s: any) => s.id === sub.sessionId)
                return {
                  ...sub,
                  sessionName: session ? session.name : 'Unknown Session'
                }
              })

              return {
                email: user.email,
                department: user.department,
                quizzesTaken: submissions.length,
                averageScore,
                totalScore,
                grade,
                trend,
                lastQuizDate: submissions.length > 0 ? submissions[submissions.length - 1].completedAt : '',
                submissions: submissionsWithNames
              }
            }
            return null
          })
        )

        setParticipants(participantsData.filter(Boolean))
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Distinction': return 'bg-green-100 text-green-800'
      case 'Merit': return 'bg-blue-100 text-blue-800'
      case 'Pass': return 'bg-yellow-100 text-yellow-800'
      case 'Warning': return 'bg-orange-100 text-orange-800'
      case 'Fail': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↗️'
      case 'declining': return '↘️'
      default: return '→'
    }
  }

  // Apply both filters
  let filteredParticipants = participants
  if (filterGrade !== 'all') {
    filteredParticipants = filteredParticipants.filter(p => p.grade === filterGrade)
  }
  if (filterDepartment !== 'all') {
    filteredParticipants = filteredParticipants.filter(p => p.department === filterDepartment)
  }

  // Get unique departments for filter dropdown
  const departments = [...new Set(participants.map(p => p.department))].sort()

  const handleWarnUser = async (userEmail: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/user/${userEmail}/warn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          reason: 'Performance flagged - improvement needed',
          adminEmail: 'admin@bdo.co.zw' // In production, get from auth context
        })
      })

      if (response.ok) {
        alert(`Warning sent to ${userEmail}`)
        // Could refresh data here if needed
      } else {
        alert('Failed to send warning')
      }
    } catch (error) {
      console.error('Error sending warning:', error)
      alert('Error sending warning')
    }
  }

  const handleElevateUser = async (userEmail: string) => {
    if (!confirm(`Are you sure you want to elevate ${userEmail} to administrator status? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/user/${userEmail}/elevate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          adminEmail: 'admin@bdo.co.zw' // In production, get from auth context
        })
      })

      if (response.ok) {
        alert(`${userEmail} has been elevated to administrator status`)
        // Refresh the participants list to update the UI
        fetchParticipants()
      } else {
        const error = await response.json()
        alert(`Failed to elevate user: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error elevating user:', error)
      alert('Error elevating user')
    }
  }

  const exportToExcel = () => {
    // Simple CSV export for now (could be enhanced to actual Excel)
    const csvData = [
      ['Email', 'Department', 'Quizzes Taken', 'Average Score', 'Grade', 'Trend', 'Last Quiz Date'],
      ...filteredParticipants.map(p => [
        p.email,
        p.department,
        p.quizzesTaken,
        p.averageScore,
        p.grade,
        p.trend,
        p.lastQuizDate ? new Date(p.lastQuizDate).toLocaleDateString() : ''
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'participants_performance.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading participants data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-bdo-navy">Participants Performance</h1>
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
          Export to Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700">Filter by Grade:</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
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

          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700">Filter by Department:</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-bdo-navy">Performance Overview</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.map((participant) => (
                <tr key={participant.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{participant.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{participant.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{participant.quizzesTaken}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{participant.averageScore}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(participant.grade)}`}>
                      {participant.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getTrendIcon(participant.trend)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(participant)}
                          className="border-red-300 text-red-600 hover:bg-red-100"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <div className="flex gap-1">
                          {!(participant.email.includes('admin')) && (
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => handleElevateUser(participant.email)}
                            >
                              <User className="h-3 w-3 mr-1" />
                              Elevate
                            </Button>
                          )}
                          {(participant.grade === 'Warning' || participant.grade === 'Fail') && (
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleWarnUser(participant.email)}
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedUser.email}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{selectedUser.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quizzes Taken</p>
                  <p className="font-medium">{selectedUser.quizzesTaken}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="font-medium">{selectedUser.averageScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Grade</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(selectedUser.grade)}`}>
                    {selectedUser.grade}
                  </span>
                </div>
              </div>

              <h4 className="font-semibold mb-3">Quiz History</h4>
              <div className="space-y-2">
                {selectedUser.submissions.map((submission, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{submission.sessionName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(submission.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{submission.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParticipantsPage
