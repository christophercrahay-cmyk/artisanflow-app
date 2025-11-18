export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

