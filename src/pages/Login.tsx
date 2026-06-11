import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sparkles, User, ArrowRight, Star } from 'lucide-react';
import MagicButton from '@/components/MagicButton';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useUIStore } from '@/store/useUIStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = usePlayerStore();
  const { showToast } = useUIStore();

  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  const handleGuestLogin = async () => {
    setIsLoggingIn(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      login({
        id: 'guest-1',
        nickname: '梦境旅人',
        avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=guest',
        level: 1,
        exp: 0,
        experience: 0,
        maxExperience: 100,
        coins: 10000,
        dreamFragments: 100,
        materials: 50,
        arenaPoints: 0,
        createdAt: new Date().toISOString(),
      });
      showToast({
        type: 'success',
        title: '登录成功',
        content: '欢迎来到梦境编织世界！',
      });
      navigate('/home');
    } catch (error) {
      showToast({
        type: 'error',
        title: '登录失败',
        content: '请稍后重试',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-dream-dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-dream-purple/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-dream-blue/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-dream-gold/15 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        <div className="absolute inset-0 starfield opacity-50" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-screen flex flex-col"
      >
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-4xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={itemVariants} className="text-center lg:text-left">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dream-purple/20 border border-dream-purple/30 mb-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <Moon className="w-4 h-4 text-dream-purple" />
                  <span className="text-sm font-medium text-dream-purple">梦境编织系统 v1.0</span>
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="gradient-text">梦境编织</span>
                  <br />
                  <span className="text-white">世界</span>
                </h1>

                <p className="text-lg text-dream-light/70 mb-8 leading-relaxed">
                  在无限的梦境世界中编织你的想象力。
                  创建独特的梦境场景，与其他玩家对战，
                  探索潜意识的奥秘，成为最强的梦境编织师！
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: '🎨', label: '自由编织', desc: '无限创造' },
                    { icon: '⚔️', label: '实时对战', desc: '策略对决' },
                    { icon: '🌙', label: '探索梦境', desc: '无尽冒险' },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      className="text-center p-4 rounded-2xl bg-dream-purple/10 border border-dream-purple/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.05, y: -4 }}
                    >
                      <div className="text-3xl mb-2">{feature.icon}</div>
                      <h4 className="font-bold mb-1">{feature.label}</h4>
                      <p className="text-xs text-dream-light/50">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <MagicButton
                    size="lg"
                    onClick={handleGuestLogin}
                    disabled={isLoggingIn}
                    className="min-w-48"
                  >
                    {isLoggingIn ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        正在进入...
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5" />
                        游客登录
                      </>
                    )}
                  </MagicButton>

                  <MagicButton
                    size="lg"
                    variant="secondary"
                    className="min-w-48"
                  >
                    <Sparkles className="w-5 h-5" />
                    账号登录
                    <ArrowRight className="w-5 h-5" />
                  </MagicButton>
                </div>

                <p className="mt-6 text-sm text-dream-light/40">
                  登录即表示同意《用户协议》和《隐私政策》
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <div className="relative">
                  <motion.div
                    className="aspect-square rounded-3xl bg-gradient-to-br from-dream-purple/30 via-dream-blue/20 to-dream-gold/20 border border-dream-purple/30 backdrop-blur-xl p-8 relative overflow-hidden"
                    animate={{
                      boxShadow: [
                        '0 0 60px rgba(155, 93, 229, 0.3)',
                        '0 0 100px rgba(155, 93, 229, 0.5)',
                        '0 0 60px rgba(155, 93, 229, 0.3)',
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                          }}
                        >
                          <Star className={`w-${4 + Math.floor(Math.random() * 4)} h-${4 + Math.floor(Math.random() * 4)} text-dream-gold`} />
                        </motion.div>
                      ))}
                    </div>

                    <div className="relative z-10 h-full flex flex-col items-center justify-center">
                      <motion.div
                        className="text-8xl mb-6"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        🌙
                      </motion.div>

                      <h3 className="text-2xl font-bold mb-2 gradient-text">欢迎来到梦境</h3>
                      <p className="text-dream-light/60 text-center mb-8">
                        在这里，想象力就是你的超能力
                      </p>

                      <div className="grid grid-cols-2 gap-4 w-full">
                        {[
                          { label: '在线玩家', value: '12,847', icon: '👥' },
                          { label: '梦境总数', value: '156,234', icon: '🌟' },
                          { label: '今日对战', value: '8,562', icon: '⚔️' },
                          { label: '今日交易', value: '23,891', icon: '💰' },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            className="p-4 rounded-2xl bg-dream-dark/30 border border-dream-purple/20 text-center"
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="text-2xl mb-1">{stat.icon}</div>
                            <div className="font-bold gradient-text">{stat.value}</div>
                            <div className="text-xs text-dream-light/50">{stat.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -top-4 -right-4 text-5xl"
                    animate={{
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-4 -left-4 text-4xl"
                    animate={{
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                  >
                    💫
                  </motion.div>
                  <motion.div
                    className="absolute top-1/2 -right-8 text-3xl"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    ⭐
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.footer
          variants={itemVariants}
          className="py-6 text-center text-dream-light/40 text-sm"
        >
          <p>© 2024 梦境编织系统 | 用想象力创造无限可能</p>
        </motion.footer>
      </motion.div>
    </div>
  );
}
