interface AmbientBackgroundProps {
  colors: string[];
}

export const AmbientBackground = ({ colors }: AmbientBackgroundProps) => {
  const positions = [
    { top: '-10%', left: '-10%' },
    { top: '-10%', right: '-10%' },
    { bottom: '-10%', left: '-10%' },
    { bottom: '-10%', right: '-10%' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {colors.slice(0, 4).map((color, index) => (
        <div
          key={index}
          className="ambient-blob"
          style={{
            ...positions[index],
            backgroundColor: color,
            animationDelay: `${index * 0.5}s`,
          }}
        />
      ))}

      <style>{`
        .ambient-blob {
          position: absolute;
          width: 40vw;
          height: 40vw;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float-animation 20s ease-in-out infinite;
        }

        @keyframes float-animation {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, 20px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(20px, -20px) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};
