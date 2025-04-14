import { useEffect, useState } from 'react';

function Paso3({
  saveData,
  data,
  nexStep,
  prevStep,
}: {
  saveData: (data: any) => void;
  data: any;
  nexStep: () => void;
  prevStep: () => void;
}) {
  const [datos, setDatos] = useState({
    edad: 0,
    genero: '',
    estatura: 0,
    peso: 0,
    imc: 0,
    riesgo: '',
  });

  const evaluarRiesgo = (imc: number) => {
    if (imc < 18.5) return 'bajo peso';
    if (imc >= 18.5 && imc < 24.9) return 'bajo'; // Para que salga como en tu imagen
    if (imc >= 25 && imc < 29.9) return 'medio';
    return 'alto';
  };

  useEffect(() => {
    if (!data) return;
    if (data.peticion) {
      const tmp = {
        edad: data.peticion.edad,
        genero: data.peticion.sexo,
        peso: data.peticion.peso || 0,
        estatura: data.peticion.estatura || data.estatura || 0, // Mostrar cm
        imc: data.peticion.imc || 0,
        riesgo: data.peticion.riesgo || 0,
      };
      setDatos(tmp);
      return;
    }
    const estaturaEnMetros =
      data.estatura > 3 ? data.estatura / 100 : data.estatura;

    const imc = data.peso / (estaturaEnMetros * estaturaEnMetros) || 0;

    const tmp = {
      edad: data.edad,
      genero: data.genero,
      estatura: data.estatura || 0, // Mostrar cm
      peso: data.peso || 0,
      imc,
      riesgo: evaluarRiesgo(imc),
    };
    setDatos(tmp);
  }, [data]);

  const handleCerrarSesion = () => {
    fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = '/';
        } else {
          alert('Error al cerrar sesión');
        }
      })
      .catch((error) => console.error('Error:', error));
  };

  const handleReloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6  space-y-4">
      <div className="border rounded-md">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="p-2 font-semibold">Edad aproximada</td>
              <td className="p-2 text-right">{datos.edad}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">Sexo</td>
              <td className="p-2 text-right">{datos.genero}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">Estatura y peso</td>
              <td className="p-2 text-right">
                {datos.estatura} y {datos.peso} kg
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2 font-semibold">
                IMC (Índice de masa corporal)
              </td>
              <td className="p-2 text-right">{datos.imc.toFixed(1)}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold">Evaluación de Riesgo</td>
              <td className="p-2 text-right">{datos.riesgo}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <div
          className={`inline-block px-4 py-2 rounded-md font-semibold text-white ${
            datos.riesgo === 'bajo'
              ? 'bg-green-500'
              : datos.riesgo === 'medio'
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
        >
          Candidato{' '}
          {datos.riesgo === 'bajo'
            ? 'aceptable'
            : datos.riesgo === 'medio'
              ? 'requiere seguimiento'
              : 'no aceptable'}
        </div>

        <div className="flex flex-col items-center justify-center gap-1">
          <button
            className="mt-4 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
            onClick={handleReloadPage}
          >
            Volver a empezar
          </button>
          <button
            className="mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            onClick={handleCerrarSesion}
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </div>
  );
}

export default Paso3;
