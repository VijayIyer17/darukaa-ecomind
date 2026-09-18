import ReactMarkdown from 'react-markdown'
import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! I am Darukaa EcoMind. Tell me about your land conditions, or ask me any environmental queries.' }
  ])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatEndRef = useRef(null)
  
  const [formData, setFormData] = useState({
    region: 'Maharashtra',
    soil_ph: 8.1,
    organic_carbon: 0.3,
    rainfall: 'Low',
    land_use: 'Monoculture wheat',
    water_availability: 'Low'
  })
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [loadingAssess, setLoadingAssess] = useState(false)

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isChatLoading])

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await axios.post('https://darukaa-backend-mf7w.onrender.com/api/chat', {
        session_id: 'user1',
        message: userMsg
      })
      setChatHistory(prev => [...prev, { role: 'ai', text: response.data.reply }])
    } catch (error) {
      console.error('Chat API Error:', error)
      setChatHistory(prev => [...prev, { role: 'ai', text: '⚠️ Error connecting to the AI agent.' }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleRunAssessment = async () => {
    setLoadingAssess(true)
    try {
      const response = await axios.post('https://darukaa-backend-mf7w.onrender.com/api/assess', formData)
      setAssessmentResult(response.data)
    } catch (error) {
      console.error('Assessment API Error:', error)
      alert("Error running assessment. Please check backend.")
    }
    setLoadingAssess(false)
  }

  // Dynamic Risk Color Function
  const getRiskStyle = (riskLevel) => {
    if (!riskLevel) return 'bg-gray-100 text-gray-800 border-gray-200'
    const level = riskLevel.toLowerCase()
    if (level.includes('high')) return 'bg-red-50 text-red-700 border-red-200'
    if (level.includes('medium')) return 'bg-orange-50 text-orange-700 border-orange-200'
    return 'bg-green-50 text-green-700 border-green-200'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-emerald-700 to-green-600 text-white p-5 shadow-lg flex items-center justify-between z-10">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Darukaa EcoMind</h1>
          <p className="text-emerald-100 text-sm mt-1">AI-Powered Environmental Risk Assessment</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
          <span>System Online</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL: Chat Agent */}
        <div className="w-full md:w-5/12 flex flex-col border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              AI
            </div>
            <div>
              <h2 className="font-bold text-slate-700">EcoMind Assistant</h2>
              <p className="text-xs text-slate-500">Powered by RAG & FAO Data</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm leading-relaxed text-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  {msg.role === 'user' ? (
                    msg.text
                  ) : (
                    <ReactMarkdown 
                      components={{
                        h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2 text-emerald-700" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-lg font-bold mt-3 mb-1 text-slate-800" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-extrabold text-slate-900" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="marker:text-emerald-500" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 rounded-bl-none shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 bg-white border-t border-slate-200 flex gap-3">
            <input 
              type="text" 
              className="flex-1 p-3 bg-slate-100 border-transparent focus:bg-white border focus:border-emerald-500 rounded-xl outline-none transition-all shadow-inner text-sm" 
              placeholder="Ask about organic carbon, pH levels..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isChatLoading}
              className={`px-5 py-3 rounded-xl text-white font-semibold transition-all shadow-md ${
                isChatLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg active:scale-95'
              }`}
            >
              Send
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Assessment Engine */}
        <div className="w-full md:w-7/12 flex flex-col bg-slate-100">
          <div className="p-5 overflow-y-auto flex-1">
            
            {/* Form Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                📊 Assessment Parameters
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Region</label>
                  <input 
                    type="text" 
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition"
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Soil pH <span className="text-slate-400 normal-case">(0 - 14)</span>
                  </label>
                  <input 
                    type="number" step="0.1" 
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition"
                    value={formData.soil_ph}
                    onChange={(e) => setFormData({...formData, soil_ph: parseFloat(e.target.value) || ''})}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Organic Carbon <span className="text-slate-400 normal-case">(%)</span>
                  </label>
                  <input 
                    type="number" step="0.01" 
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition"
                    value={formData.organic_carbon}
                    onChange={(e) => setFormData({...formData, organic_carbon: parseFloat(e.target.value) || ''})}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Land Use</label>
                  <input 
                    type="text" 
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition"
                    value={formData.land_use}
                    onChange={(e) => setFormData({...formData, land_use: e.target.value})}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rainfall</label>
                  <select 
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition cursor-pointer"
                    value={formData.rainfall}
                    onChange={(e) => setFormData({...formData, rainfall: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Water Availability</label>
                  <select 
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition cursor-pointer"
                    value={formData.water_availability}
                    onChange={(e) => setFormData({...formData, water_availability: e.target.value})}
                  >
                    <option value="Low">Low (Rainfed)</option>
                    <option value="Medium">Medium (Seasonal)</option>
                    <option value="High">High (Year-round)</option>
                  </select>
                </div>
              </div>
              
              <button 
                onClick={handleRunAssessment} 
                disabled={loadingAssess}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md flex justify-center items-center gap-2 ${
                  loadingAssess ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]'
                }`}
              >
                {loadingAssess ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Running Engine...
                  </>
                ) : '🚀 Run Full Risk Assessment'}
              </button>
            </div>

            {/* Results Card */}
            {assessmentResult && (
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 animate-fade-in-up">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Assessment Report</h3>
                    <p className="text-sm text-slate-500 mt-1">Generated by RAG Reasoning Engine</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wide inline-block ${getRiskStyle(assessmentResult.risk_level)}`}>
                      {assessmentResult.risk_level} RISK
                    </div>
                    <div className="text-xs font-bold text-slate-400 mt-2">
                      CONFIDENCE: <span className="text-slate-700">{(assessmentResult.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                  💡 AI Recommendations
                </h4>
                <div className="space-y-3 mb-6">
                  {assessmentResult.recommendations.map((rec, i) => (
                    <div key={i} className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-sm text-slate-700">
                      <span className="font-bold text-blue-800 block mb-1">{rec.action}</span>
                      {rec.reasoning}
                      <span className="block mt-2 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-md inline-block">
                        Timeline: {rec.time_horizon}
                      </span>
                    </div>
                  ))}
                </div>

                <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                  📚 Grounding Evidence (ChromaDB)
                </h4>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-600 space-y-2 font-mono leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                  {assessmentResult.evidence_used.map((ev, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-slate-400">[{i+1}]</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default App