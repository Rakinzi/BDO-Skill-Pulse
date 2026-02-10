import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save } from 'lucide-react'
import Button from '../lib/components/Button'

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  type: 'multiple-choice' | 'true-false'
}

function CreateSessionPage() {
  const navigate = useNavigate()
  const [sessionName, setSessionName] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [targetDepartment, setTargetDepartment] = useState('Tax')
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      type: 'multiple-choice'
    }
  ])
  const [loading, setLoading] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      type: 'multiple-choice'
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId))
    }
  }

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, options: q.options.map((opt, i) => i === optionIndex ? value : opt) }
        : q
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!sessionName.trim() || !sessionDate || !sessionTime) {
        alert('Please fill in all session details')
        return
      }

      // Validate questions
      for (const question of questions) {
        if (!question.text.trim()) {
          alert('Please fill in all question texts')
          return
        }
        if (question.options.some(opt => !opt.trim())) {
          alert('Please fill in all answer options')
          return
        }
      }

      const sessionData = {
        name: sessionName,
        date: new Date(`${sessionDate}T${sessionTime}`).toISOString(),
        time: sessionTime,
        department: targetDepartment,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          type: q.type
        })),
        createdBy: 'admin@bdo.co.zw', // This should come from auth context
        isActive: false
      }

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })

      if (response.ok) {
        // Send notifications to the target department
        try {
          const notificationResponse = await fetch(`/api/department/${targetDepartment}/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'quiz_posted',
              title: 'New Quiz Available',
              message: `${'ADMIN'} has posted a quiz for the ${targetDepartment === 'everyone' ? 'all departments' : targetDepartment + ' department'} to be completed within the stated time lines. please address this ticket.`,
              adminEmail: 'admin@bdo.co.zw',
              quizName: sessionName
            })
          })

          if (!notificationResponse.ok) {
            console.error('Failed to send notifications')
          }
        } catch (error) {
          console.error('Error sending notifications:', error)
        }

        navigate('/admin')
      } else {
        throw new Error('Failed to create session')
      }
    } catch (error) {
      console.error('Failed to create session:', error)
      alert('Failed to create session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-bdo-navy">Create New Quiz Session</h1>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-bdo-navy mb-4">Session Details</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Name
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bdo-red"
                placeholder="e.g., Q1 2024 Tax Quiz"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Department
              </label>
              <select
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bdo-red"
                required
              >
                <option value="Tax">Tax Department</option>
                <option value="Audit">Audit Department</option>
                <option value="everyone">Everyone (All Departments)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bdo-red"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bdo-red"
                required
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-bdo-navy">Questions</h2>
            <Button type="button" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-bdo-navy">
                    Question {questionIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bdo-red"
                      rows={3}
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                            className="text-bdo-red focus:ring-bdo-red"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bdo-red"
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Select the radio button next to the correct answer
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            <Save className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateSessionPage
