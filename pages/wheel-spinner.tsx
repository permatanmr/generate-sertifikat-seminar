// import React, { useEffect, useState } from 'react';

// // Simple wheel spinner component
// const WheelSpinner: React.FC = () => {
//   const [names, setNames] = useState<string[]>([]);
//   const [selected, setSelected] = useState<number | null>(null);
//   const [spinning, setSpinning] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // Get workshop id from query string, fetch workshop name, then get certificates
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const workshopId = params.get('workshopId');
//     if (!workshopId) return;
//     setIsLoading(true);

//     // Step 1: Get workshop name by id
//     fetch(`/api/get-submission/${encodeURIComponent(workshopId)}`)
//       .then(res => res.json())
//       .then(workshopData => {
//         const workshopName = workshopData.submission?.workshop_title;
//         console.log("Workshop Data:", workshopData);
//         if (!workshopName) return;
//         // Step 2: Get certificates by workshop name
//         fetch(`/api/get-certificate/${encodeURIComponent(workshopName)}`)
//           .then(res => res.json())
//           .then(data => {
//             console.log("Certificates Data:", data.submission );
//             setNames(data.submission.map((item: any) => item.name));
//             setIsLoading(false);
//           });
//       });
//   }, []);

//   const spinWheel = () => {
//     setSpinning(true);
//     setSelected(null);
//     // Simulate spinning animation
//     setTimeout(() => {
//       const winner = Math.floor(Math.random() * names.length);
//       setSelected(winner);
//       setSpinning(false);
//     }, 2000);
//   };

//   return (
//     <div style={{ textAlign: 'center', marginTop: 40 }}>
//       <h1>Wheel Spinner</h1>
//       <div style={{ margin: '30px auto', width: 300, height: 300, position: 'relative', borderRadius: '50%', border: '8px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
//         {isLoading ? (
//           <p>Loading names...</p>
//         ) : (
//           <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
//             {names.map((name, idx) => (
//               <li
//                 key={name + '-' + idx}
//                 style={{
//                   position: 'absolute',
//                   left: '50%',
//                   top: '50%',
//                   transform: `rotate(${(360 / names.length) * idx}deg) translate(120px) rotate(-${(360 / names.length) * idx}deg)`,
//                   transformOrigin: '0 0',
//                   fontWeight: selected === idx ? 'bold' : 'normal',
//                   color: selected === idx ? 'red' : '#333',
//                   fontSize: 18,
//                   transition: 'color 0.3s, font-weight 0.3s',
//                 }}
//               >
//                 {name}
//               </li>
//             ))}
//           </ul>
//         )}
//         {!isLoading && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
//           <span style={{ fontSize: 32, color: '#888' }}>🎯</span>
//         </div>}
//       </div>
//       <button onClick={spinWheel} disabled={spinning || names.length === 0} style={{ fontSize: 20, padding: '10px 30px', borderRadius: 8, background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}>
//         {spinning ? 'Spinning...' : 'Spin'}
//       </button>
//       {selected !== null && (
//         <div style={{ marginTop: 30 }}>
//           <h2>Winner: <span style={{ color: 'green' }}>{names[selected]}</span></h2>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WheelSpinner;



import React, { useState, useRef } from 'react';

const SpinWheel = () => {
  const [options, setOptions] = useState([
    'Pizza Party', 'Movie Night', 'Ice Cream', 'Game Time', 
    'Park Visit', 'Art Project', 'Dance Party', 'Cooking Together'
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState('');
  const [showWinner, setShowWinner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newOption, setNewOption] = useState('');
  const wheelRef = useRef(null);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const addOption = () => {
    if (newOption.trim() && options.length < 12) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowWinner(false);
    setWinner('');
    
    const spins = Math.random() * 5 + 5; // 5-10 full rotations
    const finalRotation = rotation + spins * 360;
    setRotation(finalRotation);
    
    setTimeout(() => {
      const segmentAngle = 360 / options.length;
      const normalizedRotation = finalRotation % 360;
      const winningIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % options.length;
      
      setWinner(options[winningIndex]);
      setShowWinner(true);
      setIsSpinning(false);
    }, 3000);
  };

  const resetWheel = () => {
    setRotation(0);
    setWinner('');
    setShowWinner(false);
    setIsSpinning(false);
  };

  const renderWheel = () => {
    const segmentAngle = 360 / options.length;
    
    return (
      <div className="relative">
        <svg
          ref={wheelRef}
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className={`transform transition-transform duration-[3000ms] ease-out ${
            isSpinning ? 'animate-spin-wheel' : ''
          }`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {options.map((option, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const x1 = 160 + 150 * Math.cos(startAngleRad);
            const y1 = 160 + 150 * Math.sin(startAngleRad);
            const x2 = 160 + 150 * Math.cos(endAngleRad);
            const y2 = 160 + 150 * Math.sin(endAngleRad);
            
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            const pathData = [
              `M 160 160`,
              `L ${x1} ${y1}`,
              `A 150 150 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            const textAngle = startAngle + segmentAngle / 2;
            const textAngleRad = (textAngle * Math.PI) / 180;
            const textX = 160 + 100 * Math.cos(textAngleRad);
            const textY = 160 + 100 * Math.sin(textAngleRad);
            
            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                >
                  {option.length > 10 ? option.substring(0, 10) + '...' : option}
                </text>
              </g>
            );
          })}
          
          {/* Center circle */}
          <circle cx="160" cy="160" r="20" fill="#2D3748" stroke="#fff" strokeWidth="3" />
        </svg>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
                      <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            ✨ Spin Wheel ✨
          </h1>
          <p className="text-white/80 text-lg">Spin to make your decision!</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Wheel Container */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center">
            <div className="mb-6">
              {renderWheel()}
            </div>
            
            {/* Controls */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={spinWheel}
                disabled={isSpinning}
                className={`px-8 py-3 rounded-full font-bold text-white transition-all duration-200 flex items-center gap-2 ${
                  isSpinning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 shadow-lg'
                }`}
              >
                ▶️ {isSpinning ? 'Spinning...' : 'SPIN!'}
              </button>
              
              <button
                onClick={resetWheel}
                className="px-6 py-3 rounded-full font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-200 flex items-center gap-2"
              >
                🔄 Reset
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-6 py-3 rounded-full font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-200 flex items-center gap-2"
              >
                ⚙️ Settings
              </button>
            </div>

            {/* Winner Display */}
            {showWinner && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl text-center animate-bounce">
                <h2 className="text-2xl font-bold mb-2">🎉 Winner! 🎉</h2>
                <p className="text-xl">{winner}</p>
              </div>
            )}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full lg:w-80">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Wheel Options</h3>
              
              {/* Add new option */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addOption()}
                    placeholder="Add new option..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    maxLength={20}
                  />
                  <button
                    onClick={addOption}
                    disabled={!newOption.trim() || options.length >= 12}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {options.length}/12 options
                </p>
              </div>
              
              {/* Current options */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Current Options:</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm truncate flex-1 mr-2">{option}</span>
                      <button
                        onClick={() => removeOption(index)}
                        disabled={options.length <= 2}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin-wheel {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-wheel {
          animation: spin-wheel 3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SpinWheel;