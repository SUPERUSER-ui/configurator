import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';

type CustomizationTab = 'exterior' | 'interior';
type InteriorTab = 'upholstery' | 'trim';

interface ColorOption {
  name: string;
  price: number;
  type: 'NON-METALLIC' | 'METALLIC';
  trending?: boolean;
  image: string;
}

interface UpholsteryOption {
  name: string;
  type: 'PERFORATED_SENSATEC' | 'FINE_TEXTILE';
  price: number;
  image: string;
  color?: string;
}

const colorOptions: ColorOption[] = [
  {
    name: 'Alpine White',
    price: 0,
    type: 'NON-METALLIC',
    image: '/src/assets/images/customized/iX xDrive50/Alphine White.png'
  },
  {
    name: 'Black Sapphire Metallic',
    price: 0,
    type: 'METALLIC',
    trending: true,
    image: '/src/assets/images/customized/iX xDrive50/Black Sapphire Metallic.png'
  },
  {
    name: 'Dark Graphite Metallic',
    price: 0,
    type: 'METALLIC',
    image: '/src/assets/images/customized/iX xDrive50/Dark Graphite Metallic.png'
  },
  {
    name: 'Mineral White Metallic',
    price: 0,
    type: 'METALLIC',
    image: '/src/assets/images/customized/iX xDrive50/Mineral White Metallic.png'
  }
];

const upholsteryOptions: UpholsteryOption[] = [
  {
    name: 'Oyster',
    type: 'PERFORATED_SENSATEC',
    price: 0,
    image: '/src/assets/images/customized/iX xDrive50/interior/Oyster.png',
    color: '#E5D9D0'
  },
  {
    name: 'Mocha',
    type: 'PERFORATED_SENSATEC',
    price: 0,
    image: '/src/assets/images/customized/iX xDrive50/interior/Mocha.png',
    color: '#8B4513'
  },
  {
    name: 'Black',
    type: 'PERFORATED_SENSATEC',
    price: 0,
    image: '/src/assets/images/customized/iX xDrive50/interior/Black.png',
    color: '#000000'
  },
  {
    name: 'Stonegray Microfiber/Wool Blend',
    type: 'FINE_TEXTILE',
    price: 2000,
    image: '/src/assets/images/customized/iX xDrive50/interior/Stonegray Microfiber Wool Blend.png',
    color: '#808080'
  }
];

export function VehicleCustomizer() {
  const { vehicleId, modelId } = useParams();
  const [activeTab, setActiveTab] = useState<CustomizationTab>('exterior');
  const [interiorTab, setInteriorTab] = useState<InteriorTab>('upholstery');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedUpholstery, setSelectedUpholstery] = useState(upholsteryOptions[0]);
  const basePrice = 118600;

  const getTabStyle = (tab: CustomizationTab) => 
    activeTab === tab ? "text-blue-500 border-b-2 border-blue-500 pb-2" : "text-gray-400 pb-2";

  const getInteriorTabStyle = (tab: InteriorTab) =>
    interiorTab === tab ? "flex-1 bg-white text-black py-2 rounded" : "flex-1 bg-transparent text-white border border-gray-600 py-2 rounded";

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

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Bar */}
      <nav className="bg-black text-white border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to={`/build/${vehicleId}`} className="flex items-center space-x-2">
              <ArrowLeft size={20} />
              <div>
                <div className="text-xs">2025</div>
                <div>iX M60</div>
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
        <div className="flex-1 min-h-[calc(100vh-64px)] relative">
          <img 
            src={activeTab === 'exterior' ? selectedColor.image : selectedUpholstery.image}
            alt={activeTab === 'exterior' ? selectedColor.name : selectedUpholstery.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error(`Error loading image: ${e.currentTarget.src}`);
              e.currentTarget.src = '/src/assets/images/fallback-image.png';
            }}
          />
          <div className="absolute bottom-8 left-8">
            <div className="text-white space-y-2">
              <div className="uppercase text-sm">
                {activeTab === 'exterior' ? selectedColor.name : 'CASTANEA CHESTNUT PERFORATED LEATHER'}
              </div>
              <div className="text-2xl">
                {activeTab === 'exterior' 
                  ? "Brilliant, vibrant colors with a metallic shine."
                  : "Unmistakable luxury of vegetable-tanned leather, tailored for your seats and dashboard."}
              </div>
            </div>
          </div>
        </div>

        {/* Customization Panel */}
        <div className="w-96 bg-[#1c1c1c] text-white p-6">
          {activeTab === 'exterior' ? (
            <>
              <div className="mb-8">
                <h2 className="text-xl mb-4">Choose your exterior</h2>
                <div className="flex space-x-4">
                  <button className="flex-1 bg-white text-black py-2 rounded">Color</button>
                  <button className="flex-1 bg-transparent text-white border border-gray-600 py-2 rounded">Wheels</button>
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
                        className={`w-full flex items-center space-x-4 p-4 rounded ${
                          selectedColor.name === color.name ? 'bg-gray-800' : ''
                        }`}
                      >
                        <div className="w-12 h-12 bg-white rounded-full" />
                        <div className="flex-1 text-left">
                          <div>{color.name}</div>
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
                        className={`w-full flex items-center space-x-4 p-4 rounded ${
                          selectedColor.name === color.name ? 'bg-gray-800' : ''
                        }`}
                      >
                        <div className="w-12 h-12 bg-gray-600 rounded-full" />
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
                  <button 
                    onClick={() => setInteriorTab('trim')}
                    className={getInteriorTabStyle('trim')}
                  >
                    Trim
                  </button>
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
                        className={`w-full flex items-center space-x-4 p-4 rounded ${
                          selectedUpholstery.name === option.name ? 'bg-gray-800' : ''
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full" style={{ backgroundColor: option.color }} />
                        <div className="flex-1 text-left">
                          <div>{option.name}</div>
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
                        className={`w-full flex items-center space-x-4 p-4 rounded ${
                          selectedUpholstery.name === option.name ? 'bg-gray-800' : ''
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-full" 
                          style={{ backgroundColor: option.color }}
                        />
                        <div className="flex-1 text-left">
                          <div>{option.name}</div>
                          <div className="text-sm text-gray-400">${option.price}</div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* Bottom Actions */}
          <div className="fixed bottom-0 right-0 w-96 bg-[#1c1c1c] p-6 border-t border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm">MSRP AS BUILT</div>
              <div className="text-xl">${(basePrice + (selectedUpholstery?.price || 0)).toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <button className="w-full bg-gray-700 text-white py-3 rounded">
                Get Your Quote
              </button>
              <button className="w-full bg-blue-600 text-white py-3 rounded">
                Next / {activeTab === 'exterior' ? 'Wheels' : 'Trim'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}