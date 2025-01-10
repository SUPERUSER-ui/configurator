import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const vehicles = [
  {
    id: 'ix',
    name: 'iX Sports Activity Vehicle',
    price: '87,100',
    image: '/src/assets/images/iX Sports Activity Vehicle.webp'
  },
  {
    id: 'i4',
    name: 'i4 Gran Coupé',
    price: '52,200',
    image: '/src/assets/images/i4 Gran Coupe.png',
  },
  {
    id: '7series',
    name: '7 Series',
    price: '96,400',
    image: '/src/assets/images/Series 7.webp',
  },
  {
    id: 'x7',
    name: 'X7 Sports Activity Vehicle',
    price: '77,850',
    image: '/src/assets/images/X7 Sports Activity Vehicle.webp',
  },
];

export function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gray-100">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">
            DESIGN YOUR<br />
            ULTIMATE DRIVING<br />
            MACHINE.®
          </h1>
          <button className="bg-blue-600 text-white px-6 py-3 rounded flex items-center space-x-2 hover:bg-blue-700">
            <span>Start Now</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="group cursor-pointer">
              <div className="relative overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-4 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{vehicle.name}</h3>
                  <p className="text-gray-600">Starting at ${vehicle.price}</p>
                </div>
                <Link 
                  to={`/build/${vehicle.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Select
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}