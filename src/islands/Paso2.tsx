import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaIdCard, FaUserAlt, FaUserCircle } from 'react-icons/fa';

const labels = ['Foto del DPI', 'Selfie', 'Foto cuerpo completo'];
const icons = [FaIdCard, FaUserCircle, FaUserAlt];

function Paso2({
  saveData,
  datos,
  nexStep,
  prevStep,
}: {
  saveData: (data: any) => void;
  datos: any;
  nexStep: () => void;
  prevStep: () => void;
}) {
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [showPreview, setShowPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [captureMode, setCaptureMode] = useState<
    'environment' | 'user' | boolean
  >(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

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

  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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
      files.map(async (file, i) => {
        if (!file) return null;
        const base64 = await toBase64(file);
        return {
          file_name: file.name,
          content_type: file.type,
          is_base64_encoded: true,
          file_content: base64.split(',')[1], // quitamos el prefijo data:image
          operation: 'aiRiskScore,aiImageRekognitio,identityVerify',
        };
      })
    );

    saveData({ files: finalFiles });

    //realizamos las 3 peticiones hacia https://xysokakk47.execute-api.us-east-1.amazonaws.com/dev/aiwithfile
    let isPersona = false;
    let isSimilar = false;
    await toast.promise(
      Promise.all(
        finalFiles.map(async (file, i) => {
          if (!file) return null;
          if (i == 0) {
            await fetch(
              'https://xysokakk47.execute-api.us-east-1.amazonaws.com/dev/verifyIdentity',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  source_image: file.file_content,
                  target_image: finalFiles[1]?.file_content,
                }),
              }
            ).then(async (response) => {
              const res = await response.json();
              const body = JSON.parse(res?.body || '{}');
              if (+body?.max_similarity > 60) isSimilar = true;
            });
            return null;
          }
          const response = await fetch(
            'https://xysokakk47.execute-api.us-east-1.amazonaws.com/dev/aiwithfile',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(file),
            }
          );
          const result = await response.json();
          const res = JSON.parse(result?.body || '{}');
          if (!res?.analisis) return null;
          const jsonMatch = res?.analisis?.match(/```json([\s\S]*?)```/);

          if (jsonMatch) {
            const jsonString = jsonMatch[1];
            const jsonData = JSON.parse(jsonString);
            if (jsonData?.esPersona != 'no') {
              isPersona = true;
            }
            saveData({
              ...datos,
              peticion: jsonData,
            });
          }
          return res;
        })
        //hacemos fetch a la api de peticiones.ts
      ),
      {
        loading: 'Cargando...',
        success: 'Imágenes cargadas correctamente!',
        error: 'Error al cargar las imágenes.',
      }
    );

    /*await fetch('/api/peticiones', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imagenes: finalFiles,
        ...datos,
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Error al guardar las imágenes');
      }
    });*/

    if (!isPersona) {
      toast.error(
        'No se ha podido verificar la identidad, por favor intenta nuevamente'
      );
      return;
    }
    nexStep();
  };

  const handleIconClick = (index: number) => {
    if (isMobile()) {
      setCurrentIndex(index);
      if (!showModal) setShowModal(true);
    } else {
      inputRefs[index].current?.click();
    }
  };

  const handleModalOption = (option: 'camera' | 'gallery') => {
    if (currentIndex !== null) {
      setCaptureMode(false);
      const newCaptureMode = option === 'camera' ? 'environment' : false;
      setCaptureMode(newCaptureMode);
      setTimeout(() => {
        inputRefs[currentIndex]?.current?.click();
        setShowModal(false);
      }, 100);
    }
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
              onClick={() => handleIconClick(index)}
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
                capture={captureMode}
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

      <div className="mt-4 flex flex-col md:flex-row justify-between flex-wrap gap-2">
        <button
          className="bg-red-500 text-white p-2 rounded-md justify-between"
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg space-y-4">
            <h2 className="text-lg font-bold text-center">
              ¿Qué deseas hacer?
            </h2>
            <div className="flex justify-around gap-3">
              <button
                className="bg-blue-500 text-white p-2 rounded-md"
                onClick={() => {
                  handleModalOption('camera');
                }}
              >
                Tomar Foto
              </button>
              <button
                className="bg-green-500 text-white p-2 rounded-md"
                onClick={() => {
                  handleModalOption('gallery');
                }}
              >
                Subir desde Galería
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Contenedor solo para el grid con scroll */}
            <div className="overflow-y-auto max-h-[70vh]">
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
