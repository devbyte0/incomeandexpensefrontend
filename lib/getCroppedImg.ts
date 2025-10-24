export default function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.setAttribute('crossOrigin', 'anonymous')
      img.onload = () => resolve(img)
      img.onerror = (err) => reject(err)
      img.src = url
    })

  return new Promise(async (resolve, reject) => {
    try {
      const image = await createImage(imageSrc)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) throw new Error('Cannot get canvas context')

      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )

      resolve(canvas.toDataURL('image/jpeg'))
    } catch (err) {
      reject(err)
    }
  })
}
