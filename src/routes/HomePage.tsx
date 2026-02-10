import { useAuth } from '../lib/contexts/AuthContext'

function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bdo-navy to-bdo-blue opacity-95"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src="/bdo_logo.png"
                  alt="BDO Logo"
                  className="h-16 w-auto object-contain filter brightness-0 invert"
                />
                <div className="border-l-2 border-white pl-4">
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                    BDO Skills Pulse
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-200 mt-2">
                    Training Effectiveness & Competency Validation
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-200">
                <p className="text-lg leading-relaxed">
                  A comprehensive platform designed to measure knowledge retention, 
                  practical application readiness, and professional development progress 
                  across BDO's workforce.
                </p>
                <div className="flex flex-wrap gap-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white bg-opacity-20">
                    Knowledge Retention Validation
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white bg-opacity-20">
                    Competency Assessment
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white bg-opacity-20">
                    Professional Development
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="/login"
                  className="bg-white text-bdo-navy px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </a>
                <a
                  href="#about"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-bdo-navy transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">Welcome to BDO Skills Pulse</h3>
                    <p className="text-gray-600 mt-2">Your professional development and competency validation platform</p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Knowledge Retention Validation</span>
                      </div>
                      <span className="text-gray-500">✓</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Competency Assessment</span>
                      </div>
                      <span className="text-gray-500">✓</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Professional Development Tracking</span>
                      </div>
                      <span className="text-gray-500">✓</span>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-500 border-t pt-4">
                    <p className="font-medium text-gray-700 mb-2">Ready to get started?</p>
                    <p className="text-gray-600">Access your personalized dashboard to begin your competency journey</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About BDO Skills Pulse</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Purpose and Objectives: Building a Learning Organization of Excellence
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Core Purpose */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-bdo-navy">
            <div className="w-12 h-12 bg-bdo-navy bg-opacity-10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-bdo-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Purpose</h3>
            <p className="text-gray-700 leading-relaxed">
              BDO Skills Pulse serves as a comprehensive training effectiveness and competency validation platform 
              designed to measure knowledge retention, practical application readiness, and professional development 
              progress across BDO's workforce. The application bridges the critical gap between training delivery 
              and actual workplace competency, ensuring that investments in employee development translate into 
              measurable improvements in audit quality, client service, and regulatory compliance.
            </p>
          </div>

          {/* Core Objectives */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-bdo-blue">
            <div className="w-12 h-12 bg-bdo-blue bg-opacity-10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-bdo-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Core Objectives</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-bdo-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Knowledge retention validation and competency assessment
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-bdo-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Risk mitigation and quality assurance through skill validation
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-bdo-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Career development pathway mapping and transparent progression
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-bdo-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Training ROI optimization and continuous improvement
              </li>
            </ul>
          </div>

          {/* Expected Outcomes */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-bdo-red">
            <div className="w-12 h-12 bg-bdo-red bg-opacity-10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-bdo-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Expected Outcomes</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-bdo-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Enhanced audit quality and reduced error rates
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-bdo-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Improved client confidence through demonstrable staff competency
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-bdo-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Reduced liability exposure from knowledge-based mistakes
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-bdo-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Competitive advantage in talent retention and client acquisition
              </li>
            </ul>
          </div>
        </div>

        {/* Professional Standards Section */}
        <div className="bg-gradient-to-r from-bdo-navy to-bdo-blue rounded-2xl p-12 text-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">Professional Standards Compliance</h3>
              <p className="text-gray-200 leading-relaxed mb-6">
                BDO Skills Pulse maintains documented evidence of employee competency in areas required by 
                professional bodies (AICPA, IIA, ISACA) and regulatory authorities. This creates an audit trail 
                demonstrating BDO's commitment to maintaining qualified staff and meeting continuing professional 
                education (CPE) requirements.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">AICPA</span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">IIA</span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">ISACA</span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">CPE</span>
              </div>
            </div>
            <div className="text-right">
              <blockquote className="text-xl italic border-l-4 border-white border-opacity-30 pl-6">
                "This application isn't simply about testing—it's about building a learning organization where 
                excellence is measured, recognized, and continuously developed."
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State for Auth */}
      {user && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bdo-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized BDO Skills Pulse experience...</p>
        </div>
      )}
    </div>
  )
}

export default HomePage
