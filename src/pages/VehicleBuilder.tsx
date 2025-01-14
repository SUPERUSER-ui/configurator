import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const vehicleData = {
  ix: {
    name: 'iX',
    models: [
      {
        id: 'xdrive50',
        name: 'iX xDrive50',
        year: '2025',
        price: '87,100',
        specs: {
          power: '516',
          range: '303-309 mi',
          acceleration: '4.4 sec'
        },
        features: [
          'Dual all-electric motors',
          'xDrive dual-motor all-wheel-drive'
        ],
        image: '/src/assets/images/xdrive50.png'
      },
      {
        id: 'm60',
        name: 'iX M60',
        year: '2025',
        price: '111,500',
        specs: {
          power: '610',
          range: '285 mi',
          acceleration: '3.6 sec'
        },
        features: [
          'Dual high-performance electric motors',
          'xDrive dual-motor all-wheel-drive'
        ],
        image: '/src/assets/images/m60.webp'
      }
    ]
  }
};

export function VehicleBuilder() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const vehicle = vehicleData[vehicleId as keyof typeof vehicleData];

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  const handleDesignClick = (modelId: string) => {
    navigate(`/build/${vehicleId}/${modelId}/customize`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={20} />
            <span>{vehicle.name} Sports Activity Vehicle</span>
          </Link>
        </div>
      </div>

      {/* Model Selection */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">DESIGN YOUR {vehicle.name}</h1>
          <p className="text-gray-600">Select a model below.</p>
        </div>

        {/* Models */}
        <div className="space-y-8">
          {vehicle.models.map((model) => (
            <div key={model.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8">
                  <div className="mb-6">
                    <div className="text-sm text-gray-600">{model.year}</div>
                    <h2 className="text-2xl font-bold mb-2">{model.name}</h2>
                    <div className="space-y-1">
                      {model.features.map((feature, index) => (
                        <div key={index} className="text-sm text-gray-600">{feature}</div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <div className="text-2xl font-bold">{model.specs.power}</div>
                      <div className="text-sm text-gray-600">Max. HP</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{model.specs.range}</div>
                      <div className="text-sm text-gray-600">Range</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{model.specs.acceleration}</div>
                      <div className="text-sm text-gray-600">0-60 MPH</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">Starting MSRP</div>
                      <div className="text-xl font-bold">${model.price}</div>
                    </div>
                    <button 
                      onClick={() => handleDesignClick(model.id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                      Design
                    </button>
                  </div>
                </div>

                <div className="relative h-64 md:h-auto">
                  <img 
                    src={model.image} 
                    alt={model.name}
                    className="absolute inset-0 w-full h-full object-scale-down p-6"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}