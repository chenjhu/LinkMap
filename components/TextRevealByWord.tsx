import { FC } from "react";
import { motion } from "framer-motion";

interface TextRevealByWordProps {
  text: string;
  className?: string;
}

const TextRevealByWord: FC<TextRevealByWordProps> = ({ text, className }) => {
  const chars = Array.from(text);

  return (
    <div className={className}>
      <motion.p
        className="flex flex-wrap text-[20px] font-semibold leading-[1.18] tracking-[-0.03em] text-[#2a2f36]/20"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.06,
            },
          },
        }}
      >
        {chars.map((char, i) => (
          <Char key={i}>{char === " " ? "\u00A0" : char}</Char>
        ))}
      </motion.p>
    </div>
  );
};

interface CharProps {
  children: string;
}

const Char: FC<CharProps> = ({ children }) => {
  return (
    <span className="relative">
      <span className="absolute opacity-25">{children}</span>
      <motion.span
        className="text-[#2a2f36]"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        transition={{
          duration: 0.35,
          ease: "easeOut",
        }}
      >
        {children}
      </motion.span>
    </span>
  );
};

export default TextRevealByWord;