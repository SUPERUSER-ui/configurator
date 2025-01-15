import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import ixImage from '../assets/images/iX Sports Activity Vehicle.webp';
import i4Image from '../assets/images/i4 Gran Coupe.png';
import sevenSeriesImage from '../assets/images/Series 7.webp';
import x7Image from '../assets/images/X7 Sports Activity Vehicle.webp';

const vehicles = [
  {
    id: 'ix',
    name: 'iX Sports Activity Vehicle',
    price: '87,250',
    priceAsShown: '89,150',
    description: 'The all-electric SAV setting standards for aerodynamics, technology, and luxury.',
    image: ixImage
  },
  {
    id: 'i4',
    name: 'i4 Gran Coupé',
    price: '57,900',
    priceAsShown: '61,650',
    description: 'Cutting-edge all-electric performance in a luxurious four-door sports car.',
    image: i4Image
  },
  {
    id: '7series',
    name: '7 Series Sedan',
    price: '97,300',
    priceAsShown: '99,150',
    description: 'The flagship vehicle of the ultimate fleet.',
    image: sevenSeriesImage
  },
  {
    id: 'x7',
    name: 'X7 Sports Activity Vehicle',
    price: '84,300',
    // priceAsShown: '61,650',
    description: 'The largest and most luxurious Sports Activity Vehicle ever built.',
    image: x7Image
  },
];

export function Home() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const vehicleListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToVehicles = () => {
    vehicleListRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gray-100">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-6xl mb-4 headline-3 uppercase">
            DESIGN YOUR<br />
            ULTIMATE DRIVING<br />
            MACHINE.®
          </h1>
          <button 
            onClick={scrollToVehicles}
            className="bg-blue-600 text-white px-6 py-3 rounded flex items-center space-x-2 hover:bg-blue-700"
          >
            <span>Select a Series</span>
            <ArrowDown size={20} />
          </button>
        </div>
      </div>

      {/* Vehicle List */}
      <div ref={vehicleListRef} className="container mx-auto px-4 py-16">
        <div className="space-y-16">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex flex-col md:flex-row gap-8 border-b pb-16">
              <div className="md:w-2/3">
                <div className="text-8xl text-gray-200 font-light mb-4 absolute">
                  {vehicle.id === 'ix' && 'iX'}
                  {vehicle.id === 'i4' && 'i4'}
                  {vehicle.id === '7series' && '7'}
                  {vehicle.id === 'x7' && 'X7'}
                </div>
                <div className="relative overflow-hidden group">
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="md:w-1/3 flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-light mb-2">{vehicle.name}</h2>
                  <p className="text-gray-600 mb-6">{vehicle.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <span className="text-sm">Starting MSRP</span>
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
                            MSRP: Manufacturer's Suggested Retail Price - The price suggested by the manufacturer before taxes, destination, options and dealer costs.
                          </div>
                        </button>
                      </div>
                      <span className="font-semibold">${vehicle.price}</span>
                    </div>
                    {vehicle.priceAsShown && (
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <span className="text-sm">MSRP as shown</span>
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
                              MSRP as shown: Manufacturer's suggested retail price including options and accessories shown on the display vehicle.
                            </div>
                          </button>
                        </div>
                        <span className="font-semibold">${vehicle.priceAsShown}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link 
                  to={`/build/${vehicle.id}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded text-center hover:bg-blue-700 mt-8 w-40"
                >
                  Select
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-black/80 text-white px-4 py-3 rounded-full flex items-center gap-2 hover:bg-black transition-all duration-300 shadow-lg group"
          aria-label="Back to top"
        >
          <span className="text-sm">Back to top</span>
          <ArrowUp 
            size={20}
            className="transform group-hover:-translate-y-1 transition-transform duration-300" 
          />
        </button>
      )}
    </div>
  );
}