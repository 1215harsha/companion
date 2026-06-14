import { motion } from 'framer-motion';

export default function AnimatedDumbbell({ isLifting }) {
  return (
    <motion.div
      animate={isLifting ? { y: [0, -20, 0] } : { y: 0 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}
    >
      <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="15" width="60" height="10" fill="var(--text-primary)"/>
        <rect x="10" y="5" width="15" height="30" rx="4" fill="var(--text-primary)"/>
        <rect x="75" y="5" width="15" height="30" rx="4" fill="var(--text-primary)"/>
        <rect x="0" y="10" width="10" height="20" rx="2" fill="var(--text-primary)"/>
        <rect x="90" y="10" width="10" height="20" rx="2" fill="var(--text-primary)"/>
      </svg>
    </motion.div>
  );
}
