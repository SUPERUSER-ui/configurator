import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const vehicleData = {
  ix: {
    name: "iX",
    models: [
      {
        id: "xdrive50",
        name: "iX xDrive50",
        year: "2025",
        price: "87,100",
        specs: {
          power: "516",
          range: "303-309 mi",
          acceleration: "4.4 sec",
        },
        features: [
          "Dual all-electric motors",
          "xDrive dual-motor all-wheel-drive",
        ],
        image: "/src/assets/images/xdrive50.png",
      },
      {
        id: "m60",
        name: "iX M60",
        year: "2025",
        price: "111,500",
        specs: {
          power: "610",
          range: "285 mi",
          acceleration: "3.6 sec",
        },
        features: [
          "Dual high-performance electric motors",
          "xDrive dual-motor all-wheel-drive",
        ],
        image: "/src/assets/images/m60.webp",
      },
    ],
  },
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
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={20} />
            <span>{vehicle.name} Sports Activity Vehicle</span>
          </Link>
        </div>
      </div>

      {/* Model Selection */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            DESIGN YOUR {vehicle.name}
          </h1>
          <p className="text-gray-600">Select a model below.</p>
        </div>

        {/* Models */}
        <div className="space-y-8">
          {vehicle.models.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-8">
                {/* Columna izquierda */}
                <div className="md:col-span-4">
                  {/* Año y nombre del modelo */}
                  <div className="mb-2">
                    <div className="text-sm text-gray-600">{model.year}</div>
                    <h2 className="text-2xl font-bold">{model.name}</h2>
                  </div>

                  {/* Características */}
                  <div className="space-y-1 mb-6">
                    {model.features.map((feature, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Especificaciones en línea */}
                  <div className="flex flex-row">
                    <div className="flex flex-col items-start mr-4">
                      <span className="text-xl font-bold">516</span>
                      <span className="text-sm text-gray-600 mb-1">
                        Max. HP
                      </span>
                    </div>
                    <div className="flex flex-col items-start mr-4">
                      <span className="text-xl font-bold">
                        303-309 mi{" "}
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700 relative group"
                          title="Manufacturer's Suggested Retail Price"
                        >
                          <svg
                            role="img"
                            tabIndex={-1}
                            aria-label="tooltip"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                            />
                          </svg>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-sm rounded shadow-lg w-64 invisible group-hover:visible" style={{ zIndex: 1000 }}>
                            Estimated ranges attainable when battery fully charged & under ideal driving conditions. Actual range will vary depending on multiple factors, including but not limited to: vehicle model, tire & wheel selections, driving style.
                          </div>
                        </button>
                      </span>
                      <span className="text-sm text-gray-600 mb-1">Range</span>
                    </div>
                    <div className="flex flex-col items-start mr-4">
                      <span className="text-xl font-bold">
                        4.4 sec{" "}
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700 relative group"
                          title="Manufacturer's Suggested Retail Price"
                        >
                          <svg
                            role="img"
                            tabIndex={-1}
                            aria-label="tooltip"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                            />
                          </svg>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-sm rounded shadow-lg w-64 invisible group-hover:visible">
                          BMW AG preliminary test results. Actual acceleration results may vary, depending on specification of vehicle; road and environmental conditions; testing procedures and driving style.
                          </div>
                        </button>
                      </span>
                      <span className="text-sm text-gray-600 mb-1">
                        0-60 MPH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Columna central - Imagen */}
                <div className="md:col-span-5 relative">
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-full h-full object-contain ml-20"
                  />
                </div>

                {/* Columna derecha - Precio y botón */}
                <div className="md:col-span-3 flex flex-col items-end justify-start">
                  <div className="text-right mb-4">
                    <div className="text-sm text-gray-600">Starting MSRP</div>
                    <div className="text-2xl font-bold">${model.price}</div>
                  </div>
                  <button
                    onClick={() => handleDesignClick(model.id)}
                    className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700"
                  >
                    Design
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
