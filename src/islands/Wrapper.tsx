import React from 'react';
import Card from '../components/Card';
import Paso1 from './Paso1';
import Paso2 from './Paso2';
import Paso3 from './Paso3';

function Wrapper() {
  const [datos, setDatos] = React.useState({});
  const [index, setIndex] = React.useState(0);

  const saveData = (newData: any) => {
    setDatos((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    setIndex((prev) => prev + 1);
  };

  const prevStep = () => {
    setIndex((prev) => prev - 1);
  };

  return (
    <>
      {index === 0 && (
        <Card descripcion="Por favor, ingresa los datos de la persona a evaluar el riesgo.">
          <Paso1 saveData={saveData} nexStep={nextStep} />
        </Card>
      )}
      {index === 1 && (
        <Card
          descripcion="Por favor, sube una foto del DPI, una foto tipo selfie y una foto de
        cuerpo completo."
        >
          <Paso2 saveData={saveData} nexStep={nextStep} prevStep={prevStep} />
        </Card>
      )}
      {index === 2 && (
        <Card descripcion="">
          <Paso3
            saveData={saveData}
            data={datos}
            nexStep={nextStep}
            prevStep={prevStep}
          />
        </Card>
      )}
    </>
  );
}

export default Wrapper;
