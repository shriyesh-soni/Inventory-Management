'use client'

import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  useImportItems,
  useImportReceipts,
  downloadStockExport,
} from '@/hooks/use-import-export'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  Table,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import type { ImportResult } from '@/types/api'

function generateCsvTemplate(type: 'items' | 'receipts') {
  if (type === 'items') {
    const csvContent = 'sku,name,description,unit,reorderLevel,category\nSKU-101,Industrial Bearing,Heavy duty chrome steel,pcs,15,Mechanical\nSKU-102,Hydraulic Hose 10m,Reinforced rubber high pressure,box,5,Hydraulics'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'template_items_import.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  } else {
    const csvContent = 'sku,locationName,quantity\nSKU-101,Central Distribution,50\nSKU-102,Warehouse Bay 2,20'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'template_stock_receipts_import.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}

function ImportExportContent() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const isManager = user?.role === 'MANAGER'

  const [activeTab, setActiveTab] = useState<'items' | 'receipts'>('items')

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<any[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const importItemsMutation = useImportItems()
  const importReceiptsMutation = useImportReceipts()

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null)
      setPreviewRows([])
      setValidationError(null)
      setImportResult(null)
      return
    }

    if (!file.name.endsWith('.csv')) {
      setValidationError('Please upload a valid .csv spreadsheet file')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setValidationError(null)
    setImportResult(null)

    // Parse preview with PapaParse
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        const rows = results.data as any[]
        setPreviewRows(rows)

        // Validate structure
        if (rows.length > 0) {
          const firstRow = rows[0]
          if (activeTab === 'items') {
            if (!('sku' in firstRow) || !('name' in firstRow) || !('category' in firstRow)) {
              setValidationError(
                'Missing required columns. Header must include "sku", "name", and "category".'
              )
            }
          } else {
            if (!('sku' in firstRow) || !('locationName' in firstRow) || !('quantity' in firstRow)) {
              setValidationError(
                'Missing required columns. Header must include "sku", "locationName", and "quantity".'
              )
            }
          }
        }
      },
      error: (err) => {
        setValidationError(`Failed to parse CSV: ${err.message}`)
      },
    })
  }

  const handleTabSwitch = (tab: 'items' | 'receipts') => {
    setActiveTab(tab)
    setSelectedFile(null)
    setPreviewRows([])
    setValidationError(null)
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImportSubmit = async () => {
    if (!selectedFile || validationError) return

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      if (activeTab === 'items') {
        const res = await importItemsMutation.mutateAsync(formData)
        setImportResult(res)
        addToast({
          title: 'Bulk Import Finished',
          description: `Successfully imported ${res.imported} items (${res.failed.length} failed).`,
          type: res.imported > 0 ? 'success' : 'warning',
        })
      } else {
        const res = await importReceiptsMutation.mutateAsync(formData)
        setImportResult(res)
        addToast({
          title: 'Stock Receipts Imported',
          description: `Successfully credited ${res.imported} receipts (${res.failed.length} failed).`,
          type: res.imported > 0 ? 'success' : 'warning',
        })
      }
    } catch (err: any) {
      addToast({
        title: 'Import Failed',
        description: err.response?.data?.message || err.message || 'Error processing CSV file',
        type: 'error',
      })
    }
  }

  const handleExportStock = async () => {
    setIsExporting(true)
    try {
      await downloadStockExport()
      addToast({
        title: 'Stock Export Downloaded',
        description: 'Current stock position CSV file generated successfully.',
        type: 'success',
      })
    } catch (err: any) {
      addToast({
        title: 'Export Failed',
        description: err.response?.data?.message || err.message || 'Error generating export CSV',
        type: 'error',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const isSubmitting = importItemsMutation.isPending || importReceiptsMutation.isPending

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 inline-flex">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            CSV Bulk Operations & Data Export
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Import catalogs, bulk receive shipments via CSV, and download on-hand stock audits
          </p>
        </div>

        {/* Quick Export Button */}
        <Button
          onClick={handleExportStock}
          disabled={isExporting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-xs shrink-0"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>Export Stock Position</span>
        </Button>
      </div>

      {/* Import Workstation Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Sub-tab selection */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 p-2 gap-2">
          {isManager && (
            <button
              type="button"
              onClick={() => handleTabSwitch('items')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'items'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Import Items Catalog (Manager)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleTabSwitch('receipts')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'receipts'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import Stock Receipts</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions & Template Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-purple-50/60 border border-purple-100">
            <div>
              <p className="text-xs font-bold text-purple-900">
                {activeTab === 'items'
                  ? 'Bulk Product Catalog Import'
                  : 'Batch Stock Receipts Ingestion'}
              </p>
              <p className="text-xs text-purple-700 mt-0.5">
                {activeTab === 'items'
                  ? 'Required CSV columns: sku, name, unit, reorderLevel, category. Missing categories will be auto-created.'
                  : 'Required CSV columns: sku, locationName, quantity. Target item and facility must exist.'}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => generateCsvTemplate(activeTab)}
              className="border-purple-300 text-purple-800 hover:bg-purple-100 text-xs shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </Button>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragOver(false)
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0])
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-purple-500 bg-purple-50/50'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/20'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div
                className={`p-3.5 rounded-full ${
                  selectedFile
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-purple-100 text-purple-600'
                }`}
              >
                {selectedFile ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>

              {selectedFile ? (
                <div>
                  <p className="font-bold text-gray-900 text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click or drag to change file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    Drag and drop your CSV file here, or browse
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Supported format: Comma-Separated Values (.csv)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">CSV Validation Error</p>
                <p className="mt-0.5 text-rose-700">{validationError}</p>
              </div>
            </div>
          )}

          {/* Preview Table of First 5 Rows */}
          {previewRows.length > 0 && !validationError && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-purple-600" />
                  File Sample Preview (First {previewRows.length} Rows)
                </p>
                <span className="text-[11px] text-gray-400">Header validated</span>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <tr>
                      {Object.keys(previewRows[0] || {}).map((header) => (
                        <th key={header} className="py-2 px-3">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        {Object.values(row).map((val: any, colIdx) => (
                          <td key={colIdx} className="py-2 px-3 text-gray-700 font-mono text-[11px]">
                            {String(val || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Import Action Button */}
          {selectedFile && !validationError && (
            <div className="flex items-center justify-end pt-3 border-t border-gray-100">
              <Button
                onClick={handleImportSubmit}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 shadow-xs flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Import...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Execute Import
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results Reporting Display */}
          {importResult && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Import Summary Results
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <p className="text-xs font-medium text-emerald-700">Successfully Imported</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-800">
                    {importResult.imported} Records
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    importResult.failed.length > 0
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <p className="text-xs font-medium text-gray-500">Failed Records</p>
                  <p className="text-2xl font-bold mt-1">
                    {importResult.failed.length} Records
                  </p>
                </div>
              </div>

              {/* Expandable failure report */}
              {importResult.failed.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-rose-700">Failed Rows Report:</p>
                  <div className="border border-rose-200 rounded-xl overflow-hidden divide-y divide-rose-100 bg-rose-50/40 max-h-60 overflow-y-auto">
                    {importResult.failed.map((fail, i) => (
                      <div key={i} className="p-3 text-xs flex items-start gap-3">
                        <span className="font-bold text-rose-700 px-2 py-0.5 bg-rose-100 rounded text-[11px]">
                          Row {fail.row}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-rose-900">{fail.reason}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                            {JSON.stringify(fail.data)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ImportExportPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ImportExportContent />
      </MainLayout>
    </AuthGuard>
  )
}
