import { FC } from "react";
import { motion } from "framer-motion";

interface BrandWordmarkProps {
  text: string;
  className?: string;
}

const BrandWordmark: FC<BrandWordmarkProps> = ({ text, className = "" }) => {
  const pastelGradient =
    "linear-gradient(115deg, #eb7ea3 0%, #f0ba68 24%, #77b7ff 52%, #9e8ced 76%, #5fc5a7 100%)";

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 inset-y-[24%] rounded-full blur-[18px]"
        style={{
          backgroundImage: pastelGradient,
          backgroundSize: "180% 180%",
          opacity: 0.22,
        }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{
          opacity: [0.18, 0.28, 0.18],
          scale: [0.98, 1.02, 0.98],
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          opacity: { duration: 2.2, ease: "easeOut" },
          scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          backgroundPosition: { duration: 12, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.span
        className="relative bg-clip-text text-transparent"
        style={{
          backgroundImage: pastelGradient,
          backgroundSize: "180% 180%",
        }}
        initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          opacity: { duration: 0.7, ease: "easeOut" },
          y: { duration: 0.7, ease: "easeOut" },
          filter: { duration: 0.85, ease: "easeOut" },
          backgroundPosition: { duration: 12, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {text}
      </motion.span>
    </span>
  );
};

export default BrandWordmark;
