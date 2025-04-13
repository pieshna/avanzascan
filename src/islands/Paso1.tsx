import { useState } from 'react';

function Paso1({
  saveData,
  nexStep,
}: {
  saveData: (data: any) => void;
  nexStep: () => void;
}) {
  const [datosPersona, setDatosPersona] = useState({
    nombre: '',
    edad: '',
    genero: '',
    estatura: '',
    peso: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosPersona((prev) => ({
      ...prev,
      [name]:
        name === 'edad' || name === 'estatura' || name === 'peso'
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDatosPersona((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveData(datosPersona);
    nexStep();
  };

  return (
    <div className="m-4 flex flex-col gap-2">
      <h3 className="font-bold">Datos de la Persona</h3>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          className="p-2 border-2 border-gray-300 rounded-md"
          value={datosPersona.nombre}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <input
            type="number"
            name="edad"
            placeholder="Edad"
            className="p-2 border-2 border-gray-300 rounded-md"
            value={datosPersona.edad}
            onChange={handleChange}
          />
          <select
            name="genero"
            className="p-2 border-2 border-gray-300 rounded-md"
            value={datosPersona.genero}
            onChange={handleSelectChange}
          >
            <option value="">Selecciona un género</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="no-binario">No binario</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            name="estatura"
            placeholder="Estatura (cm)"
            className="p-2 border-2 border-gray-300 rounded-md"
            value={datosPersona.estatura}
            onChange={handleChange}
          />
          <input
            type="number"
            name="peso"
            placeholder="Peso (kg)"
            className="p-2 border-2 border-gray-300 rounded-md"
            value={datosPersona.peso}
            onChange={handleChange}
          />
        </div>
        <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Siguiente
        </button>
      </form>
    </div>
  );
}

export default Paso1;
