import { motion } from "framer-motion";

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 8 + Math.random() * 12,
  delay: Math.random() * 5,
  size: 2 + Math.random() * 4,
}));

export default function Background() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#050816]">

      {/* ========================================= */}
      {/* Base Gradient */}
      {/* ========================================= */}

      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#08111f] to-[#120a2e]" />

      {/* ========================================= */}
      {/* Aurora Layer 1 */}
      {/* ========================================= */}

      <motion.div
        animate={{
          x: [0, 120, -80, 0],
          y: [0, -80, 60, 0],
          rotate: [0, 10, -8, 0],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-56 -top-56 h-[700px] w-[700px] rounded-full bg-cyan-500/15 blur-[180px]"
      />

      {/* ========================================= */}
      {/* Aurora Layer 2 */}
      {/* ========================================= */}

      <motion.div
        animate={{
          x: [0, -100, 60, 0],
          y: [0, 80, -50, 0],
          rotate: [0, -15, 12, 0],
        }}
        transition={{
          duration: 36,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[-220px] top-[10%] h-[650px] w-[650px] rounded-full bg-violet-500/15 blur-[200px]"
      />

      {/* ========================================= */}
      {/* Aurora Layer 3 */}
      {/* ========================================= */}

      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, 50, -30, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-180px] left-[20%] h-[550px] w-[550px] rounded-full bg-blue-400/10 blur-[170px]"
      />

      {/* ========================================= */}
      {/* Center Spotlight */}
      {/* ========================================= */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)]" />

      {/* ========================================= */}
      {/* Grid Overlay */}
      {/* ========================================= */}

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ========================================= */}
      {/* Floating Particles */}
      {/* ========================================= */}

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-cyan-300"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            boxShadow: "0 0 12px rgba(103,232,249,.8)",
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.15, 0.8, 0.15],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ========================================= */}
      {/* Noise Texture */}
      {/* ========================================= */}

      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
        }}
      />

      {/* ========================================= */}
      {/* Vignette */}
      {/* ========================================= */}

      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,.65)_100%)]" />

    </div>
  );
}