import { useState } from 'react'
import { sendReport } from '../api/admin.api'

export default function AdminSendReport(){
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try{
      await sendReport({ from: from || null, to: to || null, recipient_email: email || null })
      setMessage({ type: 'success', text: 'Reporte enviado correctamente' })
    }catch(err){
      setMessage({ type: 'error', text: err?.response?.data?.message || err.message || 'Error' })
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Enviar reporte (Excel)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Desde</label>
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="mt-1 block w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Hasta</label>
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="mt-1 block w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium">Enviar a (email)</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 block w-full" placeholder="destino@ejemplo.com" />
        </div>
        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </div>
      </form>
      {message && (
        <div className={`mt-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
