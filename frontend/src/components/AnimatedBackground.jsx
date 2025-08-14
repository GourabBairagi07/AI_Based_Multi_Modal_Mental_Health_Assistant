import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

const AnimatedBackground = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const floatingVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 20,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      },
    },
  };

  const floatingShapes = [
    { size: 300, top: '10%', left: '5%', color: 'rgba(99, 102, 241, 0.1)', delay: 0 },
    { size: 200, top: '60%', left: '15%', color: 'rgba(168, 85, 247, 0.1)', delay: 0.5 },
    { size: 250, top: '30%', right: '10%', color: 'rgba(236, 72, 153, 0.1)', delay: 1 },
    { size: 350, bottom: '10%', right: '15%', color: 'rgba(59, 130, 246, 0.1)', delay: 1.5 },
    { size: 400, bottom: '20%', left: '20%', color: 'rgba(14, 165, 233, 0.1)', delay: 2 },
  ];

  return (
    <div 
      ref={ref}
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
      }}
    >
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-3xl"
          style={{
            width: shape.size,
            height: shape.size,
            top: shape.top,
            left: shape.left,
            right: shape.right,
            bottom: shape.bottom,
            backgroundColor: shape.color,
          }}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, scale: 0.5 },
            visible: {
              opacity: [0.3, 0.5, 0.3],
              scale: [0.8, 1.2, 0.8],
              x: [0, 50, 0],
              y: [0, -30, 0],
              transition: {
                duration: 20 + index * 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: shape.delay,
              },
            },
          }}
        />
      ))}
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
