import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Share2, X } from 'lucide-react';
import stonegrayImage from '../assets/images/customized/iX xDrive50/interior/Stonegrey.png';
import blackImage from '../assets/images/customized/iX xDrive50/interior/Black.png';
import mochaImage from '../assets/images/customized/iX xDrive50/interior/Mocha.png';
import oysterImage from '../assets/images/customized/iX xDrive50/interior/Oyster.png';
import alpineWhiteImage from '../assets/images/customized/iX xDrive50/Alphine White.png';
import blackSapphireImage from '../assets/images/customized/iX xDrive50/Black Sapphire Metallic.png';
import darkGraphiteImage from '../assets/images/customized/iX xDrive50/Dark Graphite Metallic.png';
import mineralWhiteImage from '../assets/images/customized/iX xDrive50/Mineral White Metallic.png';


type CustomizationTab = 'exterior' | 'interior';
type InteriorTab = 'upholstery' | 'trim';

interface ColorOption {
  name: string;
  price: number;
  type: 'NON-METALLIC' | 'METALLIC';
  trending?: boolean;
  image: string;
  color?: string;
}

interface UpholsteryOption {
  name: string;
  type: 'PERFORATED_SENSATEC' | 'FINE_TEXTILE';
  price: number;
  image: string;
  color?: string;
  description?: string;
}

const colorOptions: ColorOption[] = [
  {
    name: 'Alpine White',
    price: 0,
    type: 'NON-METALLIC',
    image: alpineWhiteImage,
    color: '#FFFFFF',
  },
  {
    name: 'Black Sapphire Metallic',
    price: 0,
    type: 'METALLIC',
    trending: true,
    image: blackSapphireImage,
    color: '#000000',
  },
  {
    name: 'Dark Graphite Metallic',
    price: 0,
    type: 'METALLIC',
    image: darkGraphiteImage,
    color: '#000000',
  },
  {
    name: 'Mineral White Metallic',
    price: 0,
    type: 'METALLIC',
    image: mineralWhiteImage,
    color: '#F2F4F8',
  }
];

const upholsteryOptions: UpholsteryOption[] = [
  {
    name: 'Oyster',
    type: 'PERFORATED_SENSATEC',
    price: 0,
    image: oysterImage,
    color: '#E5D9D0',
    description: 'Breathable, soft, and crafted for comfort.'
  },
  {
    name: 'Mocha',
    type: 'PERFORATED_SENSATEC',
    price: 0,
    image: mochaImage,
    color: '#8B4513',
    description: 'Breathable, soft, and crafted for comfort.'
  },
  {
    name: 'Black',
    type: 'PERFORATED_SENSATEC',
    price: 0,
    image: blackImage,
    color: '#000000',
    description: 'Breathable, soft, and crafted for comfort.'
  },
  {
    name: 'Stonegray Microfiber/Wool Blend',
    type: 'FINE_TEXTILE',
    price: 2000,
    image: stonegrayImage,
    color: '#808080',
    description: 'Designed for texture, intended for sustainability.'
  }
];

export function VehicleCustomizer() {
  const { vehicleId, modelId } = useParams();
  const [activeTab, setActiveTab] = useState<CustomizationTab>('exterior');
  const [interiorTab, setInteriorTab] = useState<InteriorTab>('upholstery');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedUpholstery, setSelectedUpholstery] = useState(upholsteryOptions[0]);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const basePrice = 118600;

  const getTabStyle = (tab: CustomizationTab) => 
    activeTab === tab ? "text-blue-500 border-b-2 border-blue-500 pb-2" : "text-gray-400 pb-2";

  const getInteriorTabStyle = (tab: InteriorTab) =>
    interiorTab === tab ? "flex-1 bg-black text-white py-2 rounded" : "flex-1 bg-transparent text-black border border-gray-600 py-2 rounded";

  useEffect(() => {
    const handleColorChange = (event: CustomEvent) => {
      const { color } = event.detail;
      const newColor = colorOptions.find(c => c.name === color);
      if (newColor) {
        setSelectedColor(newColor);
      }
    };

    window.addEventListener('changeVehicleColor', handleColorChange as EventListener);
    
    return () => {
      window.removeEventListener('changeVehicleColor', handleColorChange as EventListener);
    };
  }, [colorOptions]);

  useEffect(() => {
    const handleInteriorChange = (event: CustomEvent) => {
      const { upholstery } = event.detail;
      const newUpholstery = upholsteryOptions.find(u => u.name === upholstery);
      if (newUpholstery) {
        setSelectedUpholstery(newUpholstery);
      }
    };

    window.addEventListener('changeInteriorColor', handleInteriorChange as EventListener);
    
    return () => {
      window.removeEventListener('changeInteriorColor', handleInteriorChange as EventListener);
    };
  }, [upholsteryOptions]);

  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const { tab } = event.detail;
      if (tab === 'exterior' || tab === 'interior') {
        setActiveTab(tab as CustomizationTab);
      }
    };

    window.addEventListener('changeTab', handleTabChange as EventListener);
    
    return () => {
      window.removeEventListener('changeTab', handleTabChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const handlePhoneNumber = (event: CustomEvent) => {
      const { phoneNumber } = event.detail;
      setUserPhone(phoneNumber);
      setShowPhoneModal(true);
    };

    window.addEventListener('savePhoneNumber', handlePhoneNumber as EventListener);
    
    return () => {
      window.removeEventListener('savePhoneNumber', handlePhoneNumber as EventListener);
    };
  }, []);

  const handlePhoneSubmit = () => {
    // Aquí podrías agregar la lógica para enviar el número a un backend
    setShowPhoneModal(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white text-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to={`/build/${vehicleId}`} className="flex items-center space-x-2">
              <ArrowLeft size={20} />
              <div>
                <div className="text-xs">2025</div>
                <div>iX xDrive50</div>
              </div>
            </Link>
          </div>
          <div className="flex space-x-12">
            <button 
              onClick={() => setActiveTab('exterior')}
              className={getTabStyle('exterior')}
            >
              Exterior
            </button>
            <button 
              onClick={() => setActiveTab('interior')}
              className={getTabStyle('interior')}
            >
              Interior
            </button>
            <button className="text-gray-400 pb-2">Options</button>
            <button className="text-gray-400 pb-2">Accessories</button>
            <button className="text-gray-400 pb-2">Summary</button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2">
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Vehicle Preview */}
        <div className={`bg-${activeTab === 'exterior' ? 'white' : 'black'} flex-1 min-h-[calc(100vh-64px)] relative transition-colors duration-900`}>
          <div className="relative w-full h-full">
            <img 
              key={activeTab === 'exterior' ? selectedColor.image : selectedUpholstery.image}
              src={activeTab === 'exterior' ? selectedColor.image : selectedUpholstery.image}
              alt={activeTab === 'exterior' ? selectedColor.name : selectedUpholstery.name}
              className="w-full h-full object-contain transition-opacity duration-700 animate-fadeIn"
              onLoad={() => console.log('Image loaded successfully')}
              onError={(e) => {
                console.error('Error loading image:', e.currentTarget.src);
                // Para debugging
                if (activeTab === 'interior' && selectedUpholstery.type === 'FINE_TEXTILE') {
                  console.log('Current upholstery:', selectedUpholstery);
                }
              }}
            />
          </div>

          <div className={`text-${activeTab === 'exterior' ? 'black' : 'white'} absolute`} style={{bottom: '30px', right: '30px'}}>
            <div className="flex items-center space-x-2">
              <span className="text-sm uppercase">MSRP AS BUILT</span>
              <button className={`text-${activeTab === 'exterior' ? 'black' : 'white'} hover:text-gray-300`}>
                <svg 
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="text-4xl font-light mt-1" style={{fontWeight: '500'}}>
              ${(basePrice + (selectedUpholstery?.price || 0)).toLocaleString()}
            </div>
          </div>

          <div className="absolute bottom-8 left-8">
            <div className={`text-${activeTab === 'exterior' ? 'black' : 'white'} space-y-2 transition-all duration-500`}>
              <div className="uppercase text-sm transition-all duration-300">
                {activeTab === 'exterior' ? selectedColor.name : `${selectedUpholstery.name} Perforated SensaTec`}
              </div>
              <div className="text-2xl font-light transition-all duration-300">
                {activeTab === 'exterior' 
                  ? "Brilliant, vibrant colors with a metallic shine."
                  : selectedUpholstery.description}
              </div>
            </div>
          </div>
        </div>

        {/* Customization Panel - Modificado para scroll */}
        <div className="w-96 bg-[#ffffff] text-black flex flex-col h-[calc(100vh-64px)]"> {/* Altura ajustada */}
          {/* Panel contenido scrolleable */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
            {activeTab === 'exterior' ? (
              <>
                <div className="mb-8">
                  <h2 className="text-xl mb-4">Choose your exterior</h2>
                  <div className="flex space-x-4">
                    <button className="flex-1 bg-black text-white py-2 rounded">Color</button>
                    {/* <button className="flex-1 bg-transparent text-black border border-gray-600 py-2 rounded">Wheels</button> */}
                  </div>
                </div>

                {/* Color Options */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm mb-4">NON-METALLIC (1)</h3>
                    {colorOptions
                      .filter(color => color.type === 'NON-METALLIC')
                      .map(color => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={`w-full flex items-center space-x-4 p-4 rounded transition-all duration-300 transform hover:scale-[1.02] ${
                            selectedColor.name === color.name ? 'bg-[#F2F4F8]' : ''
                          }`}
                        >
                          <div 
                            className="w-12 h-12 bg-white rounded-full transition-transform duration-300 hover:scale-110" 
                            style={{ backgroundColor: color.color, border: `0.5px solid black` }} 
                          />
                          <div className="flex-1 text-left">
                            <div className="transition-colors duration-300">{color.name}</div>
                            <div className="text-sm text-gray-400">${color.price}</div>
                          </div>
                        </button>
                      ))}
                  </div>

                  <div>
                    <h3 className="text-sm mb-4">METALLIC (3)</h3>
                    {colorOptions
                      .filter(color => color.type === 'METALLIC')
                      .map(color => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={`w-full flex items-center space-x-4 p-4 rounded transition-all duration-300 transform hover:scale-[1.02] ${
                            selectedColor.name === color.name ? 'bg-[#F2F4F8]' : ''
                          }`}
                        >
                          <div 
                            className="w-12 h-12 bg-gray-600 rounded-full transition-transform duration-300 hover:scale-110" 
                            style={{ backgroundColor: color.color, border: `0.5px solid black` }} 
                          />
                          <div className="flex-1 text-left">
                            <div className="flex items-center space-x-2">
                              <span>{color.name}</span>
                              {/* {color.trending && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                  Trending Look
                                </span>
                              )} */}
                            </div>
                            <div className="text-sm text-gray-400">${color.price}</div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl mb-4">Choose your interior</h2>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setInteriorTab('upholstery')}
                      className={getInteriorTabStyle('upholstery')}
                    >
                      Upholstery
                    </button>
                    {/* <button 
                      onClick={() => setInteriorTab('trim')}
                      className={getInteriorTabStyle('trim')}
                    >
                      Trim
                    </button> */}
                  </div>
                </div>

                {/* Upholstery Options */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm mb-4">PERFORATED SENSATEC (3)</h3>
                    {upholsteryOptions
                      .filter(option => option.type === 'PERFORATED_SENSATEC')
                      .map(option => (
                        <button
                          key={option.name}
                          onClick={() => setSelectedUpholstery(option)}
                          className={`w-full flex items-center space-x-4 p-4 rounded transition-all duration-300 transform hover:scale-[1.02] ${
                            selectedUpholstery.name === option.name ? 'bg-[#F2F4F8]' : ''
                          }`}
                        >
                          <div 
                            className="w-12 h-12 rounded-full transition-transform duration-300 hover:scale-110" 
                            style={{ backgroundColor: option.color }}
                          />
                          <div className="flex-1 text-left">
                            <div className="transition-colors duration-300">{option.name}</div>
                            <div className="text-sm text-gray-400">${option.price}</div>
                          </div>
                        </button>
                      ))}
                  </div>

                  <div>
                    <h3 className="text-sm mb-4">FINE TEXTILE (1)</h3>
                    {upholsteryOptions
                      .filter(option => option.type === 'FINE_TEXTILE')
                      .map(option => (
                        <button
                          key={option.name}
                          onClick={() => setSelectedUpholstery(option)}
                          className={`w-full flex items-center space-x-4 p-4 rounded transition-all duration-300 transform hover:scale-[1.02] ${
                            selectedUpholstery.name === option.name ? 'bg-[#F2F4F8]' : ''
                          }`}
                        >
                          <div 
                            className="w-12 h-12 rounded-full transition-transform duration-300 hover:scale-110" 
                            style={{ backgroundColor: option.color }}
                          />
                          <div className="flex-1 text-left">
                            <div className="transition-colors duration-300">{option.name}</div>
                            <div className="text-sm text-gray-400">${option.price}</div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Botones fijos en la parte inferior */}
          <div className="border-t border-gray-200">
            <button 
              onClick={() => setShowPhoneModal(true)}
              className="w-full bg-white-900 text-black py-3 hover:bg-gray-100"
            >
              <div className="flex items-center justify-between px-4">
                <span className="font-bold">Get Your Quote</span>
                <ChevronRight size={20} />
              </div>
            </button>
            <button className="w-full bg-blue-600 text-white py-3 hover:bg-blue-700">
              <div className="flex items-center justify-between px-4">
                <span className="font-bold">Next</span>
                <ChevronRight size={20} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de teléfono */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white p-8 rounded-lg shadow-xl w-[600px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Confirm phone number</h3>
                <p className="text-gray-500">BMW iX xDrive50</p>
              </div>
              <button 
                onClick={() => setShowPhoneModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X size={28} />
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700 text-lg mb-6">
                Please verify your phone number so we can contact you about your customized BMW.
              </p>
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: +1 123 456 789"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPhoneModal(false)}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-md text-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePhoneSubmit}
                className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}