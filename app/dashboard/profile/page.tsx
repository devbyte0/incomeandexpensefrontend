'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, Check } from 'lucide-react'
import getCroppedImg from '@/lib/getCroppedImg' // We'll define this helper
import toast from 'react-hot-toast'

interface ProfileAvatarCropperProps {
  image: string
  onCrop: (croppedImage: string) => void
  onClose: () => void
}

export default function ProfileAvatarCropper({ image, onCrop, onClose }: ProfileAvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return

    try {
      setLoading(true)
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      onCrop(croppedImage)
      toast.success('Avatar cropped successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to crop image.')
    } finally {
      setLoading(false)
    }
  }, [croppedAreaPixels, image, onCrop])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Crop Avatar</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-700">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-md flex items-center"
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary btn-md flex items-center"
            >
              {loading ? <div className="loading-spinner mr-2"></div> : <Check className="h-4 w-4 mr-2" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
