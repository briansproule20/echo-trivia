'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEcho } from '@merit-systems/echo-react-sdk';

export function DailyStreak() {
  const { user } = useEcho();
  const [streak, setStreak] = useState<number | null>(null);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setStreak(null);
      return;
    }

    const fetchStreak = async () => {
      try {
        const response = await fetch(`/api/streak?echo_user_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setStreak(data.streak?.current_streak ?? 0);
        }
      } catch (error) {
        console.error('Error fetching streak:', error);
      }
    };

    fetchStreak();
  }, [user?.id]);

  const handleClick = () => {
    setShowText(true);
    setTimeout(() => setShowText(false), 2000);
  };

  if (streak === null) return null;

  const hasStreak = streak > 0;

  return (
    <div className="relative">
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-accent/50 transition-colors ${
          hasStreak ? 'text-orange-500' : 'text-muted-foreground'
        }`}
      >
        <motion.div
          animate={hasStreak ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Flame className={`h-4 w-4 ${hasStreak ? 'fill-orange-500' : ''}`} />
        </motion.div>
        <span>{streak}</span>
      </motion.button>

      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-sm font-bold ${
              hasStreak ? 'text-orange-500' : 'text-muted-foreground'
            }`}
          >
            {streak} day streak{streak !== 1 ? '' : ''}!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
