import { useRef, useState } from 'react';
import { FaIdCard, FaUserAlt, FaUserCircle } from 'react-icons/fa';

const labels = ['Foto del DPI', 'Selfie', 'Foto cuerpo completo'];
const icons = [FaIdCard, FaUserCircle, FaUserAlt];

function Paso2({
  saveData,
  nexStep,
  prevStep,
}: {
  saveData: (data: any) => void;
  nexStep: () => void;
  prevStep: () => void;
}) {
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImages, setPreviewImages] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleFileChange = (index: number, file: File | null) => {
    if (file && file.size > 6 * 1024 * 1024) {
      alert('El archivo no debe superar los 6 MB.');
      return;
    }
    const updatedFiles = [...files];
    updatedFiles[index] = file;
    setFiles(updatedFiles);
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async () => {
    const previews = await Promise.all(
      files.map(async (file) => {
        if (!file) return null;
        return await toBase64(file);
      })
    );
    setPreviewImages(previews);
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    const finalFiles = await Promise.all(
      files.map(async (file) => {
        if (!file) return null;
        const base64 = await toBase64(file);
        return {
          file_name: file.name,
          content_type: file.type,
          is_base64_encoded: true,
          file_content: base64.split(',')[1], // quitamos el prefijo data:image
        };
      })
    );

    saveData({ files: finalFiles });
    console.log(finalFiles);
    nexStep();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {labels.map((label, index) => {
          const Icon = icons[index];
          const fileLoaded = files[index] !== null;

          return (
            <div
              key={index}
              onClick={() => inputRefs[index].current?.click()}
              className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg transition cursor-pointer select-none ${
                fileLoaded
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <Icon size={50} className="mb-2 text-gray-700" />
              <p className="font-semibold mb-2 text-center">
                {fileLoaded ? 'Imagen cargada' : label}
              </p>
              <input
                type="file"
                accept="image/*"
                ref={inputRefs[index]}
                onChange={(e) =>
                  handleFileChange(
                    index,
                    e.target.files ? e.target.files[0] : null
                  )
                }
                className="hidden"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between flex-wrap gap-2">
        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={prevStep}
        >
          Regresar
        </button>

        <button
          className="bg-green-500 text-white p-2 rounded-md"
          onClick={handlePreview}
          disabled={files.every((file) => file === null)}
        >
          Previsualizar Imágenes
        </button>

        <button
          className={`p-2 rounded-md text-white ${
            files.some((file) => file === null)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500'
          }`}
          onClick={handleSubmit}
          disabled={files.some((file) => file === null)}
        >
          Siguiente
        </button>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white p-4 rounded-lg max-w-4xl w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center mb-2">
              Previsualización de Imágenes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {previewImages.map((src, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-4 border-2 rounded-lg"
                >
                  <p className="font-semibold mb-2">{labels[index]}</p>
                  {src ? (
                    <img
                      src={src}
                      alt="Preview"
                      className="max-h-60 object-contain"
                    />
                  ) : (
                    <p className="text-gray-500">No hay imagen</p>
                  )}
                </div>
              ))}
            </div>

            <button
              className="bg-red-500 text-white p-2 rounded-md w-full"
              onClick={() => setShowPreview(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Paso2;
