import React, { useState, useCallback } from 'react';
// @ts-ignore
import Cropper from 'react-easy-crop';

interface Props {
  image: string | null;
  onCrop: (cropped: string) => void;
  onClose: () => void;
}

const ProfileAvatarCropper: React.FC<Props> = ({ image, onCrop, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!image || !croppedAreaPixels) return;
    setSaving(true);
    const cropped = await getCroppedImage(image, croppedAreaPixels);
    setSaving(false);
    onCrop(cropped);
  }, [croppedAreaPixels, image, onCrop]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Crop Your Profile Picture</h3>
        <div className="relative w-full aspect-square bg-black">
          {image && (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{ containerStyle: { borderRadius: ".75rem", width: "100%", height: 320 }, cropAreaStyle: { border: '2px solid #3b82f6' } }}
            />
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-end mt-6 gap-3">
          <button onClick={onClose} className="btn btn-secondary btn-md w-full sm:w-auto">Cancel</button>
          <button onClick={getCroppedImg} disabled={saving} className="btn btn-primary btn-md w-full sm:w-auto">
            {saving ? 'Saving...' : 'Crop & Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatarCropper;

// Utility: create cropped image as base64
function getCroppedImage(imageSrc: string, crop: any): Promise<string> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const size = Math.max(crop.width, crop.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        size,
        size
      );
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
  });
}
