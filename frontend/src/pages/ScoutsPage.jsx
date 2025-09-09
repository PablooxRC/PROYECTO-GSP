import { useEffect, useState } from "react"
import { Button } from '../components/ui/Button.jsx'
import { Card } from '../components/ui/Card.jsx'
import { useScout } from "../context/scoutContex.jsx"
import { useNavigate } from "react-router-dom"
import { useAuth } from '../context/AuthContext'
import { PiTrashSimpleLight } from 'react-icons/pi'
import { BiPencil } from 'react-icons/bi'

function ScoutPage() {
  const { scouts, loadscouts, deleteScout } = useScout(); 
  const navigate = useNavigate()
  const { user } = useAuth()

  const [csvData, setCsvData] = useState([])
  const [showCsvEditor, setShowCsvEditor] = useState(false)

  useEffect(() => {
    loadscouts();
  }, []) 

  // 📂 Cargar CSV
  function handleCSVUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const rows = text.split("\n").map(row => row.split(","))
      // Solo dos columnas
      const filtered = rows.map(r => [r[0] || "", r[1] || ""])
      setCsvData(filtered)
      setShowCsvEditor(true)
    }
    reader.readAsText(file)
  }

  // ✏️ Editar celda
  function handleEditCell(rowIndex, colIndex, value) {
    setCsvData(prev => {
      const newData = [...prev]
      newData[rowIndex][colIndex] = value
      return newData
    })
  }

  // 💾 Descargar CSV
  function handleDownloadCSV() {
    if (!csvData || csvData.length === 0) {
      alert("No hay datos para exportar")
      return
    }
    const csvContent = csvData.map(row => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "archivo_modificado.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 📌 Reporte scouts
  function handlePrintReport() {
    const printWindow = window.open('', '', 'width=800,height=600')
    const htmlContent = `
      <html>
        <head>
          <title>Reporte de Scouts</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1>Reporte de Scouts - Unidad: ${user?.unidad || "No disponible"}</h1>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>C.I.</th>
                <th>Puntaje</th>
                <th>Preguntas mal contestadas</th>
              </tr>
            </thead>
            <tbody>
              ${scouts.map(scout => `
                <tr>
                  <td>${scout.nombre}</td>
                  <td>${scout.apellido}</td>
                  <td>${scout.ci}</td>
                  <td>${scout.puntaje ?? 0}</td>
                  <td>${scout.preguntas_mal_contestadas ?? 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div className="relative">
      {/* ==================== */}
      {/* Fondo que se borra */}
      {/* ==================== */}
      <div className={`${showCsvEditor ? "blur-sm" : ""}`}>
        {/* Botón para subir CSV */}
        <div className="mb-4 flex gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <label >
            Seleccionar CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
          </Button>
          
        </div>

        {/* Scouts */}
        <div>
          <h1 className="text-4xl font-extrabold dark:text-white py-4">
            Unidad: {user?.unidad || "No disponible"}
          </h1>
        </div>

        <div className="mb-4 flex gap-4">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handlePrintReport}
          >
            Imprimir Reporte de Scouts
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {scouts.map((scout) => (
            <Card key={scout.ci} className="px-7 py-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {scout.nombre} {scout.apellido}
                </h1>
                <p>{scout.ci}</p>
                <p>Puntaje: {scout.puntaje ?? 0}</p>
                <p>Preguntas mal contestadas: {scout.preguntas_mal_contestadas ?? 0}</p>
              </div>
              <div className="my-2 flex justify-end gap-x-2">
                <Button
                  className="bg-red-500 hover:bg-red-600"
                  onClick={async () => {
                    if (window.confirm("¿Estas seguro de eliminar esta tarea?")) {
                      await deleteScout(scout.ci);
                    }
                  }}
                >
                  <PiTrashSimpleLight className="text-white" />
                  Eliminar
                </Button>
                <Button onClick={() => navigate(`/scouts/${scout.ci}/edit`)}>
                  <BiPencil className="text-white" />
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ==================== */}
      {/* Modal CSV Editor */}
      {/* ==================== */}
      {showCsvEditor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-[600px] max-h-[70vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-3">Editor de CSV</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm mb-4 bg-white dark:bg-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border p-2">Context</th>
                    <th className="border p-2">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border p-2">
                          <input
                            value={cell}
                            onChange={(e) =>
                              handleEditCell(rowIndex, colIndex, e.target.value)
                            }
                            className="w-full bg-transparent outline-none text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4">
              <Button
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-xs"
                onClick={() => setShowCsvEditor(false)}
              >
                Cerrar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                onClick={handleDownloadCSV}
              >
                Descargar CSV
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScoutPage
