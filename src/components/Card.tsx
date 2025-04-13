import React from 'react';

function Card({
  title = 'AvanzaScan',
  image = 'image',
  descripcion,
  children,
}: {
  title?: string;
  image?: string;
  descripcion: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white shadow-md shadow-gray-600 rounded-lg mx-auto">
      <div className="flex gap-2">
        <img src={image} alt={title} />
        <h1 className="text-blue-900/90 font-bold text-3xl">{title}</h1>
      </div>
      <p className="text-gray-700">{descripcion}</p>
      <div className="flex">{children}</div>
    </div>
  );
}

export default Card;
