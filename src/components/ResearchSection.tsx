'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { researchData as researchDataFull } from '../data/researchData';
import { researchData as researchDataCompact } from '../data/researchDataCompact';
import ResearchItem from './ResearchItem';
import { Microscope } from 'lucide-react';

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0, ease: 'easeOut' },
  },
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ResearchSection({
  start = true,
  onDone,
  sectionRef,
}: {
  start?: boolean;
  onDone?: () => void;
  sectionRef?: any;
}) {
  const [data, setData] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 340
      ? researchDataCompact
      : researchDataFull,
  );

  useEffect(() => {
    function handleResize() {
      setData(
        window.innerWidth <= 340 ? researchDataCompact : researchDataFull,
      );
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      id="research"
      className="mt-[50px] w-full tracking-[-0.020em]"
      ref={sectionRef}
    >
      <motion.div
        initial="hidden"
        animate={start ? 'show' : 'hidden'}
        variants={headerVariants}
      >
        <h2 className="text-[1.6rem] font-regular text-[var(--foreground)] mb-2 flex items-center">
          <Microscope className="w-[1em] h-[1em] mr-2 align-middle text-[var(--foreground)]" />
          Research
        </h2>
        <div className="h-[1px] bg-[var(--foreground)]/10 mb-5" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={start ? 'show' : 'hidden'}
      >
        {data.map((exp, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            {...(onDone && index === data.length - 1
              ? { onAnimationStart: onDone }
              : {})}
          >
            <ResearchItem {...exp} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
