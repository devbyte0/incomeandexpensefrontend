'use client'

import { X } from 'lucide-react'

// Define attachment type
type Attachment = { name: string; url: string }

// Define transaction type
type Transaction = {
  title: string
  category?: { name: string }
  type: 'income' | 'expense'
  amount: number
  date: string | Date
  notes?: string
  attachments?: Attachment[]
}

// Props interface
interface ViewTransactionModalProps {
  transaction: Transaction
  onClose: () => void
}

export default function ViewTransactionModal({
  transaction,
  onClose,
}: ViewTransactionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3 sm:px-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
          Transaction Details
        </h2>

        <div className="space-y-4 text-sm sm:text-base">
          {/* Title */}
          <div>
            <p className="font-medium text-gray-600">Title</p>
            <p className="break-words">{transaction.title}</p>
          </div>

          {/* Category */}
          <div>
            <p className="font-medium text-gray-600">Category</p>
            <p>{transaction.category?.name || '-'}</p>
          </div>

          {/* Type */}
          <div>
            <p className="font-medium text-gray-600">Type</p>
            <p
              className={`${
                transaction.type === 'income'
                  ? 'text-green-600'
                  : 'text-red-600'
              } capitalize`}
            >
              {transaction.type}
            </p>
          </div>

          {/* Amount */}
          <div>
            <p className="font-medium text-gray-600">Amount</p>
            <p>${transaction.amount}</p>
          </div>

          {/* Date */}
          <div>
            <p className="font-medium text-gray-600">Date</p>
            <p>{new Date(transaction.date).toLocaleString()}</p>
          </div>

          {/* Notes */}
          {transaction.notes && (
            <div>
              <p className="font-medium text-gray-600">Notes</p>
              <p className="break-words">{transaction.notes}</p>
            </div>
          )}

          {/* Attachments */}
          {transaction.attachments?.length ? (
            <div>
              <p className="font-medium text-gray-600 mb-2">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {transaction.attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline break-words"
                  >
                    {file.name}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
