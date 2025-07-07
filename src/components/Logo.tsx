export default function Logo({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeConfig = {
    small: { container: 60, hub: 12, node: 8, text: 'text-lg' },
    medium: { container: 80, hub: 16, node: 10, text: 'text-xl' },
    large: { container: 120, hub: 24, node: 16, text: 'text-3xl' }
  }
  
  const config = sizeConfig[size]
  
  return (
    <div className="flex items-center space-x-3">
      <div 
        className="relative flex items-center justify-center"
        style={{ width: config.container, height: config.container }}
      >
        {/* Distribution Lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 animate-pulse" 
               style={{ top: '30%', left: '10%', animationDelay: '0s' }} />
          <div className="absolute w-7 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 animate-pulse" 
               style={{ top: '45%', right: '10%', animationDelay: '0.5s' }} />
          <div className="absolute w-6 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 animate-pulse" 
               style={{ bottom: '30%', left: '15%', animationDelay: '1s' }} />
          <div className="absolute w-5 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 animate-pulse" 
               style={{ bottom: '45%', right: '15%', animationDelay: '1.5s' }} />
        </div>

        {/* Floating Dots */}
        <div className="absolute w-2 h-2 bg-purple-600 rounded-full animate-bounce" 
             style={{ top: '20%', left: '60%', animationDelay: '0s' }} />
        <div className="absolute w-2 h-2 bg-purple-600 rounded-full animate-bounce" 
             style={{ top: '70%', right: '60%', animationDelay: '0.3s' }} />
        <div className="absolute w-2 h-2 bg-purple-600 rounded-full animate-bounce" 
             style={{ bottom: '20%', left: '20%', animationDelay: '0.6s' }} />

        {/* Network Structure */}
        <div className="relative flex items-center justify-center">
          {/* Connection Lines */}
          <div className="absolute w-6 h-0.5 bg-gradient-to-r from-blue-500 to-red-400 opacity-60 transform -rotate-45" 
               style={{ top: '10px', left: '50%', transform: 'translateX(-50%) rotate(-45deg)' }} />
          <div className="absolute w-6 h-0.5 bg-gradient-to-r from-blue-500 to-red-400 opacity-60" 
               style={{ top: '50%', right: '10px', transform: 'translateY(-50%)' }} />
          <div className="absolute w-6 h-0.5 bg-gradient-to-r from-blue-500 to-red-400 opacity-60 transform rotate-45" 
               style={{ bottom: '10px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }} />
          <div className="absolute w-6 h-0.5 bg-gradient-to-r from-blue-500 to-red-400 opacity-60" 
               style={{ top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
          <div className="absolute w-5 h-0.5 bg-gradient-to-r from-blue-500 to-red-400 opacity-60 transform -rotate-30" 
               style={{ top: '32%', right: '32%' }} />
          <div className="absolute w-5 h-0.5 bg-gradient-to-r from-blue-500 to-red-400 opacity-60 transform rotate-30" 
               style={{ bottom: '32%', left: '32%' }} />

          {/* Connection Nodes */}
          <div 
            className="absolute bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-lg animate-pulse"
            style={{ 
              width: config.node, 
              height: config.node,
              top: '4px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              animationDelay: '0s'
            }} 
          />
          <div 
            className="absolute bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-lg animate-pulse"
            style={{ 
              width: config.node, 
              height: config.node,
              top: '50%', 
              right: '4px', 
              transform: 'translateY(-50%)',
              animationDelay: '0.5s'
            }} 
          />
          <div 
            className="absolute bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-lg animate-pulse"
            style={{ 
              width: config.node, 
              height: config.node,
              bottom: '4px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              animationDelay: '1s'
            }} 
          />
          <div 
            className="absolute bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-lg animate-pulse"
            style={{ 
              width: config.node, 
              height: config.node,
              top: '50%', 
              left: '4px', 
              transform: 'translateY(-50%)',
              animationDelay: '1.5s'
            }} 
          />
          <div 
            className="absolute bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-lg animate-pulse"
            style={{ 
              width: config.node, 
              height: config.node,
              top: '20%', 
              right: '20%',
              animationDelay: '2s'
            }} 
          />
          <div 
            className="absolute bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-lg animate-pulse"
            style={{ 
              width: config.node, 
              height: config.node,
              bottom: '20%', 
              left: '20%',
              animationDelay: '2.5s'
            }} 
          />

          {/* Central Hub */}
          <div 
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-xl z-10 animate-bounce"
            style={{ width: config.hub, height: config.hub, animationDuration: '3s' }}
          />
        </div>
      </div>
      
      <div className="flex flex-col">
        <h1 className={`${config.text} font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight`}>
          PromoDistro<span className="text-red-500">.link</span>
        </h1>
        {size !== 'small' && (
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            Distribute • Engage • Convert
          </p>
        )}
      </div>
    </div>
  )
}