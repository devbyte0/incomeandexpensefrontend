'use client'

import React, { useState } from 'react'
import { Download, FileText, Calendar, Settings, Palette, Eye } from 'lucide-react'
import { PDFGenerator, PDFData, formatDataForPDF } from '@/lib/pdfService'
import toast from 'react-hot-toast'

interface PDFGeneratorProps {
  analyticsData?: any
  transactionsData?: any
  categoriesData?: any
  period?: string
  className?: string
  variant?: 'button' | 'dropdown' | 'modal'
}

export default function PDFGeneratorComponent({
  analyticsData,
  transactionsData,
  categoriesData,
  period = 'month',
  className = '',
  variant = 'button'
}: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [pdfOptions, setPdfOptions] = useState({
    includeCharts: true,
    includeTransactions: true,
    includeCategories: true,
    colorScheme: 'blue' as 'blue' | 'green' | 'purple' | 'red'
  })

  const handleGeneratePDF = async () => {
    if (!analyticsData) {
      toast.error('No data available to generate PDF')
      return
    }

    setIsGenerating(true)
    try {
      const pdfData = formatDataForPDF(
        analyticsData,
        transactionsData,
        categoriesData,
        period
      )

      const generator = new PDFGenerator()
      const filename = `financial-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`
      
      await generator.generatePDF(pdfData)
      generator.downloadPDF(pdfData, filename)
      
      toast.success('PDF opened for printing! Use Ctrl+P to save as PDF.')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreviewPDF = async () => {
    if (!analyticsData) {
      toast.error('No data available to preview PDF')
      return
    }

    setIsGenerating(true)
    try {
      const pdfData = formatDataForPDF(
        analyticsData,
        transactionsData,
        categoriesData,
        period
      )

      const generator = new PDFGenerator()
      await generator.generatePDF(pdfData)
      
      toast.success('PDF preview opened in new tab!')
    } catch (error) {
      console.error('PDF preview error:', error)
      toast.error('Failed to preview PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (variant === 'button') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating || !analyticsData}
          className="btn btn-primary btn-md inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="loading-spinner mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </>
          )}
        </button>
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="btn btn-primary btn-md inline-flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    PDF Export Options
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Include Sections */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Include Sections
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pdfOptions.includeCharts}
                          onChange={(e) => setPdfOptions({ ...pdfOptions, includeCharts: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Charts & Analytics</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pdfOptions.includeTransactions}
                          onChange={(e) => setPdfOptions({ ...pdfOptions, includeTransactions: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Recent Transactions</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pdfOptions.includeCategories}
                          onChange={(e) => setPdfOptions({ ...pdfOptions, includeCategories: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Category Breakdown</span>
                      </label>
                    </div>
                  </div>

                  {/* Color Scheme */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Color Scheme
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: 'blue', color: 'bg-blue-500' },
                        { name: 'green', color: 'bg-green-500' },
                        { name: 'purple', color: 'bg-purple-500' },
                        { name: 'red', color: 'bg-red-500' }
                      ].map((scheme) => (
                        <button
                          key={scheme.name}
                          onClick={() => setPdfOptions({ ...pdfOptions, colorScheme: scheme.name as any })}
                          className={`h-8 w-8 rounded-full ${scheme.color} border-2 transition-all ${
                            pdfOptions.colorScheme === scheme.name
                              ? 'border-gray-400 scale-110'
                              : 'border-gray-200 hover:scale-105'
                          }`}
                          title={scheme.name.charAt(0).toUpperCase() + scheme.name.slice(1)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handlePreviewPDF}
                    disabled={isGenerating || !analyticsData}
                    className="btn btn-secondary btn-sm flex-1 inline-flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={handleGeneratePDF}
                    disabled={isGenerating || !analyticsData}
                    className="btn btn-primary btn-sm flex-1 inline-flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Backdrop */}
        {showOptions && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
        )}
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setShowOptions(true)}
          className="btn btn-primary btn-md inline-flex items-center"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate PDF Report
        </button>

        {/* Modal */}
        {showOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Generate PDF Report
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Create a comprehensive financial report
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOptions(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Report Preview */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Report Preview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Period:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100 capitalize">{period}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Generated:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Sections:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {[
                            pdfOptions.includeCharts && 'Analytics',
                            pdfOptions.includeTransactions && 'Transactions',
                            pdfOptions.includeCategories && 'Categories'
                          ].filter(Boolean).join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100 capitalize">
                          {pdfOptions.colorScheme}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                        Include Sections
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="checkbox"
                            checked={pdfOptions.includeCharts}
                            onChange={(e) => setPdfOptions({ ...pdfOptions, includeCharts: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Charts & Analytics
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Visual data representation
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="checkbox"
                            checked={pdfOptions.includeTransactions}
                            onChange={(e) => setPdfOptions({ ...pdfOptions, includeTransactions: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Recent Transactions
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Latest 50 transactions
                            </div>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="checkbox"
                            checked={pdfOptions.includeCategories}
                            onChange={(e) => setPdfOptions({ ...pdfOptions, includeCategories: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Category Breakdown
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Spending by category
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                        Color Theme
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { name: 'blue', color: 'bg-blue-500', label: 'Blue' },
                          { name: 'green', color: 'bg-green-500', label: 'Green' },
                          { name: 'purple', color: 'bg-purple-500', label: 'Purple' },
                          { name: 'red', color: 'bg-red-500', label: 'Red' }
                        ].map((scheme) => (
                          <button
                            key={scheme.name}
                            onClick={() => setPdfOptions({ ...pdfOptions, colorScheme: scheme.name as any })}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              pdfOptions.colorScheme === scheme.name
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <div className={`h-6 w-6 rounded-full ${scheme.color} mx-auto mb-2`}></div>
                            <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {scheme.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-8">
                  <button
                    onClick={() => setShowOptions(false)}
                    className="btn btn-secondary btn-md flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePreviewPDF}
                    disabled={isGenerating || !analyticsData}
                    className="btn btn-secondary btn-md inline-flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={handleGeneratePDF}
                    disabled={isGenerating || !analyticsData}
                    className="btn btn-primary btn-md inline-flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
